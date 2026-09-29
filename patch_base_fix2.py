import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the block that starts with .featuredHospitalCard,\n.ambulanceCard, and ends with margin: 4px; /* Space for the glowing border bleed */\n}
pattern = r'\.featuredHospitalCard,\s*\.ambulanceCard,\s*\.labCard,\s*\.insuranceCard,\s*\.medicineCard,\s*\.equipmentCard\s*\{[^}]*\}'

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

# Note: this might match TWO blocks: the base one, and the animation one. Let's do it carefully.
lines = content.split('\n')
for i, line in enumerate(lines):
    if '.ambulanceCard,' in line and lines[i-1].strip() == '.featuredHospitalCard,':
        print(f"Found at {i}")
