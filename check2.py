f=open('templates/index.html','r',encoding='utf-8')
c=f.read()
f.close()
checks = ['google maps','spatial radar','dark-alert','low light','danger','vehicle','radar-sweeper','grid-template-columns','gps-sidebar','vision','processVoiceCommand','scanFrameBrightness','handleDangerDetected']
for ch in checks:
    print(ch, '→', '✅ Found' if ch.lower() in c.lower() else '❌ MISSING')
