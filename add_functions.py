f = open('templates/index.html', 'r', encoding='utf-8')
c = f.read()
f.close()

init_audio = '''
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }
'''

get_translation = '''
        function getTranslation(key) {
            const lang = translations[selectedLanguageKey];
            if (lang && lang[key]) return lang[key];
            return translations["english"][key] || key;
        }
'''

c = c.replace('        async function startMicrophoneMonitoring()',
              init_audio + get_translation + '        async function startMicrophoneMonitoring()')

f = open('templates/index.html', 'w', encoding='utf-8')
f.write(c)
f.close()
print('Functions added successfully!')
