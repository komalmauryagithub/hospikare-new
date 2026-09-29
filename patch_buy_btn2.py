import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove inline background, color, and box-shadow so CSS can control it
pattern = r'style="width: 100%; background: #2563eb; color: #ffffff; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0\.2s; margin-top: auto; box-shadow: 0 4px 12px rgba\(37,99,235,0\.3\);"'

replacement = 'style="width: 100%; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; margin-top: auto;"'

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed inline background styles for buyPlanBtn!")
