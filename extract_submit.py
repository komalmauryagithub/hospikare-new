import re

with open('js/amb.js', 'r', encoding='utf-8') as f:
    js = f.read()
    
match = re.search(r'document\.getElementById\([\'"]ambulanceForm[\'"]\)\?\.addEventListener\([\'"]submit[\'"][\s\S]*?(?=\}\);)', js)
if match:
    print(match.group(0))
else:
    print("no match")
