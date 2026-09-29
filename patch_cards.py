import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block:
# .service-card,
# .featuredHospitalCard,
# .ambulanceCard,
# .labCard,
# .insuranceCard,
# .medicineCard,
# .equipmentCard {

pattern = r'\.service-card,\s*\.featuredHospitalCard,\s*\.ambulanceCard,\s*\.labCard,\s*\.insuranceCard,\s*\.medicineCard,\s*\.equipmentCard\s*\{[^}]*\}'

replacement = '''/* --- MODERN CARD REDESIGN --- */
.service-card,
.featuredHospitalCard,
.ambulanceCard,
.labCard,
.insuranceCard,
.medicineCard,
.equipmentCard {
    border-radius: 20px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                box-shadow 0.4s ease, 
                border-color 0.4s ease;
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.service-card::before,
.featuredHospitalCard::before,
.ambulanceCard::before,
.labCard::before,
.insuranceCard::before,
.medicineCard::before,
.equipmentCard::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--user-blue), var(--user-cyan));
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 2;
}'''

content = re.sub(pattern, replacement, content, count=1)

# Hover block
pattern_hover = r'\.service-card:hover,\s*\.featuredHospitalCard:hover,\s*\.ambulanceCard:hover,\s*\.labCard:hover,\s*\.insuranceCard:hover,\s*\.medicineCard:hover,\s*\.equipmentCard:hover\s*\{[^}]*\}'

replacement_hover = '''.service-card:hover,
.featuredHospitalCard:hover,
.ambulanceCard:hover,
.labCard:hover,
.insuranceCard:hover,
.medicineCard:hover,
.equipmentCard:hover {
    transform: translateY(-8px);
    border-color: rgba(31, 58, 154, 0.2);
    box-shadow: 0 24px 48px rgba(31, 58, 154, 0.12), 0 8px 16px rgba(31, 58, 154, 0.06);
}

.service-card:hover::before,
.featuredHospitalCard:hover::before,
.ambulanceCard:hover::before,
.labCard:hover::before,
.insuranceCard:hover::before,
.medicineCard:hover::before,
.equipmentCard:hover::before {
    opacity: 1;
}'''

content = re.sub(pattern_hover, replacement_hover, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done styling base cards!")
