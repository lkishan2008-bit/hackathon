f = open('templates/index.html', 'r', encoding='utf-8')
c = f.read()
f.close()

# Check missing functions
print('initAudioContext:', 'initAudioContext' in c)
print('getTranslation:', 'getTranslation' in c)
print('dark-alert display none:', 'dark-overlay' in c)
