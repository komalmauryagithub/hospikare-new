import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

animation_css = '''
@keyframes cardFadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.service-card,
.featuredHospitalCard,
.ambulanceCard,
.labCard,
.insuranceCard,
.medicineCard,
.equipmentCard {
    animation: cardFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
'''

# Find the block where we added the Modern Card Redesign and inject animation
pattern = r'(/\* --- MODERN CARD REDESIGN --- \*/[\s\S]*?z-index: 1;\n})'

content = re.sub(pattern, r'\1\n' + animation_css, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done adding card animations!")
