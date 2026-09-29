import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('background: #eef2f7;', 'background: #ffffff;')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed image backgrounds!")
