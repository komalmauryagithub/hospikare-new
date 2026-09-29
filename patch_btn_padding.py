import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'background: linear-gradient\(135deg, var\(--user-blue\), #2563EB\);\s*color: #ffffff;'
replacement = '''background: linear-gradient(135deg, var(--user-blue), #2563EB);
    color: #ffffff;
    padding: 0 1.25rem;
    white-space: nowrap;
    flex-shrink: 0;'''

content = re.sub(pattern, replacement, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added padding and whitespace nowrap!")
