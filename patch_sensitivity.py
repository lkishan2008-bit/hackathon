import re

FILE_PATH = r"C:\Users\hp\hackathon\templates\index.html"
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update onresult to log every word heard and stop on final result
OLD_ONRESULT = """                const transcriptToProcess = finalTranscript || interimTranscript;
                if (transcriptToProcess) {
                    transcriptDisplay.textContent = transcriptToProcess;
                    processVoiceCommand(transcriptToProcess);
                }
            };"""

NEW_ONRESULT = """                const transcriptToProcess = finalTranscript || interimTranscript;
                if (transcriptToProcess) {
                    console.log("Heard (interim/final):", transcriptToProcess);
                    transcriptDisplay.textContent = transcriptToProcess;
                    processVoiceCommand(transcriptToProcess);
                }
                
                // Restart immediately if it's a final result to clear the buffer
                if (finalTranscript) {
                    try { recognitionEngine.stop(); } catch(err) {}
                }
            };"""

html = html.replace(OLD_ONRESULT, NEW_ONRESULT, 1)

# 2. Add more phonetic trigger words
OLD_TRIGGER = """            const triggerWords = [
                "hey liki", "hi liki", "hey leeky", "hey leaky", "hey lickie", "hey likey", "hey lyky", 
                "leeky", "leaky", "lickie", "likey", "liki", 
                "हे लीकी", "ஹே லிகி", "ஹேலிகி", "హే లికి", "ಹೇ ಲಿಖಿ", "ഹേ ലികി", "হে লিকি"
            ];"""

NEW_TRIGGER = """            const triggerWords = [
                "hey liki", "hi liki", "hey leeky", "hey leaky", "hey lickie", "hey likey", "hey lyky", 
                "leeky", "leaky", "lickie", "likey", "liki", "lucky", "licky", "mickey", "nicki", "lyky",
                "हे लीकी", "ஹே லிகி", "ஹேலிகி", "హే లికి", "ಹೇ ಲಿಖಿ", "ഹേ ലികി", "হে লিকি"
            ];"""

html = html.replace(OLD_TRIGGER, NEW_TRIGGER, 1)

# 3. Stop recognitionEngine when trigger word is found to avoid duplicate triggers from interim results
OLD_HAS_TRIGGER = """            if (hasTrigger) {
                playSpatialBeep(900, 0, 0.2);"""

NEW_HAS_TRIGGER = """            if (hasTrigger) {
                // Stop recognition immediately upon trigger to avoid duplicate interim fires
                if (recognitionEngine) {
                    try { recognitionEngine.stop(); } catch(err) {}
                }
                playSpatialBeep(900, 0, 0.2);"""

html = html.replace(OLD_HAS_TRIGGER, NEW_HAS_TRIGGER, 1)

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied voice recognition sensitivity fixes.")
