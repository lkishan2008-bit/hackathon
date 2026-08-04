import sys 
with open('templates/index.html', 'rb') as f: 
    content = f.read() 
with open('templates/index.html', 'w', encoding='utf-8', errors='ignore') as f: 
    f.write(content.decode('utf-8', errors='ignore')) 
print('Fixed!') 
