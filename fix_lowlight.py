f = open('templates/index.html', 'r', encoding='utf-8')
c = f.read()
f.close()

# Hide low light overlay by default
c = c.replace(
    'class="dark-overlay" id="dark-alert"',
    'class="dark-overlay" id="dark-alert" style="display:none;"'
)

f = open('templates/index.html', 'w', encoding='utf-8')
f.write(c)
f.close()
print('Low light fixed!')