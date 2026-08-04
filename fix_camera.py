with open('templates/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Camera autostart
content = content.replace(
    "window.addEventListener('DOMContentLoaded', () => {",
    "window.addEventListener('DOMContentLoaded', () => {\n        startCamera();"
)

with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Camera autostart fixed!')