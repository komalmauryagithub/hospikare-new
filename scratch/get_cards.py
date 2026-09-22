with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find medicine card block
med_start = content.find('data.medicines.map(item =>')
join_str = '.join("")'
med_end = content.find(join_str, med_start) + len(join_str)
print('--- MEDICINE CARD ---')
print(content[med_start:med_end])
print('\n=====\n')
# Find equip card
eq_start = content.find('data.equipments.map(item =>')
eq_end = content.find(join_str, eq_start) + len(join_str)
print('--- EQUIPMENT CARD ---')
print(content[eq_start:eq_end])
print('\n=====\n')
# Find insurance card
ins_start = content.find('data.insurances.map(plan =>')
ins_end = content.find(join_str, ins_start) + len(join_str)
print('--- INSURANCE CARD ---')
print(content[ins_start:ins_end])
