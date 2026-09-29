import re
with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

content += '''
.medicineContainer, .equipmentContainer {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
}
.insuranceContainer {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
}
.ambulanceContainer {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)) !important;
}
.featuredHospitalContainer {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
}
'''
with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied auto-fit to all main containers!")
