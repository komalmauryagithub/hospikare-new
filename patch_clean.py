import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace pink background override
pattern_pink = r'\.addMedicineBtn,\s*\.addequipmentBtn,\s*\.medicineBuyBtn,\s*\.equipmentBuyBtn\s*\{\s*background:\s*var\(--user-pink\);\s*\}'
content = re.sub(pattern_pink, '', content)

# Replace red background for bookAmbulanceBtn
pattern_amb = r'\.bookAmbulanceBtn\s*\{\s*background:[^}]+!important;\s*box-shadow:[^}]+!important;\s*\}'
content = re.sub(pattern_amb, '', content)

# Replace rvbtn overrides
pattern_rv = r'\.rvbtn\s*\{\s*width:\s*44px;[^}]+\}'
content = re.sub(pattern_rv, '', content)

# Replace bookLabBtn width override
pattern_lab = r'\.bookLabBtn\s*\{\s*width:\s*100%;\s*\}'
content = re.sub(pattern_lab, '', content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up legacy overrides!")
