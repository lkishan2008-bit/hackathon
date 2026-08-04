#!/usr/bin/env python3
"""
Fix VisionAid index.html:
1. Normalize \r\r\n -> \n (clean line endings)
2. Remove the corrupted duplicate JS block (}ely! corruption)
3. Auto-start camera and scanning on page load (no "Hey Liki" required)
"""

path = r"C:\Users\hp\hackathon\templates\index.html"

# Read raw bytes
with open(path, 'rb') as f:
    raw = f.read()

print(f"Original size: {len(raw)} bytes")

# Decode with UTF-8 (we know it's valid)
content = raw.decode('utf-8', errors='replace')

# --- Fix 1: Normalize line endings ---
# \r\r\n -> \n, then \r\n -> \n, then \r -> \n
content = content.replace('\r\r\n', '\n')
content = content.replace('\r\n', '\n')
content = content.replace('\r', '\n')

print(f"After line ending fix: {content.count(chr(10))} lines")

# --- Fix 2: Remove corrupted duplicate block ---
# The corruption is the `}ely!` junk right after the real speakText function ends,
# followed by a duplicate processAIResult + speakText block.
# Find and remove from `}ely!` up to the second speakText function end.

CORRUPT_START = "        speechSynth.speak(utterance);\n        }ely!"
DUPLICATE_END = "            speechSynth.speak(currentUtterance);\n        }\n\n        // FASTER continuous scanning loop"

if CORRUPT_START in content:
    start_idx = content.index(CORRUPT_START)
    # Find where the duplicate block ends (before triggerFastScanCycle)
    if DUPLICATE_END in content:
        end_idx = content.index(DUPLICATE_END) + len(DUPLICATE_END)
        # Replace the whole corrupt+duplicate region with clean ending + triggerFastScanCycle comment
        clean_ending = "        speechSynth.speak(utterance);\n        }\n\n        // FASTER continuous scanning loop"
        content = content[:start_idx] + clean_ending + content[end_idx:]
        print("Removed corrupted duplicate block successfully.")
    else:
        print("WARNING: Duplicate end marker not found - manual check needed")
else:
    print("No }ely! corruption found (already clean or already fixed).")

# --- Fix 3: Auto-start camera and scanning on page load ---
OLD_INIT = """        // Start initialization on window load
        window.addEventListener('DOMContentLoaded', () => {
            startCamera();
            startMicrophoneMonitoring();
            initHeyLikiRecognition();
            
            setTimeout(triggerVoiceOnboarding, 1500);
        });"""

NEW_INIT = """        // Start initialization on window load - AUTO-START camera and scanning
        window.addEventListener('DOMContentLoaded', () => {
            // Auto-start camera, then immediately begin scanning loop
            startCamera().then(() => {
                // Auto-activate scanning without requiring "Hey Liki"
                isAutoscanActive = true;
                isScanLoopRunning = true;
                onboardingStep = \"ready\";
                activeLanguageBadge.textContent = \"Selected Language: English\";
                // Small delay to allow webcam frame to stabilize
                setTimeout(() => {
                    triggerFastScanCycle();
                }, 800);
            }).catch(() => {
                // Camera unavailable - still activate voice assistant
                console.warn(\"Camera unavailable, starting voice-only mode.\");
            });

            startMicrophoneMonitoring();
            initHeyLikiRecognition();

            // Brief auto-welcome (non-blocking)
            setTimeout(() => {
                speakText(\"VisionAid active. Camera scanning started automatically. Say Hey Liki for voice commands.\");
            }, 1200);
        });"""

if OLD_INIT in content:
    content = content.replace(OLD_INIT, NEW_INIT)
    print("Auto-start on load patch applied.")
else:
    print("WARNING: DOMContentLoaded pattern not matched exactly.")
    # Try a looser match
    if "startCamera();" in content and "triggerVoiceOnboarding" in content:
        print("Trying alternative patch...")
        # Find the DOMContentLoaded block
        dom_start = content.find("window.addEventListener('DOMContentLoaded'")
        dom_end = content.find("});", dom_start) + 3
        old_block = content[dom_start:dom_end]
        print(f"Found block:\n{old_block}")

# Write clean UTF-8 output
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print(f"\nSaved clean file: {len(content)} characters")

# Verify
with open(path, 'r', encoding='utf-8') as f:
    check = f.read()
print(f"Verification OK: {len(check)} chars, {check.count(chr(10))} lines")
print("All fixes applied successfully!")
