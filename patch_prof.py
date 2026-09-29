import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove flashy keyframes
content = re.sub(r'@keyframes gradientMove \{[^}]*\}', '', content)
content = re.sub(r'@keyframes pulseGlow \{[^}]*\}', '', content)

# 2. Re-write the base card block
pattern_base = r'/\* --- ULTIMATE FLASHY ANIMATED CARDS --- \*/[\s\S]*?transition: transform 0\.4s cubic-bezier\(0\.175, 0\.885, 0\.32, 1\.275\);\s*margin: 4px;\s*animation: pulseGlow 3s infinite;\s*\}'

replacement_base = '''/* --- PROFESSIONAL CORPORATE HEALTHCARE CARDS --- */
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
    margin: 0; /* reset from 4px */
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}'''
content = re.sub(pattern_base, replacement_base, content, count=1)

# Remove the animated pseudo-elements completely
content = re.sub(r'/\* The Animated Gradient Border Layer \*/[\s\S]*?transition: opacity 0\.3s ease;\s*\}', '', content)
content = re.sub(r'/\* The Inner White Background Layer \*/[\s\S]*?z-index: -1;\s*\}', '', content)

# 3. Re-write the hover state
pattern_hover = r'\.service-card:hover,[\s\S]*?transform: translateY\(-12px\) scale\(1\.03\);\s*animation: pulseGlow 1s infinite;\s*\}'

replacement_hover = '''.service-card:hover,
.featuredHospitalCard:hover,
.ambulanceCard:hover,
.labCard:hover,
.insuranceCard:hover,
.medicineCard:hover,
.equipmentCard:hover {
    transform: translateY(-6px);
    border-color: #93c5fd;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}'''
content = re.sub(pattern_hover, replacement_hover, content, count=1)

# Remove flashy pseudo-element hovers
content = re.sub(r'\.service-card:hover::before,[\s\S]*?animation: gradientMove 2s linear infinite;\s*\}', '', content)

# 4. Fix Image border radius and paddings
pattern_img = r'\.featuredHospitalImage,\s*\.medicineImage,\s*\.equipmentImage\s*\{\s*background: #ffffff;\s*overflow: hidden;\s*position: relative;\s*border-bottom: 1px solid rgba\(0,0,0,0\.03\);\s*border-radius: 20px 20px 0 0;\s*z-index: 2;[\s\S]*?\}'
replacement_img = '''.featuredHospitalImage,
.medicineImage,
.equipmentImage {
    background: #ffffff;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid #f1f5f9;
    border-radius: 16px 16px 0 0;
}'''
content = re.sub(pattern_img, replacement_img, content, count=1)

# 5. Make buttons professional
pattern_btn = r'\.rvbtn,\s*\.viewBtn,[\s\S]*?overflow: hidden;\s*\}'
replacement_btn = '''.rvbtn,
.viewBtn,
.bookAmbulanceBtn,
.bookLabBtn,
.buyPlanBtn,
.addMedicineBtn,
.addEquipmentBtn,
.addequipmentBtn,
.medicineBuyBtn,
.equipmentBuyBtn {
    min-height: 42px;
    border: none;
    border-radius: 8px;
    background: #1d4ed8; /* Corporate Blue */
    color: #ffffff;
    padding: 0 1.25rem;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
}'''
content = re.sub(pattern_btn, replacement_btn, content, count=1)

# Professional button hover
pattern_btn_hover = r'\.rvbtn:hover,\s*\.viewBtn:hover,[\s\S]*?background: linear-gradient\(135deg, #06b6d4, var\(--user-blue\)\);\s*\}'
replacement_btn_hover = '''.rvbtn:hover,
.viewBtn:hover,
.bookAmbulanceBtn:hover,
.bookLabBtn:hover,
.buyPlanBtn:hover,
.addMedicineBtn:hover,
.addEquipmentBtn:hover,
.addequipmentBtn:hover,
.medicineBuyBtn:hover,
.equipmentBuyBtn:hover {
    transform: translateY(-1px);
    background: #1e40af; /* Darker Corporate Blue */
    box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3), 0 2px 4px -1px rgba(29, 78, 216, 0.2);
}'''
content = re.sub(pattern_btn_hover, replacement_btn_hover, content, count=1)

# Clean up rvbtn specific to be a nice subtle circle
pattern_rvbtn = r'\.rvbtn\s*\{\s*width: 44px;[\s\S]*?transition: all 0\.3s ease;\s*\}'
replacement_rvbtn = '''.rvbtn {
    width: 42px;
    height: 42px;
    min-height: 42px;
    padding: 0;
    flex: 0 0 42px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}'''
content = re.sub(pattern_rvbtn, replacement_rvbtn, content, count=1)

pattern_rvbtn_hover = r'\.rvbtn:hover\s*\{\s*background: linear-gradient\(135deg, var\(--user-blue\), #2563EB\);[\s\S]*?box-shadow: 0 8px 20px rgba\(37, 99, 235, 0\.4\);\s*\}'
replacement_rvbtn_hover = '''.rvbtn:hover {
    background: #f8fafc;
    color: #1d4ed8;
    border-color: #cbd5e1;
    transform: translateY(0);
    box-shadow: none;
}'''
content = re.sub(pattern_rvbtn_hover, replacement_rvbtn_hover, content, count=1)

# Make Typography highly professional
content = content.replace('color: #0f172a;\n    font-family: var(--font-heading);\n    font-weight: 800;\n    letter-spacing: -0.02em;', 'color: #1e293b;\n    font-family: var(--font-heading);\n    font-weight: 700;\n    letter-spacing: -0.01em;')
content = content.replace('font-size: 1.8rem;\n    margin: 0.5rem 0;\n    line-height: 1.1;\n    background: linear-gradient(135deg, var(--user-blue), #2563EB);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;', 'font-size: 1.5rem;\n    margin: 0.4rem 0;\n    line-height: 1.2;\n    color: #1e40af;\n    font-weight: 700;')


with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated to Professional Healthcare Theme!")
