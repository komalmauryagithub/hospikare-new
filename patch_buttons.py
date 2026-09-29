import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\.rvbtn,\s*\.viewBtn,\s*\.bookAmbulanceBtn,\s*\.bookLabBtn,\s*\.buyPlanBtn,\s*\.addMedicineBtn,\s*\.addEquipmentBtn,\s*\.addequipmentBtn,\s*\.medicineBuyBtn,\s*\.equipmentBuyBtn\s*\{[^}]*\}'

replacement = '''/* --- MODERN BUTTON STYLES --- */
.rvbtn,
.viewBtn,
.bookAmbulanceBtn,
.bookLabBtn,
.buyPlanBtn,
.addMedicineBtn,
.addEquipmentBtn,
.addequipmentBtn,
.medicineBuyBtn,
.equipmentBuyBtn {
    min-height: 44px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--user-blue), #2563EB);
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.rvbtn::after,
.viewBtn::after,
.bookAmbulanceBtn::after,
.bookLabBtn::after,
.buyPlanBtn::after,
.addMedicineBtn::after,
.addEquipmentBtn::after,
.addequipmentBtn::after,
.medicineBuyBtn::after,
.equipmentBuyBtn::after {
    content: '';
    position: absolute;
    top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: skewX(-20deg);
    transition: all 0.5s ease;
}'''

content = re.sub(pattern, replacement, content, count=1)

pattern_hover = r'\.rvbtn:hover,\s*\.viewBtn:hover,\s*\.bookAmbulanceBtn:hover,\s*\.bookLabBtn:hover,\s*\.buyPlanBtn:hover,\s*\.addMedicineBtn:hover,\s*\.addEquipmentBtn:hover,\s*\.addequipmentBtn:hover,\s*\.medicineBuyBtn:hover,\s*\.equipmentBuyBtn:hover\s*\{[^}]*\}'

replacement_hover = '''.rvbtn:hover,
.viewBtn:hover,
.bookAmbulanceBtn:hover,
.bookLabBtn:hover,
.buyPlanBtn:hover,
.addMedicineBtn:hover,
.addEquipmentBtn:hover,
.addequipmentBtn:hover,
.medicineBuyBtn:hover,
.equipmentBuyBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.rvbtn:hover::after,
.viewBtn:hover::after,
.bookAmbulanceBtn:hover::after,
.bookLabBtn:hover::after,
.buyPlanBtn:hover::after,
.addMedicineBtn:hover::after,
.addEquipmentBtn:hover::after,
.addequipmentBtn:hover::after,
.medicineBuyBtn:hover::after,
.equipmentBuyBtn:hover::after {
    left: 150%;
}'''

content = re.sub(pattern_hover, replacement_hover, content, count=1)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done styling buttons!")
