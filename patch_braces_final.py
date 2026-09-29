with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('})();', '    }\n    }\n    }\n    }\n})();')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added 4 closing braces!")
