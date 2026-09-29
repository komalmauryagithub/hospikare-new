import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.medicineCard {\n    padding: 0.9rem;', '.medicineCard {\n    padding: 1.25rem;')
content = content.replace('.medicineCard,\n    .equipmentCard {\n        padding: 0.75rem !important;\n    }', '.medicineCard,\n    .equipmentCard {\n        padding: 1rem !important;\n    }')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated medicine padding!")
