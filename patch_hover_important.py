with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('background: #f1f5f9 !important;', 'background: #f1f5f9;')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed !important from hover background")
