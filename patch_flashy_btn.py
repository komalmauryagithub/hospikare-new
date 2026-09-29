import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_btn_hover = r'\.rvbtn:hover,\s*\.viewBtn:hover,\s*\.bookAmbulanceBtn:hover,\s*\.bookLabBtn:hover,\s*\.buyPlanBtn:hover,\s*\.addMedicineBtn:hover,\s*\.addEquipmentBtn:hover,\s*\.addequipmentBtn:hover,\s*\.medicineBuyBtn:hover,\s*\.equipmentBuyBtn:hover\s*\{\s*transform: translateY\(-2px\);\s*box-shadow: 0 8px 20px rgba\(37, 99, 235, 0\.4\);\s*\}'

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
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.5);
    background: linear-gradient(135deg, #06b6d4, var(--user-blue));
}'''
content = re.sub(pattern_btn_hover, replacement_btn_hover, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Made buttons more flashy!")
