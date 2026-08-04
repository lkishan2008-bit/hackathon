f = open('templates/index.html', 'r', encoding='utf-8')
c = f.read()
f.close()

# Fix 1: Force English language
c = c.replace(
    'recognitionEngine.lang = supportedLanguages[selectedLanguageKey].code;',
    'recognitionEngine.lang = "en-US";'
)

# Fix 2: Process interim results too
old = '''                if (finalTranscript) {
                    transcriptDisplay.textContent = finalTranscript;
                    processVoiceCommand(finalTranscript);
                }'''

new = '''                // Process interim too for faster response
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    const interim = e.results[i][0].transcript.toLowerCase();
                    if (interim.includes("vision")) {
                        processVoiceCommand(e.results[i][0].transcript);
                    }
                }
                if (finalTranscript) {
                    transcriptDisplay.textContent = finalTranscript;
                    processVoiceCommand(finalTranscript);
                }'''

c = c.replace(old, new)

f = open('templates/index.html', 'w', encoding='utf-8')
f.write(c)
f.close()
print('Voice fix applied!')
