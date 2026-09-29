import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\.labPrice,\s*\.medicinePrice,\s*\.equipmentPrice h4,\s*\.insurancePrice\s*\{[^}]*\}'
replacement = '''.labPrice,
.medicinePrice,
.equipmentPrice h4,
.insurancePrice {
    color: var(--user-blue);
    font-family: var(--font-body);
    font-weight: 900;
}

.insurancePrice {
    font-size: 1.8rem;
    margin: 0.5rem 0;
    line-height: 1.1;
    background: linear-gradient(135deg, var(--user-blue), #2563EB);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.insurancePlanType {
    color: var(--user-cyan);
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.8rem;
}'''

content = re.sub(pattern, replacement, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed insurance price styles!")
