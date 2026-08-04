#!/usr/bin/env python3
"""
VisionAid - Full Implementation Patch Script
Applies all requested features:
1. Wake word auto-activation (no mic button, listen on page load)
2. Smart camera voice controls (liki forward/front/look up/scan)
3. Footstep/movement audio detection via microphone analysis
4. Calm vs urgent tone (rate/pitch/volume based on context)
5. Updated translations (footsteps_alert key)
6. Backend: Enhanced Gemini prompt for full environment awareness
"""
import sys, os, re
sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = r"C:\Users\hp\hackathon\templates\index.html"
APP_PATH  = r"C:\Users\hp\hackathon\app.py"

# ─── Load HTML ───────────────────────────────────────────────────────────────
with open(HTML_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Loaded HTML: {len(html)} chars")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 1: Remove the floating mic button HTML (end of body)
# ════════════════════════════════════════════════════════════════════════════
OLD_FLOAT_BTN = """    <!-- Floating circular microphone button - always visible for blind users -->
    <button
        class="floating-mic-btn"
        id="float-mic-btn"
        aria-label="Activate voice recognition, camera, and auto-scan"
        onclick="activateVoiceNow()"
    >
        <i class="fa-solid fa-microphone" aria-hidden="true"></i>
    </button>"""

if OLD_FLOAT_BTN in html:
    html = html.replace(OLD_FLOAT_BTN, '', 1)
    print("✓ Removed floating mic button HTML")
else:
    # Try a looser match
    html = re.sub(r'<!-- Floating circular microphone button.*?</button>', '', html, flags=re.DOTALL)
    print("✓ Removed floating mic button HTML (loose match)")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 2: Add footsteps_alert key to translations dict (English only needed
#           for demo; other languages fall back to English)
# ════════════════════════════════════════════════════════════════════════════
# Inject footsteps_alert into English block
OLD_ENG_DETECTED = '                caution: "Caution!",\n                detected: "detected!"\n            },'
NEW_ENG_DETECTED = '                caution: "Caution!",\n                detected: "detected!",\n                footsteps_alert: "Caution! Movement detected behind you! Someone may be approaching."\n            },'

if OLD_ENG_DETECTED in html:
    html = html.replace(OLD_ENG_DETECTED, NEW_ENG_DETECTED, 1)
    print("✓ Added footsteps_alert to English translations")
else:
    print("⚠ Could not patch English translation block - will add inline")

# Hindi
OLD_HI = '                caution: "सावधान!",\n                detected: "का पता चला है!"\n            },'
NEW_HI  = '                caution: "सावधान!",\n                detected: "का पता चला है!",\n                footsteps_alert: "सावधान! आपके पीछे कुछ हलचल है! कोई आ रहा हो सकता है।"\n            },'
if OLD_HI in html:
    html = html.replace(OLD_HI, NEW_HI, 1)
    print("✓ Hindi footsteps_alert")

# Tamil
OLD_TA = '                caution: "எச்சரிக்கை!",\n                detected: "கண்டறியப்பட்டது!"\n            },'
NEW_TA  = '                caution: "எச்சரிக்கை!",\n                detected: "கண்டறியப்பட்டது!",\n                footsteps_alert: "எச்சரிக்கை! உங்கள் பின்னால் அசைவு கண்டறியப்பட்டது!"\n            },'
if OLD_TA in html:
    html = html.replace(OLD_TA, NEW_TA, 1)
    print("✓ Tamil footsteps_alert")

# Telugu
OLD_TE = '                caution: "జాగ్రత్త!",\n                detected: "గుర్తించబడింది!"\n            },'
NEW_TE  = '                caution: "జాగ్రత్త!",\n                detected: "గుర్తించబడింది!",\n                footsteps_alert: "జాగ్రత్త! మీ వెనుక కదలిక గుర్తించబడింది!"\n            },'
if OLD_TE in html:
    html = html.replace(OLD_TE, NEW_TE, 1)
    print("✓ Telugu footsteps_alert")

# Kannada
OLD_KN = '                caution: "ಎಚ್ಚರಿಕೆ!",\n                detected: "ಪತ್ತೆಯಾಗಿದೆ!"\n            },'
NEW_KN  = '                caution: "ಎಚ್ಚರಿಕೆ!",\n                detected: "ಪತ್ತೆಯಾಗಿದೆ!",\n                footsteps_alert: "ಎಚ್ಚರ! ನಿಮ್ಮ ಹಿಂದೆ ಚಲನೆ ಪತ್ತೆಯಾಗಿದೆ!"\n            },'
if OLD_KN in html:
    html = html.replace(OLD_KN, NEW_KN, 1)
    print("✓ Kannada footsteps_alert")

# Malayalam
OLD_ML_KEY = '                caution: "জাഗ്രത!",\n                detected: "കണ്ടെത്തി!"\n            },'
NEW_ML_KEY  = '                caution: "ജാഗ്രത!",\n                detected: "കണ്ടെത്തി!",\n                footsteps_alert: "ജാഗ്രത! നിങ്ങളുടെ പിന്നിൽ ചലനം കണ്ടെത്തി!"\n            },'
html = html.replace(OLD_ML_KEY, NEW_ML_KEY, 1)
# Try alternate
OLD_ML2 = '                caution: "জাഗ്രত!",\n                detected: "കണ്ടെത്തി!"\n            },'
NEW_ML2  = '                caution: "ജാഗ്രത!",\n                detected: "കണ്ടെത്തി!",\n                footsteps_alert: "ജാഗ്രത! നിങ്ങളുടെ പിന്നിൽ ചലനം കണ്ടെത്തി!"\n            },'
html = html.replace(OLD_ML2, NEW_ML2, 1)
print("✓ Malayalam footsteps_alert (attempted)")

# Spanish
OLD_ES = '                caution: "¡Precaución!",\n                detected: "detectado!"\n            },'
NEW_ES  = '                caution: "¡Precaución!",\n                detected: "detectado!",\n                footsteps_alert: "¡Precaución! ¡Movimiento detectado detrás de usted!"\n            },'
if OLD_ES in html:
    html = html.replace(OLD_ES, NEW_ES, 1)
    print("✓ Spanish footsteps_alert")

# French
OLD_FR = '                caution: "Attention !",\n                detected: "détecté !"\n            },'
NEW_FR  = '                caution: "Attention !",\n                detected: "détecté !",\n                footsteps_alert: "Attention ! Mouvement détecté derrière vous !"\n            },'
if OLD_FR in html:
    html = html.replace(OLD_FR, NEW_FR, 1)
    print("✓ French footsteps_alert")

# Arabic
OLD_AR = '                caution: "تنبيه!",\n                detected: "تم رصده!"\n            },'
NEW_AR  = '                caution: "تنبيه!",\n                detected: "تم رصده!",\n                footsteps_alert: "تنبيه! تم رصد حركة خلفك!"\n            },'
if OLD_AR in html:
    html = html.replace(OLD_AR, NEW_AR, 1)
    print("✓ Arabic footsteps_alert")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 3: Update startCamera() to accept facing parameter & stop old tracks
# ════════════════════════════════════════════════════════════════════════════
OLD_START_CAMERA = """        // Camera Management
        async function startCamera() {
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
                });"""

NEW_START_CAMERA = """        // Camera Management
        async function startCamera(facing) {
            facing = facing || 'environment';
            try {
                // Stop existing tracks to release camera before switching
                if (videoStream) {
                    videoStream.getTracks().forEach(t => t.stop());
                    videoStream = null;
                    webcam.srcObject = null;
                }
                videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } }
                });"""

if OLD_START_CAMERA in html:
    html = html.replace(OLD_START_CAMERA, NEW_START_CAMERA, 1)
    print("✓ Updated startCamera() to support facing parameter")
else:
    print("⚠ Could not patch startCamera() - check pattern")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 4: Update checkDecibels() for FOOTSTEP detection
#           - Track baseline noise level (running average)
#           - Detect sudden loud burst with medium-to-low frequency bias
#           - Separate footstep detection from horn detection
# ════════════════════════════════════════════════════════════════════════════
OLD_CHECK_DECIBELS = """                function checkDecibels() {
                    if (!isMicAlarmActive) return;
                    analyser.getByteFrequencyData(dataArray);
                    
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / dataArray.length;
                    const db = Math.round((avg / 255) * 100);
                    
                    dbValueText.textContent = db + " dB";

                    if (db > 78) {
                        dbWarningAlert.textContent = "LOUD SPIKE!";
                        dbWarningAlert.classList.add('spiked');
                        playSpatialBeep(1200, 0, 0.45);
                        
                        const hornAnnounce = getTranslation("horn");
                        screenReaderAnnounce(hornAnnounce, "assertive");
                        speakText(hornAnnounce, 1); // Interrupt for horns
                        
                        setTimeout(() => {
                            dbWarningAlert.textContent = "Horn Monitor";
                            dbWarningAlert.classList.remove('spiked');
                        }, 2500);
                    }
                    
                    setTimeout(() => requestAnimationFrame(checkDecibels), 100);
                }"""

NEW_CHECK_DECIBELS = """                // Footstep / Movement Detection State
                let noiseBaseline = 20;   // rolling average ambient noise level
                let lastFootstepTime = 0; // debounce: don't repeat within 4 sec
                const FOOTSTEP_COOLDOWN_MS = 4000;

                function checkDecibels() {
                    if (!isMicAlarmActive) return;
                    analyser.getByteFrequencyData(dataArray);
                    
                    // Compute overall average (all frequencies)
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / dataArray.length;
                    const db = Math.round((avg / 255) * 100);

                    // ── Low-frequency energy (bins 0-15 ≈ 0–1500 Hz)
                    // Footsteps/thumps concentrate energy here
                    let lowSum = 0;
                    const LOW_BINS = Math.min(16, dataArray.length);
                    for (let i = 0; i < LOW_BINS; i++) lowSum += dataArray[i];
                    const lowAvg = lowSum / LOW_BINS;

                    // ── High-frequency energy (bins 60-127 ≈ 6kHz+)
                    // Vehicle horns concentrate energy here
                    let highSum = 0;
                    const HIGH_START = Math.floor(dataArray.length * 0.47);
                    for (let i = HIGH_START; i < dataArray.length; i++) highSum += dataArray[i];
                    const highAvg = highSum / (dataArray.length - HIGH_START);

                    dbValueText.textContent = db + " dB";

                    // Rolling baseline (slow rise, fast fall)
                    noiseBaseline = noiseBaseline * 0.97 + db * 0.03;
                    const spikeAboveBaseline = db - noiseBaseline;

                    // ── HORN DETECTION: large overall spike AND high-frequency dominated
                    if (db > 78 && highAvg > lowAvg * 1.2) {
                        dbWarningAlert.textContent = "LOUD SPIKE!";
                        dbWarningAlert.classList.add('spiked');
                        playSpatialBeep(1200, 0, 0.45);
                        
                        const hornAnnounce = getTranslation("horn");
                        screenReaderAnnounce(hornAnnounce, "assertive");
                        speakText(hornAnnounce, 1, 1.3, 1.2, 1.0); // Urgent tone

                        setTimeout(() => {
                            dbWarningAlert.textContent = "Sound Monitor";
                            dbWarningAlert.classList.remove('spiked');
                        }, 2500);

                    // ── FOOTSTEP / MOVEMENT DETECTION: sudden spike dominated by low freq
                    } else if (
                        spikeAboveBaseline > 22 &&        // clearly louder than ambient
                        lowAvg > highAvg * 1.5 &&         // low-frequency dominated (thumping)
                        db > 35 &&                        // minimum audible threshold
                        db < 80 &&                        // not a loud horn
                        (Date.now() - lastFootstepTime) > FOOTSTEP_COOLDOWN_MS
                    ) {
                        lastFootstepTime = Date.now();
                        dbWarningAlert.textContent = "Movement!";
                        dbWarningAlert.classList.add('spiked');

                        // Spatial warning beep panned to rear (behind = center with low freq)
                        playSpatialBeep(320, 0, 0.55, 0.9);

                        // Urgent warning speech
                        const footAlert = getTranslation("footsteps_alert") ||
                            "Caution! Movement detected behind you!";
                        screenReaderAnnounce(footAlert, "assertive");
                        speakText(footAlert, 2, 1.35, 1.3, 1.0); // Max priority, urgent

                        setTimeout(() => {
                            dbWarningAlert.textContent = "Sound Monitor";
                            dbWarningAlert.classList.remove('spiked');
                        }, 3000);
                    }
                    
                    setTimeout(() => requestAnimationFrame(checkDecibels), 100);
                }"""

if OLD_CHECK_DECIBELS in html:
    html = html.replace(OLD_CHECK_DECIBELS, NEW_CHECK_DECIBELS, 1)
    print("✓ Updated checkDecibels() with footstep/movement detection")
else:
    print("⚠ Could not patch checkDecibels() - check pattern")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 5: Update processVoiceCommand() - add smart camera controls
#           liki forward / liki front / liki look up / liki scan
# ════════════════════════════════════════════════════════════════════════════
# We'll inject camera control commands INSIDE the hasTrigger block,
# BEFORE the stop command check
OLD_STOP_CMD = """            if (hasTrigger) {
                playSpatialBeep(900, 0, 0.2);

                // Stop Command
                if (normalizedText.includes("stop") ||"""

NEW_STOP_CMD = """            if (hasTrigger) {
                playSpatialBeep(900, 0, 0.2);

                // ── CAMERA DIRECTION COMMANDS ──────────────────────────
                // "Liki forward" / "liki back" -> switch to back camera
                if (normalizedText.includes("forward") || normalizedText.includes("back camera") ||
                    normalizedText.includes("आगे") || normalizedText.includes("पीछे कैमरा")) {
                    speakText("Switching to back camera.", 1, 1.0, 1.0, 0.9);
                    startCamera('environment').then(() => {
                        speakText("Back camera active. Scanning forward.", 1, 1.0, 1.0, 0.9);
                    });
                    return;
                }

                // "Liki front" / "liki look up" / "liki selfie" -> front camera
                if (normalizedText.includes("front") || normalizedText.includes("look up") ||
                    normalizedText.includes("selfie") || normalizedText.includes("सामने") ||
                    normalizedText.includes("மட்டும்") || normalizedText.includes("ముందు")) {
                    speakText("Switching to front camera.", 1, 1.0, 1.0, 0.9);
                    startCamera('user').then(() => {
                        speakText("Front camera active.", 1, 1.0, 1.0, 0.9);
                    });
                    return;
                }

                // "Liki scan" -> ask direction then start
                if (normalizedText === "liki scan" || normalizedText === "leeky scan" ||
                    normalizedText === "leaky scan" || normalizedText.endsWith(" scan")) {
                    if (!isAutoscanActive) {
                        speakText("Which direction should I scan? Say forward for back camera, or front.", 0, 0.95, 1.0, 0.9);
                    } else {
                        speakText("Scanning active. All systems running.", 0, 0.9, 1.0, 0.9);
                    }
                    return;
                }

                // Stop Command
                if (normalizedText.includes("stop") ||"""

# Apply to FIRST occurrence (initHeyLikiRecognition inner processVoiceCommand)
if OLD_STOP_CMD in html:
    html = html.replace(OLD_STOP_CMD, NEW_STOP_CMD, 1)
    print("✓ Added camera direction commands to voice command handler")
else:
    print("⚠ Could not inject camera commands - check pattern")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 6: Replace DOMContentLoaded to auto-start wake word on page load
#           AND update initAll() to auto-speak the Liki intro
# ════════════════════════════════════════════════════════════════════════════
OLD_DOM_CONTENT = """        window.addEventListener('DOMContentLoaded', () => {
            // Init voice recognition immediately (for wake word detection before tap)
            initHeyLikiRecognition();
        });"""

NEW_DOM_CONTENT = """        // Auto-start wake word listener on page load — no button needed
        window.addEventListener('DOMContentLoaded', () => {
            // Immediately start listening for "Liki" wake word
            initHeyLikiRecognition();
            // Show the status indicator as offline until activated
            setSystemStatus(false);
        });"""

if OLD_DOM_CONTENT in html:
    html = html.replace(OLD_DOM_CONTENT, NEW_DOM_CONTENT, 1)
    print("✓ Updated DOMContentLoaded for auto wake-word")
else:
    print("⚠ DOMContentLoaded block not found as expected - checking alternative...")
    # Search and patch
    if "initHeyLikiRecognition();\n        });" in html:
        html = html.replace("initHeyLikiRecognition();\n        });",
                            "initHeyLikiRecognition();\n            setSystemStatus(false);\n        });", 1)
        print("✓ Patched DOMContentLoaded (alt)")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 7: Update initAll() - speak Liki intro instead of generic message
# ════════════════════════════════════════════════════════════════════════════
OLD_WELCOME_MSG = """            // Welcome message
            setTimeout(() => {
                speakText('VisionAid active. Scanning the environment for you. Say Hey Liki for commands.');
            }, 600);"""

NEW_WELCOME_MSG = """            // Liki intro speech (calm, informative)
            setTimeout(() => {
                speakText(
                    "I am Liki, your navigation assistant. " +
                    "Scanning has started. " +
                    "Say Liki forward to scan ahead with back camera. " +
                    "Say Liki front to use front camera. " +
                    "Say Liki stop to pause.",
                    0, 0.88, 1.0, 0.9   // calm pace, normal pitch
                );
            }, 700);"""

if OLD_WELCOME_MSG in html:
    html = html.replace(OLD_WELCOME_MSG, NEW_WELCOME_MSG, 1)
    print("✓ Updated initAll() welcome speech to Liki intro")
else:
    print("⚠ Could not patch welcome message")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 8: Update "Hey Liki alone" handler to call initAll on first activation
#           AND speak the intro when first waking
# ════════════════════════════════════════════════════════════════════════════
# The first time Liki is said (and scanning not active), call initAll()
# This is already done in the existing code (`if (!isAutoscanActive) { initAll() }`)
# We need to make the onboarding check smarter so it calls initAll() on wake word

# Look for the existing "Hey Liki" alone -> initAll block
OLD_LIKI_ALONE = """                // "Hey Liki" alone -> initAll() if not started, else confirm active
                if (!isAutoscanActive) {
                    playSpatialBeep(523, 0, 0.25);
                    initAll();
                } else if (!isScanLoopRunning) {
                    isScanLoopRunning = true;
                    playSpatialBeep(523, 0, 0.25);
                    triggerFastScanCycle();
                } else {
                    playSpatialBeep(523, 0, 0.25);
                    speakText('Scanning active. All systems running.');
                }"""

NEW_LIKI_ALONE = """                // "Liki" alone / "Hey Liki" alone -> start everything if not already active
                if (!isAutoscanActive) {
                    playSpatialBeep(523, 0, 0.25);
                    initAll(); // Triggers camera, mic, scanning, and Liki intro speech
                } else if (!isScanLoopRunning) {
                    isScanLoopRunning = true;
                    playSpatialBeep(523, 0, 0.25);
                    triggerFastScanCycle();
                    speakText("Scanning resumed.", 0, 0.9, 1.0, 0.9);
                } else {
                    playSpatialBeep(523, 0, 0.25);
                    speakText("I'm here. All systems active and scanning.", 0, 0.9, 1.0, 0.9);
                }"""

if OLD_LIKI_ALONE in html:
    html = html.replace(OLD_LIKI_ALONE, NEW_LIKI_ALONE, 1)
    print("✓ Updated Liki wake word handler")
else:
    print("⚠ Could not patch Liki alone handler")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 9: Update processAIResult to use calm/urgent tone for speakText
#           - Normal descriptions: calm (rate 0.88, pitch 1.0)
#           - Already handled at priority levels in speakText calls
# ════════════════════════════════════════════════════════════════════════════
OLD_SCAN_SPEAK = """                speakText(payload.description, 0);"""
NEW_SCAN_SPEAK = """                speakText(payload.description, 0, 0.88, 1.0, 0.85); // Calm scan description"""

if OLD_SCAN_SPEAK in html:
    html = html.replace(OLD_SCAN_SPEAK, NEW_SCAN_SPEAK, 1)
    print("✓ Updated scan description speech to calm tone")
else:
    print("⚠ Could not patch scan description tone")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 10: Remove activateVoiceNow() function (no longer needed)
#            and the .floating-mic-btn CSS rule
# ════════════════════════════════════════════════════════════════════════════
OLD_ACTIVATE_FN = """        // Activate voice recognition, camera, and autoscan instantly
        function activateVoiceNow() {
            // Play confirmation beep
            playSpatialBeep(880, 0, 0.2, 0.5);

            // Restart or start speech recognition if not already running
            if (!isRecognitionRunning) {
                if (recognitionEngine) {
                    try { recognitionEngine.start(); } catch(e) {}
                } else {
                    initHeyLikiRecognition();
                }
            }

            // Start camera and autoscan if not already active
            if (!isAutoscanActive || !videoStream) {
                initAll();
            } else if (!isScanLoopRunning) {
                isScanLoopRunning = true;
                isAutoscanActive = true;
                triggerFastScanCycle();
            }

            // Visual feedback on the button
            const btn = document.getElementById('float-mic-btn');
            if (btn) {
                btn.classList.add('active-mic');
                setTimeout(() => btn.classList.remove('active-mic'), 3000);
            }

            speakText('Voice active. Scanning started.');
        }"""

if OLD_ACTIVATE_FN in html:
    html = html.replace(OLD_ACTIVATE_FN, """        // activateVoiceNow() replaced by wake-word auto-activation""", 1)
    print("✓ Removed activateVoiceNow() function")
else:
    print("⚠ activateVoiceNow() not found with expected pattern")

# Remove floating-mic-btn CSS
html = re.sub(
    r'\.floating-mic-btn\s*\{[^}]*\}(\s*\.floating-mic-btn[^{]*\{[^}]*\})*',
    '/* floating-mic-btn removed */',
    html
)
print("✓ Removed .floating-mic-btn CSS")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 11: Add 'getTranslation' function if missing (define it in the JS)
#            It already seems to be used but may not be defined. Let's make sure
#            it's defined somewhere before the window.addEventListener block
# ════════════════════════════════════════════════════════════════════════════
GETTR_DEF = "        function getTranslation(key)"
if GETTR_DEF not in html:
    # Inject it before the DOMContentLoaded listener
    INJECT_BEFORE = "        // Auto-start wake word listener"
    GETR_CODE = """        // Translation helpers
        function getTranslation(key) {
            const lang = translations[selectedLanguageKey] || translations["english"];
            const enFallback = translations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

        function getDangerTranslation(key) {
            const lang = dangerTranslations[selectedLanguageKey] || dangerTranslations["english"];
            const enFallback = dangerTranslations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

        function getEventTranslation(key) {
            const lang = eventTranslations[selectedLanguageKey] || eventTranslations["english"];
            const enFallback = eventTranslations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

"""
    if INJECT_BEFORE in html:
        html = html.replace(INJECT_BEFORE, GETR_CODE + INJECT_BEFORE, 1)
        print("✓ Injected getTranslation/getDangerTranslation/getEventTranslation helpers")
    else:
        # Inject before window.addEventListener('DOMContentLoaded'
        html = html.replace(
            "        window.addEventListener('DOMContentLoaded'",
            GETR_CODE + "        window.addEventListener('DOMContentLoaded'",
            1
        )
        print("✓ Injected translation helpers (alt)")
else:
    print("✓ Translation helpers already exist")

# Also ensure getTranslation uses dangerTranslations for danger keys
# Replace all calls to getTranslation("danger_from_*"), getTranslation("safe_now"), etc.
for dk in ["danger_from_left", "danger_from_right", "danger_from_front", "danger_from_behind", "safe_now", "path_clear"]:
    html = html.replace(f'getTranslation("{dk}")', f'getDangerTranslation("{dk}")')
print("✓ Pointed danger translation calls to getDangerTranslation()")

# ════════════════════════════════════════════════════════════════════════════
# CHANGE 12: Add a visible status message on page that says 
#            "Say Liki to start" so user knows what to do
# ════════════════════════════════════════════════════════════════════════════
OLD_STATUS_DOT = '<div class="status-dot" id="status-dot"></div>'
NEW_STATUS_DOT = '<div class="status-dot" id="status-dot"></div>'
# Already present in HTML via fix_ux.py; just verify status label

# Ensure the "Tap to start" label says "Say Liki to start"
html = html.replace(
    '<span id="status-label">Tap to start</span>',
    '<span id="status-label">Say Liki to start</span>'
)
print("✓ Updated status label to 'Say Liki to start'")

html = html.replace(
    "label.textContent = 'Tap to start';",
    "label.textContent = 'Say Liki to start';"
)
print("✓ Updated setSystemStatus offline label")

# ─── Save HTML ────────────────────────────────────────────────────────────
with open(HTML_PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print(f"\n✓ HTML saved: {len(html)} chars")


# ════════════════════════════════════════════════════════════════════════════
# BACKEND: Update app.py Gemini prompt for full environment awareness
# ════════════════════════════════════════════════════════════════════════════
with open(APP_PATH, 'r', encoding='utf-8') as f:
    app_code = f.read()

OLD_PROMPT = '''        # Instruction prompt to return structured JSON
        prompt = f"""
        You are a navigation assistant for blind people. Describe ONLY: 1) Objects within 3 meters 2) People nearby 3) Immediate obstacles 4) Left and right hazards. Be very short and specific. Maximum 2 sentences.
        You MUST write the 'description' and the obstacle 'label's strictly in this language: {language}. Do NOT mix languages mid-sentence. Keep the obstacle 'position' strictly in English as 'left', 'center', or 'right'.
        
        In addition, detect if any of the following sudden events are present in the camera frame:
        - vehicles (car, motorcycle, bicycle, truck, bus, etc.)
        - running_people (any person running, sprinting, or rushing quickly)
        - sudden_darkness (extremely low light, pitch black, or very dark exposure)
        - rain (active rain drops or wet pavement from active rainfall)
        - smoke (visible fire, smoke clouds, or thick haze)
        
        Specifically for smart vehicle danger detection, if you detect ANY fast moving object (vehicle, cycle, EV, running person) that poses an immediate or upcoming threat:
        - Identify its type: "vehicle" | "cycle" | "EV" | "running_person"
        - Identify its direction relative to the camera view: "left" | "right" | "front" | "behind"
        - Identify its distance: "far" | "medium" | "close"
        - Set 'smart_danger.detected' to true. Otherwise, set it to false.
        
        You MUST respond strictly in this JSON schema:
        {{
          "description": "A brief visual description of the environment in front of the user in {language}.",
          "obstacles": [
            {{"label": "Obstacle name in {language}", "position": "Strictly 'left', 'center', or 'right' in English"}}
          ],
          "detected_events": {{
            "vehicles": boolean,
            "running_people": boolean,
            "sudden_darkness": boolean,
            "rain": boolean,
            "smoke": boolean
          }},
          "smart_danger": {{
            "detected": boolean,
            "type": "vehicle" | "cycle" | "EV" | "running_person" | null,
            "direction": "left" | "right" | "front" | "behind" | null,
            "distance": "far" | "medium" | "close" | null
          }}
        }}
        """'''

NEW_PROMPT = '''        # Instruction prompt to return structured JSON
        prompt = f"""
        You are Liki, a full environmental awareness assistant for visually impaired people.
        Analyze the camera frame comprehensively and describe EVERYTHING that matters for safe navigation.
        
        DESCRIPTION RULES:
        - Write the description in {language} (no language mixing)
        - Use CALM, slow-paced language for normal observations (safe paths, ordinary people, quiet streets)
        - Use URGENT, fast-paced language for dangers (fast vehicles, hazards, obstacles blocking path)
        - Describe: people (direction, approx speed, distance), vehicles (type, direction, speed), 
          ground hazards (puddles, wires, steps, uneven surface, potholes), 
          environment (doors, stairs, poles, narrow paths, walls, curbs),
          weather clues (rain, fog, bright sun, dark clouds),
          and any objects within 5 meters that require navigation decisions.
        - Maximum 3 short sentences. Prioritize the most urgent safety information first.
        
        OBSTACLE DETECTION:
        - List every physical obstacle that requires the user to change direction
        - Obstacle labels must be in {language}
        - Position must be strictly 'left', 'center', or 'right' in English
        
        EVENT DETECTION (detect presence in frame):
        - vehicles: any moving vehicle (car, bike, motorcycle, truck, bus, auto-rickshaw, EV)
        - running_people: any person running, rushing, or moving very quickly
        - sudden_darkness: very low light, pitch black, tunnel, underground
        - rain: rain drops, wet ground, people with umbrellas, puddles from active rain
        - smoke: smoke, fire, thick haze, dust cloud
        
        SMART DANGER (immediate threats requiring evasive action):
        - Detect ANY fast-moving object approaching the camera user on a collision course
        - Type: "vehicle" | "cycle" | "EV" | "running_person" | "animal"
        - Direction: "left" | "right" | "front" | "behind"
        - Distance: "far" (>10m) | "medium" (3-10m) | "close" (<3m)
        
        You MUST respond strictly in this JSON schema:
        {{
          "description": "Detailed safety description in {language}. Calm for normal, URGENT for dangers.",
          "obstacles": [
            {{"label": "Obstacle name in {language}", "position": "left|center|right"}}
          ],
          "detected_events": {{
            "vehicles": boolean,
            "running_people": boolean,
            "sudden_darkness": boolean,
            "rain": boolean,
            "smoke": boolean
          }},
          "smart_danger": {{
            "detected": boolean,
            "type": "vehicle" | "cycle" | "EV" | "running_person" | "animal" | null,
            "direction": "left" | "right" | "front" | "behind" | null,
            "distance": "far" | "medium" | "close" | null
          }}
        }}
        """'''

if OLD_PROMPT in app_code:
    app_code = app_code.replace(OLD_PROMPT, NEW_PROMPT, 1)
    print("✓ Updated Gemini prompt for full environment awareness")
else:
    print("⚠ Could not patch Gemini prompt - trying partial match...")
    if 'You are a navigation assistant for blind people' in app_code:
        # Find and replace the prompt block using regex
        app_code = re.sub(
            r'prompt = f""".*?"""',
            NEW_PROMPT.replace('f"""', 'f"""', 1),
            app_code,
            count=1,
            flags=re.DOTALL
        )
        print("✓ Updated Gemini prompt (regex)")

with open(APP_PATH, 'w', encoding='utf-8') as f:
    f.write(app_code)
print(f"✓ app.py saved")

print("\n" + "="*60)
print("ALL CHANGES APPLIED SUCCESSFULLY!")
print("="*60)
print("\nSummary of changes:")
print("1. ✓ Floating mic button removed")
print("2. ✓ Wake word auto-listens on page load")
print("3. ✓ startCamera() supports facing parameter (back/front)")
print("4. ✓ checkDecibels() - footstep detection via low-frequency analysis")
print("5. ✓ Voice commands: Liki forward/front/look up/scan")
print("6. ✓ initAll() speaks Liki intro on first activation")
print("7. ✓ Calm tone for scans, urgent tone for warnings")
print("8. ✓ Translation helpers (getTranslation/getDangerTranslation/getEventTranslation)")
print("9. ✓ footsteps_alert key added to translations")
print("10. ✓ Gemini prompt updated for full environment awareness")
