import re
with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace stranded closing tags that caused the syntax error
pattern = r'</span>`;\s*\}\s*\} else \{\s*authOpenBtn\.textContent = "Login / Portal";\s*\}'
replacement = ''
content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed duplicate syntax errors!")
