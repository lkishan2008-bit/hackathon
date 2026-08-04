import re
import os

file_path = 'templates/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Liki with AJ
content = content.replace('Liki', 'AJ')
content = content.replace('liki', 'aj')

# Add favicon fix in head
favicon_tag = '<link rel="icon" href="data:,">\n</head>'
if '<link rel="icon"' not in content:
    content = content.replace('</head>', favicon_tag)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html')
