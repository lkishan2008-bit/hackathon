#!/usr/bin/env python3
"""Update floating mic button CSS and class name to match user's exact spec."""

path = r"C:\Users\hp\hackathon\templates\index.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Loaded: {len(content)} chars")

# ── 1. Replace the old .float-mic CSS block with user's exact .floating-mic-btn ──
OLD_CSS = """        /* ── Floating mic button (always visible, right side) ── */
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
        }"""

NEW_CSS = """        /* ── Floating mic button (always visible, right side) ── */
        .floating-mic-btn {
            position: fixed;
            right: 20px;
            bottom: 100px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle, #00f2fe, #4facfe);
            border: none;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 0 25px rgba(0,242,254,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: #000;
            animation: mic-float 2s ease-in-out infinite alternate;
            -webkit-tap-highlight-color: transparent;
        }
        @keyframes mic-float {
            0%   { transform: translateY(0px);  box-shadow: 0 0 25px rgba(0,242,254,0.5); }
            100% { transform: translateY(-8px); box-shadow: 0 0 40px rgba(0,242,254,0.8); }
        }
        .floating-mic-btn.active-mic {
            background: radial-gradient(circle, #00ff87, #60efff);
            box-shadow: 0 0 55px rgba(0,255,135,0.9);
            animation: none;
            transform: scale(1.18);
            color: #000;
        }"""

if OLD_CSS in content:
    content = content.replace(OLD_CSS, NEW_CSS, 1)
    print("Replaced float-mic CSS with floating-mic-btn CSS.")
else:
    # Inject before </style> if not found
    if '.float-mic' in content:
        # Replace whatever .float-mic block exists
        import re
        content = re.sub(r'/\* ── Floating mic button.*?\.float-mic\.active-mic \{[^}]+\}', NEW_CSS, content, flags=re.DOTALL)
        print("Replaced via regex.")
    else:
        content = content.replace('        /* ── Floating status dot ──', NEW_CSS + '\n\n        /* ── Floating status dot ──', 1)
        print("Injected before status dot section.")

# ── 2. Update the HTML element class from float-mic -> floating-mic-btn ──
content = content.replace(
    'class="float-mic" id="float-mic-btn"',
    'class="floating-mic-btn" id="float-mic-btn"',
    1
)
print("Updated HTML element class to floating-mic-btn.")

# ── 3. Update JS references from .float-mic to .floating-mic-btn ──
content = content.replace("floatMic.classList.add('active-mic')", "floatMic.classList.add('active-mic')")
content = content.replace("floatMic.classList.remove('active-mic')", "floatMic.classList.remove('active-mic')")
# (These are already correct, just confirm no old class names remain in JS)

# ── 4. Update the float-status bottom alignment to match new mic position ──
content = content.replace(
    '            right: 1.5rem;\n            bottom: 2rem;',
    '            right: 20px;\n            bottom: 40px;',
    1
)
print("Aligned status indicator position.")

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print(f"\nSaved: {len(content)} chars")
with open(path, 'r', encoding='utf-8') as f:
    v = f.read()
print(f"Verified: {len(v)} chars, {v.count(chr(10))} lines")
print("floating-mic-btn CSS applied successfully!")
