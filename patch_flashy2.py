import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_img_wrap = r'\.featuredHospitalImage,\s*\.medicineImage,\s*\.equipmentImage\s*\{\s*background: #ffffff;\s*overflow: hidden;\s*position: relative;\s*border-bottom: 1px solid rgba\(0,0,0,0\.03\);\s*\}'

replacement_img_wrap = '''.featuredHospitalImage,
.medicineImage,
.equipmentImage {
    background: #ffffff;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    border-radius: 20px 20px 0 0;
    z-index: 2; /* Sit above the ::after background */
}'''
content = re.sub(pattern_img_wrap, replacement_img_wrap, content)

# Also ensure content sits above the ::after background
content += '''
.featuredHospitalContent, .ambulanceContent, .labLeft, .insuranceCard, .medicineCard, .equipmentContent {
    z-index: 2;
    position: relative;
}
'''
with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed z-indexing and border radius for inner elements!")
