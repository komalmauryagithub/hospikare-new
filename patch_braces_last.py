with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the LAST occurrence of })();
last_index = content.rfind('})();')
if last_index != -1:
    content = content[:last_index] + '    }\n    }\n    }\n    }\n' + content[last_index:]

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added 4 braces at the very end!")
