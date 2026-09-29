import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_lab = r'\.labCard\s*\{\s*display:\s*flex;\s*align-items:\s*center;\s*justify-content:\s*space-between;\s*gap:\s*1rem;\s*padding:\s*1\.15rem;\s*\}'
replacement_lab = '''.labCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem;
}'''
content = re.sub(pattern_lab, replacement_lab, content)

# Check ambulance padding
pattern_amb = r'\.ambulanceCard\s*\{\s*padding:\s*1\.1rem;\s*\}'
replacement_amb = '''.ambulanceCard {
    padding: 1.5rem;
}'''
content = re.sub(pattern_amb, replacement_amb, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated padding!")
