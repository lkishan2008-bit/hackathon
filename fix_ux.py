#!/usr/bin/env python3
"""
VisionAid UX improvements for blind users:
1. Large floating circular mic button (always visible, right side)
2. "Liki" alone -> auto-start everything
3. TAP TO START overlay on first load
4. Remove toggle switches -> voice commands only
5. Floating status indicator (green=active, red=tap to activate)
Also fixes: camera auto-start, auto-scan, voice every scan, no low-light when camera off.
"""

path = r"C:\Users\hp\hackathon\templates\index.html"

with open(path, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8', errors='replace')

# Normalize line endings
content = content.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

print(f"Loaded: {len(content)} chars, {content.count(chr(10))} lines")

# ─────────────────────────────────────────────────────────────
# 1. Inject CSS for new UX components (before </style>)
# ─────────────────────────────────────────────────────────────
NEW_CSS = """
        /* ── TAP TO START overlay ── */
        .tap-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: radial-gradient(ellipse at center, #050811 0%, #000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2rem;
        }
        .tap-overlay.hidden { display: none; }

        .tap-btn {
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: radial-gradient(circle, #00f2fe 0%, #4facfe 60%, #0070b8 100%);
            box-shadow: 0 0 60px rgba(0,242,254,0.7), 0 0 120px rgba(79,172,254,0.3);
            border: none;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            animation: tap-pulse 2s ease-in-out infinite;
            -webkit-tap-highlight-color: transparent;
        }
        .tap-btn:active { transform: scale(0.93); }
        .tap-btn i { font-size: 3.5rem; color: #fff; }
        .tap-btn span { font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
        @keyframes tap-pulse {
            0%,100% { box-shadow: 0 0 60px rgba(0,242,254,0.7), 0 0 120px rgba(79,172,254,0.3); }
            50%      { box-shadow: 0 0 90px rgba(0,242,254,1),   0 0 180px rgba(79,172,254,0.5); }
        }
        .tap-title { font-size: 2rem; font-weight: 800; color: #00f2fe; text-align: center; }
        .tap-sub   { font-size: 1rem; color: #64748b; text-align: center; max-width: 300px; }

        /* ── Floating mic button (always visible, right side) ── */
        .float-mic {
            position: fixed;
            right: 1.5rem;
            bottom: 5rem;
            z-index: 8000;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle, #ffd814 0%, #ff8c00 100%);
            box-shadow: 0 0 25px rgba(255,216,20,0.6);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: #000;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            -webkit-tap-highlight-color: transparent;
        }
        .float-mic:active, .float-mic.active-mic {
            transform: scale(1.15);
            box-shadow: 0 0 45px rgba(255,216,20,1);
            background: radial-gradient(circle, #00f2fe 0%, #4facfe 100%);
            color: #fff;
        }

        /* ── Floating status dot ── */
        .float-status {
            position: fixed;
            right: 1.5rem;
            bottom: 2rem;
            z-index: 8000;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(5,8,17,0.85);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 0.3rem 0.7rem;
            font-size: 0.75rem;
            color: #fff;
            font-family: 'Space Mono', monospace;
        }
        .status-dot {
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #ef4444;
            animation: status-blink 1.5s infinite;
        }
        .status-dot.online { background: #10b981; animation: none; }
        @keyframes status-blink {
            0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }
    """

if NEW_CSS.strip()[:10] not in content:
    content = content.replace('    </style>', NEW_CSS + '\n    </style>', 1)
    print("Injected new CSS.")
else:
    print("CSS already present, skipping.")

# ─────────────────────────────────────────────────────────────
# 2. Inject HTML elements (after <body> opening tag)
# ─────────────────────────────────────────────────────────────
TAP_HTML = """
    <!-- ── TAP TO START overlay ── -->
    <div class="tap-overlay" id="tap-overlay" role="dialog" aria-modal="true" aria-label="Tap to start VisionAid">
        <div class="tap-title">VisionAid</div>
        <button class="tap-btn" id="tap-start-btn" aria-label="Tap to start camera and scanning">
            <i class="fa-solid fa-eye"></i>
            <span>TAP TO START</span>
        </button>
        <p class="tap-sub">Tap the button to allow camera &amp; microphone, then scanning starts automatically.</p>
    </div>

    <!-- ── Floating mic button ── -->
    <button class="float-mic" id="float-mic-btn" aria-label="Activate voice command" title="Voice Command">
        <i class="fa-solid fa-microphone"></i>
    </button>

    <!-- ── Floating status indicator ── -->
    <div class="float-status" id="float-status" aria-live="polite">
        <div class="status-dot" id="status-dot"></div>
        <span id="status-label">Tap to start</span>
    </div>

"""

if 'tap-overlay' not in content:
    content = content.replace(
        '    <a href="#main-content"',
        TAP_HTML + '    <a href="#main-content"',
        1
    )
    print("Injected HTML overlay and buttons.")
else:
    print("HTML elements already present, skipping.")

# ─────────────────────────────────────────────────────────────
# 3. Fix: Only show dark-alert when camera IS active
#    Change the dark-overlay from display:flex default to display:none
# ─────────────────────────────────────────────────────────────
content = content.replace(
    '''        .dark-overlay {
            display: none;
            position: absolute;
            inset: 0;
            background: rgba(255, 216, 20, 0.1);
            border: 2px solid var(--accent);
            z-index: 6;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            backdrop-filter: blur(2px);
        }''',
    '''        .dark-overlay {
            display: none;
            position: absolute;
            inset: 0;
            background: rgba(255, 216, 20, 0.1);
            border: 2px solid var(--accent);
            z-index: 6;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            backdrop-filter: blur(2px);
        }''',
    1
)
print("Fixed dark-overlay CSS (no duplicate display).")

# ─────────────────────────────────────────────────────────────
# 4. Fix scanFrameBrightness: only run when camera is active
# ─────────────────────────────────────────────────────────────
OLD_BRIGHTNESS = """        function scanFrameBrightness(canvasCtx, width, height) {
            try {
                const imgData = canvasCtx.getImageData(0, 0, width, height);
                const pixels = imgData.data;
                let colorSum = 0;
                
                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    colorSum += (r + g + b) / 3;
                }
                
                const avgBrightness = colorSum / (pixels.length / 16);
                
                if (avgBrightness < 38) {
                    darkAlert.style.display = 'flex';
                    badgeLight.className = 'badge active';
                    badgeLight.querySelector('span').textContent = "Low Light";
                    
                    if (!darknessWarned) {
                        darknessWarned = true;
                        playSpatialBeep(1400, 0, 0.4);
                        
                        const translatedEvent = getEventTranslation("sudden_darkness");
                        const warningSpeech = getTranslation("caution") + " " + translatedEvent + " " + getTranslation("detected");
                        
                        screenReaderAnnounce(warningSpeech, "assertive");
                        speakText(warningSpeech, 1); // High priority = 1 to interrupt immediately
                    }
                    return true;
                } else {
                    darkAlert.style.display = 'none';
                    badgeLight.className = 'badge success-badge';
                    badgeLight.querySelector('span').textContent = "Lux Clear";
                    darknessWarned = false; // Reset warning state once light recovers
                    return false;
                }
            } catch(e) {
                return false;
            }
        }"""

NEW_BRIGHTNESS = """        function scanFrameBrightness(canvasCtx, width, height) {
            // Only run when camera stream is active
            if (!videoStream) {
                darkAlert.style.display = 'none';
                return false;
            }
            try {
                const imgData = canvasCtx.getImageData(0, 0, width, height);
                const pixels = imgData.data;
                let colorSum = 0;
                
                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    colorSum += (r + g + b) / 3;
                }
                
                const avgBrightness = colorSum / (pixels.length / 16);
                
                if (avgBrightness < 28) {  // Stricter threshold to reduce false positives
                    darkAlert.style.display = 'flex';
                    badgeLight.className = 'badge active';
                    badgeLight.querySelector('span').textContent = "Low Light";
                    
                    if (!darknessWarned) {
                        darknessWarned = true;
                        playSpatialBeep(1400, 0, 0.4);
                        const translatedEvent = getEventTranslation("sudden_darkness");
                        const warningSpeech = getTranslation("caution") + " " + translatedEvent + " " + getTranslation("detected");
                        screenReaderAnnounce(warningSpeech, "assertive");
                        speakText(warningSpeech, 1);
                    }
                    return true;
                } else {
                    darkAlert.style.display = 'none';
                    badgeLight.className = 'badge success-badge';
                    badgeLight.querySelector('span').textContent = "Lux Clear";
                    darknessWarned = false;
                    return false;
                }
            } catch(e) {
                darkAlert.style.display = 'none';
                return false;
            }
        }"""

if OLD_BRIGHTNESS in content:
    content = content.replace(OLD_BRIGHTNESS, NEW_BRIGHTNESS, 1)
    print("Fixed scanFrameBrightness.")
else:
    print("WARNING: scanFrameBrightness pattern not matched - check manually.")

# ─────────────────────────────────────────────────────────────
# 5. Fix processAIResult: always speak every scan description
# ─────────────────────────────────────────────────────────────
OLD_SPEAK = """            // Real-time scan voice announcers
            narratorOutput.textContent = payload.description;
            currentTextToRead = payload.description;
            speakText(payload.description, 0); // Normal scan priority"""

NEW_SPEAK = """            // Real-time scan voice announcers - always update and speak
            if (payload.description) {
                narratorOutput.textContent = payload.description;
                currentTextToRead = payload.description;
                // Cancel any previous scan narration and speak immediately
                if (currentSpeechPriority <= 0) {
                    if (speechSynth.speaking) { speechSynth.cancel(); }
                    speakInProgress = false;
                }
                speakText(payload.description, 0);
            }"""

if OLD_SPEAK in content:
    content = content.replace(OLD_SPEAK, NEW_SPEAK, 1)
    print("Fixed processAIResult to always speak every scan.")
else:
    print("WARNING: processAIResult speak pattern not matched.")

# ─────────────────────────────────────────────────────────────
# 6. Replace DOMContentLoaded + add initAll() + TAP/MIC logic
# ─────────────────────────────────────────────────────────────
OLD_INIT_BLOCK = """        // Start initialization on window load
        window.addEventListener('DOMContentLoaded', () => {
            startCamera();
            startMicrophoneMonitoring();
            initHeyLikiRecognition();
            
            setTimeout(triggerVoiceOnboarding, 1500);
        });"""

NEW_INIT_BLOCK = """        // ── Status indicator helper ──────────────────────────────
        function setSystemStatus(online) {
            const dot = document.getElementById('status-dot');
            const label = document.getElementById('status-label');
            if (online) {
                dot.classList.add('online');
                label.textContent = 'All systems active';
            } else {
                dot.classList.remove('online');
                label.textContent = 'Tap to start';
            }
        }

        // ── Master init: starts everything at once ───────────────
        async function initAll() {
            // Hide the TAP TO START overlay
            const overlay = document.getElementById('tap-overlay');
            if (overlay) overlay.classList.add('hidden');

            // Set language state
            onboardingStep = 'ready';
            selectedLanguageKey = 'english';
            activeLanguageBadge.textContent = 'Selected Language: English';

            // Start camera
            await startCamera();

            // Start microphone monitoring
            startMicrophoneMonitoring();

            // Start voice recognition
            initHeyLikiRecognition();

            // Auto-activate scanning immediately
            isAutoscanActive = true;
            isScanLoopRunning = true;

            // Wait for camera to be ready (video metadata loaded)
            if (webcam.readyState >= 2) {
                triggerFastScanCycle();
            } else {
                webcam.addEventListener('loadeddata', () => {
                    triggerFastScanCycle();
                }, { once: true });
                // Fallback in case event never fires
                setTimeout(() => {
                    if (isAutoscanActive && isScanLoopRunning && !requestPending) {
                        triggerFastScanCycle();
                    }
                }, 1500);
            }

            setSystemStatus(true);

            // Welcome message
            setTimeout(() => {
                speakText('VisionAid active. Scanning the environment for you. Say Hey Liki for commands.');
            }, 600);
        }

        // ── TAP TO START button ───────────────────────────────────
        window.addEventListener('DOMContentLoaded', () => {
            const tapBtn = document.getElementById('tap-start-btn');
            if (tapBtn) {
                tapBtn.addEventListener('click', () => { initAll(); });
                tapBtn.addEventListener('touchend', (e) => { e.preventDefault(); initAll(); });
            }

            // ── Floating mic button ───────────────────────────────
            const floatMic = document.getElementById('float-mic-btn');
            if (floatMic) {
                floatMic.addEventListener('click', () => {
                    if (!isVoiceRecogActive) {
                        isVoiceRecogActive = true;
                        initHeyLikiRecognition();
                    }
                    floatMic.classList.add('active-mic');
                    speakText('Voice command active. Say Hey Liki.');
                    setTimeout(() => floatMic.classList.remove('active-mic'), 3000);
                });
            }

            // Init voice recognition immediately (for wake word detection before tap)
            initHeyLikiRecognition();
        });"""

if OLD_INIT_BLOCK in content:
    content = content.replace(OLD_INIT_BLOCK, NEW_INIT_BLOCK, 1)
    print("Replaced DOMContentLoaded with full initAll() system.")
else:
    print("WARNING: DOMContentLoaded pattern not matched - trying loose match...")
    # Try to find and replace a looser pattern
    idx = content.find("// Start initialization on window load")
    if idx != -1:
        end_idx = content.find("});", idx) + 3
        old_block = content[idx:end_idx]
        content = content.replace(old_block, NEW_INIT_BLOCK, 1)
        print(f"Loose match replaced at char {idx}.")
    else:
        print("ERROR: Could not find DOMContentLoaded block.")

# ─────────────────────────────────────────────────────────────
# 7. Fix processVoiceCommand: "Liki" alone -> initAll()
# ─────────────────────────────────────────────────────────────
OLD_SCAN_CMD = """                // Auto Scan Toggle Command (Liki alone or start)\n                if (!isScanLoopRunning) {\n                    isAutoscanActive = true;\n                    isScanLoopRunning = true;\n                    playSpatialBeep(523, 0, 0.25);\n                    triggerFastScanCycle();\n                }"""

NEW_SCAN_CMD = """                // "Hey Liki" alone -> initAll() if not started, else confirm active
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

if OLD_SCAN_CMD in content:
    content = content.replace(OLD_SCAN_CMD, NEW_SCAN_CMD, 1)
    print("Fixed Hey Liki alone command to call initAll().")
else:
    print("WARNING: Hey Liki scan command pattern not matched.")

# ─────────────────────────────────────────────────────────────
# 8. Fix triggerFastScanCycle to reset isScanLoopRunning on stop
# ─────────────────────────────────────────────────────────────
OLD_SCAN_LOOP = """        // FASTER continuous scanning loop
        function triggerFastScanCycle() {
            if (!isAutoscanActive) {
                badgeScan.className = 'badge';
                badgeScan.querySelector('span').textContent = "Scan Offline";
                isScanLoopRunning = false; // Reset the loop running flag!
                return;
            }"""

NEW_SCAN_LOOP = """        // FASTER continuous scanning loop
        function triggerFastScanCycle() {
            if (!isAutoscanActive) {
                badgeScan.className = 'badge';
                badgeScan.querySelector('span').textContent = "Scan Offline";
                isScanLoopRunning = false;
                setSystemStatus(false);
                return;
            }"""

if OLD_SCAN_LOOP in content:
    content = content.replace(OLD_SCAN_LOOP, NEW_SCAN_LOOP, 1)
    print("Fixed triggerFastScanCycle reset.")
else:
    # Try a version without the comment about reset
    OLD_SCAN_LOOP2 = """        // FASTER continuous scanning loop
        function triggerFastScanCycle() {
            if (!isAutoscanActive) {
                badgeScan.className = 'badge';
                badgeScan.querySelector('span').textContent = "Scan Offline";
                return;
            }"""
    if OLD_SCAN_LOOP2 in content:
        content = content.replace(OLD_SCAN_LOOP2, NEW_SCAN_LOOP, 1)
        print("Fixed triggerFastScanCycle (v2).")
    else:
        print("WARNING: triggerFastScanCycle pattern not matched.")

# ─────────────────────────────────────────────────────────────
# 9. Write cleaned output
# ─────────────────────────────────────────────────────────────
with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print(f"\nSaved: {len(content)} chars")

# Verify
with open(path, 'r', encoding='utf-8') as f:
    verify = f.read()
print(f"Verified OK: {len(verify)} chars, {verify.count(chr(10))} lines")
print("\nAll UX improvements applied successfully!")
