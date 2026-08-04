import re

FILE_PATH = r"C:\Users\hp\hackathon\templates\index.html"
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update lang and interimResults logic
OLD_INIT_START = """            recognitionEngine.continuous = false; // standard single shot to ensure end triggers restart cleanly
            recognitionEngine.interimResults = true;
            recognitionEngine.lang = supportedLanguages[selectedLanguageKey].code;"""

NEW_INIT_START = """            recognitionEngine.continuous = false; // standard single shot to ensure end triggers restart cleanly
            recognitionEngine.interimResults = true;
            recognitionEngine.lang = "en-US"; // Force en-US for better wake word detection"""

html = html.replace(OLD_INIT_START, NEW_INIT_START, 1)

# 2. Update onresult to process interim results for immediate response
OLD_ONRESULT = """            recognitionEngine.onresult = (e) => {
                let finalTranscript = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) {
                        finalTranscript += e.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    transcriptDisplay.textContent = finalTranscript;
                    processVoiceCommand(finalTranscript);
                }
            };"""

NEW_ONRESULT = """            recognitionEngine.onresult = (e) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) {
                        finalTranscript += e.results[i][0].transcript;
                    } else {
                        interimTranscript += e.results[i][0].transcript;
                    }
                }

                const transcriptToProcess = finalTranscript || interimTranscript;
                if (transcriptToProcess) {
                    transcriptDisplay.textContent = transcriptToProcess;
                    processVoiceCommand(transcriptToProcess);
                }
            };"""

html = html.replace(OLD_ONRESULT, NEW_ONRESULT, 1)

# 3. Update onerror and watchdog to handle "not-allowed"
OLD_ONERROR = """            recognitionEngine.onerror = (e) => {
                isRecognitionRunning = false;
                console.warn("SpeechRecog error: ", e.error);
            };"""

NEW_ONERROR = """            recognitionEngine.onerror = (e) => {
                isRecognitionRunning = false;
                console.warn("SpeechRecog error: ", e.error);
                if (e.error === 'not-allowed') {
                    isVoiceRecogActive = false; // Stop watchdog restart loop
                    transcriptDisplay.textContent = "Mic access denied. Tap button to retry.";
                    const btn = document.getElementById('fallback-mic-btn');
                    if (btn) btn.style.display = 'block';
                }
            };"""

html = html.replace(OLD_ONERROR, NEW_ONERROR, 1)

# Add fallback function
FALLBACK_FUNC = """        // activateVoiceNow() replaced by wake-word auto-activation
        function retryMicPermission() {
            isVoiceRecogActive = true;
            const btn = document.getElementById('fallback-mic-btn');
            if (btn) btn.style.display = 'none';
            initHeyLikiRecognition();
            startCamera();
        }"""

html = html.replace("        // activateVoiceNow() replaced by wake-word auto-activation", FALLBACK_FUNC, 1)

# Add fallback button HTML and CSS
BTN_HTML = """
    <!-- Fallback Mic Button -->
    <button id="fallback-mic-btn" style="display:none; position:fixed; bottom:20px; right:20px; z-index:9999; padding:15px; border-radius:50%; background:var(--primary); color:white; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.5);" onclick="retryMicPermission()">
        <i class="fa-solid fa-microphone"></i> Start Mic
    </button>
</body>"""

html = html.replace("</body>", BTN_HTML, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(html)
print("Changes applied successfully.")
