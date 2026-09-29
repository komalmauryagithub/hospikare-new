import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\.featuredHospitalImage img,\s*\.medicineImage img,\s*\.equipmentImage img\s*\{([^}]*)\}'
replacement = '''.featuredHospitalImage img,
.medicineImage img,
.equipmentImage img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}'''

content = re.sub(pattern, replacement, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done styling images!")
