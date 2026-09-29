import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\.featuredHospitalCard,\s*\.ambulanceCard,\s*\.labCard,\s*\.insuranceCard,\s*\.medicineCard,\s*\.equipmentCard\s*\{\s*background: #ffffff; /\* Fallback \*/\s*border-radius: 20px;\s*border: none; /\* We use pseudo-element for border \*/\s*position: relative;\s*z-index: 1;\s*display: flex;\s*flex-direction: column;\s*transition: transform 0\.4s cubic-bezier\(0\.175, 0\.885, 0\.32, 1\.275\);\s*margin: 4px; /\* Space for the glowing border bleed \*/\s*\}'

replacement = '''/* --- PROFESSIONAL CORPORATE HEALTHCARE CARDS --- */
.service-card,
.featuredHospitalCard,
.ambulanceCard,
.labCard,
.insuranceCard,
.medicineCard,
.equipmentCard {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    margin: 0;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}'''

content = re.sub(pattern, replacement, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Base CSS fixed!")
