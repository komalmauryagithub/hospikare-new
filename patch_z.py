import re
with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.featuredHospitalContent, .ambulanceContent, .labLeft, .insuranceCard, .medicineCard, .equipmentContent {\n    z-index: 2;\n    position: relative;\n}', '')

content += '''
.featuredHospitalContent, .ambulanceContent, .labLeft, .equipmentContent {
    z-index: 2;
    position: relative;
}
'''
with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed .insuranceCard from z-index list")
