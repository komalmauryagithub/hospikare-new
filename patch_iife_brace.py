with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('        }\n})();', '})();')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed extra brace from IIFE!")
