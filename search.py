import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

html_path = r"C:\Users\hp\hackathon\templates\index.html.bak"
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(1350, 1420):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx].strip()}")
