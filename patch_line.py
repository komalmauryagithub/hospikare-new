with open('css/users.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = lines[:359] + [
'''/* --- PROFESSIONAL CORPORATE HEALTHCARE CARDS --- */
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
    margin: 0;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
'''
] + lines[377:]

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Replaced base styles perfectly by line number!")
