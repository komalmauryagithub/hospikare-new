import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_tags = r'\.facilityTags span,\s*\.ambulanceFeatures span,\s*\.equipmentTags span,\s*\.medicineCategory,\s*\.equipmentCategory\s*\{[^}]*\}'
replacement_tags = '''.facilityTags span,
.ambulanceFeatures span,
.equipmentTags span,
.medicineCategory,
.equipmentCategory {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    background: #f1f5f9;
    color: #475569;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    border: 1px solid rgba(0,0,0,0.02);
    transition: all 0.3s ease;
}
.featuredHospitalCard:hover .facilityTags span,
.ambulanceCard:hover .ambulanceFeatures span,
.equipmentCard:hover .equipmentTags span {
    background: #e0e7ff;
    color: #4338ca;
    border-color: rgba(67, 56, 202, 0.1);
}'''
content = re.sub(pattern_tags, replacement_tags, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated tags and badges!")
