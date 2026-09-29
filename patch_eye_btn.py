import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="">'
replacement = '<button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">'

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed eye button id!")
