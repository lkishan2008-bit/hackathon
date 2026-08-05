import os
import json
import base64
import io
import re
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("[WARNING] Pillow not installed. Image resizing disabled. Run: pip install Pillow")

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Home route - Renders index.html template
@app.route('/')
def home():
    google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY', '')
    return render_template('index.html', google_maps_api_key=google_maps_api_key)

# AI Analysis endpoint - Receives base64 image data and queries Gemini AI
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        image_b64 = data.get('image') or data.get('image_data') 

        if not image_b64:
            return jsonify({"error": "No image data provided"}), 400
        
        image_data_url = image_b64
        language = data.get('language', 'English')
        
        # Split out header (e.g. data:image/jpeg;base64,) if present
        if ',' in image_data_url:
            mime_header, base64_data = image_data_url.split(',', 1)
            mime_type = mime_header.split(';')[0].replace('data:', '')
        else:
            base64_data = image_data_url
            mime_type = 'image/jpeg'
        
        # --- Image validation & resize (max 640px wide) to prevent API timeout/drop ---
        if PIL_AVAILABLE:
            try:
                raw_bytes = base64.b64decode(base64_data)
                img = Image.open(io.BytesIO(raw_bytes))
                max_width = 640
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_size = (max_width, int(img.height * ratio))
                    img = img.resize(new_size, Image.LANCZOS)
                    print(f"[Image] Resized to {img.width}x{img.height}")
                buf = io.BytesIO()
                img.convert('RGB').save(buf, format='JPEG', quality=80)
                base64_data = base64.b64encode(buf.getvalue()).decode('utf-8')
                mime_type = 'image/jpeg'
            except Exception as img_err:
                print(f"[Image] Resize skipped: {img_err}")
        
        # Get Gemini API key
        api_key = os.getenv('GEMINI_API_KEY')
        print(f"API KEY LOADED: {api_key[:10] if api_key else 'MISSING - CHECK .env FILE'}")
        if not api_key:
            # Return safe fallback JSON instead of crashing with 500
            return jsonify({
                "status": "error",
                "description": "Vision temporarily unavailable.",
                "obstacles": [],
                "detected_objects": [],
                "smart_danger": {"detected": False, "type": None, "direction": None, "distance": None},
                "detected_events": {"vehicles": False, "running_people": False, "sudden_darkness": False, "rain": False, "smoke": False}
            }), 200
            
        # Target Gemini 3.5 Flash endpoint (fallback to Gemini 2.5 Flash)
        system_prompt = """
STRICT LANGUAGE RULE: You are AJ, a spatial navigation assistant. You MUST respond ONLY in clear, concise English. Never use non-English words, regional slang, or mixed-language phrasing regardless of the user's accent or input language.

You are AJ, an ultra-fast, intelligent autonomous spatial mapping and voice navigation assistant.
Your responses are being spoken out loud to a user via Text-to-Speech, so speed and clarity are critical.
You must treat the scene as a multi-target spatial radar sensor and strictly separate every single human being detected in the frame into a distinct item in the obstacles JSON response array.

STRICT RULES FOR YOUR OUTPUT:
1. Be extremely concise and conversational. Limit your answers to 1 or 2 short sentences max.
2. Never return markdown formatting like bold (**), italics (*), bullet points, or lists. Speak in pure, clean text.
3. If the user triggers a "Vision scan", instantly describe what is directly ahead of them in a sharp, actionable way (e.g., "There is a clear corridor ahead of you, continue straight." or "Obstacle detected 2 feet ahead on your left.").
4. Avoid fluff, long introductions, or saying "Sure, I can help with that." Just give the direct report immediately.
5. If there are multiple people in the frame, you MUST strictly separate every single human being detected in the frame into a distinct item in the JSON response obstacles array, each with their specific estimated position and distance_m (up to 50 meters), instead of grouping them together.
"""

        # Instruction prompt to return structured JSON
        prompt = """
        Analyze the camera frame comprehensively as a multi-target spatial radar sensor. Describe what matters for safe navigation in the "description" field.
        
        THE VALUE OF THE "description" FIELD MUST FOLLOW THESE RULES (from our System Instruction):
        - Be extremely concise and conversational in {language}. Limit the description to 1 or 2 short sentences max.
        - Never return markdown formatting like bold (**), italics (*), bullet points, or lists. Use pure, clean text.
        - Instantly describe what is directly ahead in a sharp, actionable way (e.g. "There is a clear corridor ahead of you, continue straight." or "Obstacle detected 2 feet ahead on your left.").
        - Avoid fluff, long introductions, or saying "Sure, I can help with that." Just give the direct report immediately.
        - Use CALM language for normal observations (safe paths, ordinary people, quiet streets) and URGENT language for dangers (fast vehicles, hazards, obstacles blocking path).
        
        SPATIAL INTELLIGENCE & BOUNDARY SCANNING:
        - Meticulously scan the absolute boundaries of the image frame, including the far left, far right, and background depths.
        - Explicitly scan the peripheral zones ("aside_left" and "aside_right") for any incoming motion or people sitting/standing at the edges of the room.
        - Categorize anything caught on the extreme lateral boundaries (outer edges of the image) as "aside_left" or "aside_right" in the position field.
        - If the scene context implies a vehicle, person, or object is passing tightly around or behind the user's trajectory (e.g. approaching closely from behind or sides), flag the position as "behind" or "center" and set "smart_danger": {"detected": true, ...} if it is within a 2-step (approx. 5 feet / 1.5 meters) proximity.
        
        OBSTACLE DETECTION & MULTI-TARGET SPATIAL RADAR SENSING:
        - List physical obstacles in the "obstacles" list. Detect:
          * Tiny hazards on the ground/floor (e.g. keys, curbs, small rocks, wires, trash, steps) -> size: "tiny"
          * Macro hazards (e.g. walls, vehicles, doors, large pillars, barriers) -> size: "macro"
          * Normal obstacles (e.g. chairs, tables, people, steps, stairs) -> size: "normal"
          * People positioned "aside" (at the far edges of the frame) or "behind" (approaching blind spots)
        - MULTI-TARGET TRACKING & INDIVIDUAL SEPARATION:
          * Treat the scene as a multi-target spatial radar sensor. You MUST strictly separate every single human being detected in the frame into a distinct item in the JSON response obstacles array instead of grouping them together.
          * If there are multiple people (e.g., 3 people), there must be 3 distinct objects in the JSON payload obstacles list, each with their own calculated "position" and estimated "distance_m" (never return them as a single group).
        - Obstacle labels must be in {language}.
        - Position must be strictly 'left', 'center', 'right', 'aside_left', 'aside_right', or 'behind' in English.
        - Size must be strictly 'tiny', 'normal', or 'macro' in English.
        - Distance (distance_m) must be estimated in meters as a number up to 50.
        
        EVENT DETECTION (detect presence in frame):
        - vehicles: any moving vehicle (car, bike, motorcycle, truck, bus, auto-rickshaw, EV)
        - running_people: any person running, rushing, or moving very quickly
        - sudden_darkness: very low light, pitch black, tunnel, underground
        - rain: rain drops, wet ground, people with umbrellas, puddles from active rain
        - smoke: smoke, fire, thick haze, dust cloud
        
        SMART DANGER (immediate threats requiring evasive action):
        - Detect ANY fast-moving object approaching the camera user on a collision course, or any object/vehicle passing tightly around/behind within a 2-step proximity.
        - Type: "vehicle" | "cycle" | "EV" | "running_person" | "animal"
        - Direction: "left" | "right" | "front" | "behind"
        - Distance: "far" | "medium" | "close"
        
        You MUST respond strictly in this JSON schema:
        {
          "description": "Output description string here",
          "obstacles": [
            {"label": "Obstacle name in {language}", "position": "left|center|right|aside_left|aside_right|behind", "size": "tiny|normal|macro", "distance_m": 12}
          ],
          "detected_events": {
            "vehicles": boolean,
            "running_people": boolean,
            "sudden_darkness": boolean,
            "rain": boolean,
            "smoke": boolean
          },
          "smart_danger": {
            "detected": boolean,
            "type": "vehicle" | "cycle" | "EV" | "running_person" | "animal" | null,
            "direction": "left" | "right" | "front" | "behind" | null,
            "distance": "far" | "medium" | "close" | null
          }
        }
        """.replace("{language}", language)
        
        payload = {
            "systemInstruction": {
                "parts": [
                    {"text": system_prompt}
                ]
            },
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.4,
                "maxOutputTokens": 150
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HARASSMENT",         "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_ONLY_HIGH"}
            ]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Explicitly target lightweight, high-speed gemini-1.5-flash model
        models_to_try = ["gemini-1.5-flash"]
        response = None
        last_error = None
        
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=12)
                if response.status_code == 200:
                    print(f"[Analyze] Success with model: {model_name}")
                    break
                else:
                    last_error = f"HTTP {response.status_code}: {response.text[:200]}"
                    print(f"[Analyze] Model {model_name} failed ({response.status_code}), trying next...")
            except Exception as e:
                import traceback
                last_error = str(e)
                print(f"[Analyze] Model {model_name} exception:")
                traceback.print_exc()
                
        if not response or response.status_code != 200:
            raise ValueError(f"All Gemini models failed. Last error: {last_error}")
        
        gemini_response = response.json()
        # Extract content from response structure and clean markdown fences before json.loads
        text_content = gemini_response['candidates'][0]['content']['parts'][0]['text']
        
        # Clean markdown code blocks
        cleaned_text = text_content.strip()
        if cleaned_text.startswith("```"):
            cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text)
            cleaned_text = re.sub(r"\s*```$", "", cleaned_text)
        cleaned_text = cleaned_text.strip()
        
        parsed_json = json.loads(cleaned_text)
        if not isinstance(parsed_json, dict):
            parsed_json = {}

        # Always guarantee required arrays and fields exist
        parsed_json.setdefault('status', 'success')
        parsed_json.setdefault('obstacles', [])
        parsed_json.setdefault('detected_objects', [])
        parsed_json.setdefault('description', '')

        if not isinstance(parsed_json.get('obstacles'), list):
            parsed_json['obstacles'] = []
        if not isinstance(parsed_json.get('detected_objects'), list):
            parsed_json['detected_objects'] = []

        if 'smart_danger' not in parsed_json:
            parsed_json['smart_danger'] = {
                "detected": False,
                "type": None,
                "direction": None,
                "distance": None
            }
        if 'detected_events' not in parsed_json:
            parsed_json['detected_events'] = {
                "vehicles": False, "running_people": False, "sudden_darkness": False,
                "rain": False, "smoke": False
            }

        return jsonify(parsed_json)
            
    except Exception as e:
        import traceback
        print("=== Gemini API Error or Parse Failure ===")
        print(f"Gemini API Error: {e}")
        traceback.print_exc()
        print("=========================================")
        # ALWAYS return HTTP 200 with a clean, structured payload so frontend never hangs
        return jsonify({
            "status": "error",
            "description": "",
            "obstacles": [],
            "detected_objects": [],
            "smart_danger": {
                "detected": False,
                "type": None,
                "direction": None,
                "distance": None
            },
            "detected_events": {
                "vehicles": False,
                "running_people": False,
                "sudden_darkness": False,
                "rain": False,
                "smoke": False
            }
        }), 200

# Conversational AI endpoint for general Q&A and multilingual assistant queries
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json or {}
        user_message = data.get('message', '').strip()
        language = data.get('language', 'English')

        if not user_message:
            return jsonify({"response": "I didn't catch that. Could you please repeat?"}), 400

        api_key = os.environ.get('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY')
        if not api_key:
            # No key — return a polite, context-aware inline answer without exposing internals
            return jsonify({"response": "I am AJ, your navigation assistant. Please set up my Gemini API key to enable full AI responses."}), 200

        system_prompt = """STRICT LANGUAGE RULE: You are AJ, a spatial navigation assistant. You MUST respond ONLY in clear, concise English. Never use non-English words, regional slang, or mixed-language phrasing regardless of the user's accent or input language.

You are AJ, an ultra-fast, intelligent autonomous spatial mapping and voice navigation assistant for visually impaired users.
Your response will be spoken out loud via Text-to-Speech directly to the user.
STRICT RULES FOR YOUR RESPONSE:
1. Be extremely concise, clear, and direct (1 to 3 short sentences max).
2. Never return markdown formatting like bold (**), italics (*), bullet points, or code blocks. Output plain spoken text only.
3. Always respond in English only. Do NOT switch to any other language even if the user speaks or writes in another language.
4. If the user appears to be speaking a non-English language, politely acknowledge it and respond in English.
"""

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_message}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 150
            }
        }

        headers = {"Content-Type": "application/json"}
        # Explicitly target lightweight, high-speed gemini-1.5-flash model
        models_to_try = ["gemini-1.5-flash"]
        reply_text = None

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                res = requests.post(url, json=payload, headers=headers, timeout=12)
                if res.status_code == 200:
                    g_data = res.json()
                    reply_text = g_data['candidates'][0]['content']['parts'][0]['text']
                    print(f"[Chat] Success with model: {model_name}")
                    break
                else:
                    print(f"[Chat] Model {model_name} failed ({res.status_code}): {res.text[:200]}")
            except Exception as err:
                import traceback
                print(f"[Chat] Model {model_name} exception:")
                traceback.print_exc()

        if not reply_text:
            # Contextual fallback — never expose internal error messages to the user
            reply_text = "I am unable to reach my AI core right now. Please check your internet connection or try again in a moment."

        # Clean markdown characters
        cleaned_reply = re.sub(r'[*#_`]+', '', reply_text).strip()
        return jsonify({"response": cleaned_reply})
    except Exception as e:
        import traceback
        print(f"[Chat] Endpoint exception:")
        traceback.print_exc()
        return jsonify({"response": "I am ready to assist. Please try your question again."}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")

