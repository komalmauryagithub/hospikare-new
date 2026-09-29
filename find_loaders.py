with open('js/users.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

funcs_to_check = ['loadFeaturedHospitals', 'loadLabs', 'loadInsurances', 'loadMedicines', 'loadEquipments']
for func in funcs_to_check:
    for i, line in enumerate(lines):
        if f"async function {func}" in line:
            print(f"{func} at Line {i+1}")
