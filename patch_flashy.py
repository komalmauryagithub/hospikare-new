import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the ultra premium card styles we added previously
pattern_base = r'/\* --- ULTRA PREMIUM CARD REDESIGN --- \*/[\s\S]*?z-index: 1;\n    display: flex;\n    flex-direction: column;\n\}'

replacement_base = '''/* --- ULTIMATE FLASHY ANIMATED CARDS --- */
@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.2); }
    50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.4); }
    100% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.2); }
}

.service-card,
.featuredHospitalCard,
.ambulanceCard,
.labCard,
.insuranceCard,
.medicineCard,
.equipmentCard {
    background: #ffffff; /* Fallback */
    border-radius: 20px;
    border: none; /* We use pseudo-element for border */
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: 4px; /* Space for the glowing border bleed */
    animation: pulseGlow 3s infinite;
}

/* The Animated Gradient Border Layer */
.service-card::before,
.featuredHospitalCard::before,
.ambulanceCard::before,
.labCard::before,
.insuranceCard::before,
.medicineCard::before,
.equipmentCard::before {
    content: '';
    position: absolute;
    inset: -3px; /* Border thickness */
    border-radius: 23px;
    background: linear-gradient(90deg, #2563EB, #06b6d4, #e8174a, #8b5cf6, #2563EB);
    background-size: 300% 300%;
    animation: gradientMove 4s linear infinite;
    z-index: -2;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

/* The Inner White Background Layer */
.service-card::after,
.featuredHospitalCard::after,
.ambulanceCard::after,
.labCard::after,
.insuranceCard::after,
.medicineCard::after,
.equipmentCard::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #ffffff;
    border-radius: 20px;
    z-index: -1;
}
'''
content = re.sub(pattern_base, replacement_base, content, count=1)

# Remove the previous hover
pattern_hover = r'\.service-card:hover,\s*\.featuredHospitalCard:hover,\s*\.ambulanceCard:hover,\s*\.labCard:hover,\s*\.insuranceCard:hover,\s*\.medicineCard:hover,\s*\.equipmentCard:hover\s*\{\s*transform: translateY\(-10px\) scale\(1\.02\);\s*border-color: rgba\(37, 99, 235, 0\.15\);\s*box-shadow: \s*0 24px 48px -12px rgba\(37, 99, 235, 0\.18\), \s*0 12px 24px -10px rgba\(37, 99, 235, 0\.12\),\s*inset 0 0 0 1px rgba\(255, 255, 255, 1\);\s*\}'

replacement_hover = '''.service-card:hover,
.featuredHospitalCard:hover,
.ambulanceCard:hover,
.labCard:hover,
.insuranceCard:hover,
.medicineCard:hover,
.equipmentCard:hover {
    transform: translateY(-12px) scale(1.03);
    animation: pulseGlow 1s infinite;
}

.service-card:hover::before,
.featuredHospitalCard:hover::before,
.ambulanceCard:hover::before,
.labCard:hover::before,
.insuranceCard:hover::before,
.medicineCard:hover::before,
.equipmentCard:hover::before {
    opacity: 1;
    filter: blur(8px); /* Creates a massive neon glow around the card on hover */
    inset: -4px;
    background-size: 200% 200%;
    animation: gradientMove 2s linear infinite;
}'''
content = re.sub(pattern_hover, replacement_hover, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added extreme flashy animations!")
