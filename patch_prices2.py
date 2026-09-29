import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_price = r'\.labPrice,\s*\.medicinePrice,\s*\.equipmentPrice h4,\s*\.insurancePrice\s*\{[^}]*\}'
replacement_price = '''.labPrice,
.medicinePrice,
.equipmentPrice h4,
.insurancePrice {
    color: #0f172a;
    font-family: var(--font-heading);
    font-weight: 800;
    letter-spacing: -0.02em;
}'''
content = re.sub(pattern_price, replacement_price, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated price typography!")
