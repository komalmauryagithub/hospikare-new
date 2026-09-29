import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the labsContainer overflow issue by overriding grid-cols-4
pattern = r'\.labsContainer\s*\{\s*align-items: stretch;\s*\}'
replacement = '''.labsContainer {
    align-items: stretch;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
}'''

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
else:
    # If not found, append to end
    content += '''
.labsContainer {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
}
'''

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed labs container grid layout!")
