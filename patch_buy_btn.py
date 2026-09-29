import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the buyPlanBtn style
pattern = r'style="width: 100%; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0\.2s;"'
replacement = 'style="width: 100%; background: #2563eb; color: #ffffff; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; margin-top: auto; box-shadow: 0 4px 12px rgba(37,99,235,0.3);"'

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated buyPlanBtn!")
