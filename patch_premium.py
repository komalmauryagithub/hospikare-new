import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace base card styles
pattern_base = r'/\* --- MODERN CARD REDESIGN --- \*/[\s\S]*?z-index: 1;\n}'

replacement_base = '''/* --- ULTRA PREMIUM CARD REDESIGN --- */
.service-card,
.featuredHospitalCard,
.ambulanceCard,
.labCard,
.insuranceCard,
.medicineCard,
.equipmentCard {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 
        0 10px 40px -10px rgba(0, 0, 0, 0.06), 
        0 1px 3px rgba(0, 0, 0, 0.03),
        inset 0 0 0 1px rgba(255, 255, 255, 1);
    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    overflow: hidden;
    z-index: 1;
    display: flex;
    flex-direction: column;
}'''
content = re.sub(pattern_base, replacement_base, content, count=1)

# Remove the old ::before gradient line
pattern_before = r'\.service-card::before,[\s\S]*?z-index: 2;\n}'
content = re.sub(pattern_before, '', content)

# 2. Hover state
pattern_hover = r'\.service-card:hover,[\s\S]*?box-shadow: [^;]+;\n}'
replacement_hover = '''.service-card:hover,
.featuredHospitalCard:hover,
.ambulanceCard:hover,
.labCard:hover,
.insuranceCard:hover,
.medicineCard:hover,
.equipmentCard:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(37, 99, 235, 0.15);
    box-shadow: 
        0 24px 48px -12px rgba(37, 99, 235, 0.18), 
        0 12px 24px -10px rgba(37, 99, 235, 0.12),
        inset 0 0 0 1px rgba(255, 255, 255, 1);
}'''
content = re.sub(pattern_hover, replacement_hover, content, count=1)

# Remove the old ::before hover
pattern_hover_before = r'\.service-card:hover::before,[\s\S]*?opacity: 1;\n}'
content = re.sub(pattern_hover_before, '', content)

# 3. Image wrappers
pattern_img_wrap = r'\.featuredHospitalImage,\s*\.medicineImage,\s*\.equipmentImage\s*\{[^}]*\}'
replacement_img_wrap = '''.featuredHospitalImage,
.medicineImage,
.equipmentImage {
    background: #ffffff;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid rgba(0,0,0,0.03);
}'''
content = re.sub(pattern_img_wrap, replacement_img_wrap, content)

# Image elements
pattern_img = r'\.featuredHospitalImage img,\s*\.medicineImage img,\s*\.equipmentImage img\s*\{[^}]*\}'
replacement_img = '''.featuredHospitalImage img,
.medicineImage img,
.equipmentImage img {
    height: 100%;
    width: 100%;
    object-fit: contain; /* Changed to contain so logos don't get cut off */
    padding: 10px; /* Give it some breathing room */
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.featuredHospitalImage img {
    object-fit: cover; /* Hospitals look better as full bleed */
    padding: 0;
}'''
content = re.sub(pattern_img, replacement_img, content)

# 4. Typography inside cards
# Title
pattern_h3 = r'\.featuredHospitalContent h3,\s*\.ambulanceContent h3,\s*\.medicineCard h3,\s*\.equipmentContent h3,\s*\.labLeft h3,\s*\.insuranceCard h3\s*\{[^}]*\}'
replacement_h3 = '''.featuredHospitalContent h3,
.ambulanceContent h3,
.medicineCard h3,
.equipmentContent h3,
.labLeft h3,
.insuranceCard h3 {
    margin-bottom: 0.5rem;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.3;
    color: #0f172a;
    letter-spacing: -0.015em;
}'''
content = re.sub(pattern_h3, replacement_h3, content)

# Subtitle / Location
pattern_sub = r'\.hospitalLocation,\s*\.ambulanceLocation,\s*\.labCenter,\s*\.medicineCompany,\s*\.equipmentBrand,\s*\.driverName\s*\{[^}]*\}'
replacement_sub = '''.hospitalLocation,
.ambulanceLocation,
.labCenter,
.medicineCompany,
.equipmentBrand,
.driverName {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}
.hospitalLocation i, .ambulanceLocation i, .labCenter i {
    color: #94a3b8;
}'''
content = re.sub(pattern_sub, replacement_sub, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CSS with ultra premium style!")
