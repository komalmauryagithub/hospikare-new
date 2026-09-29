with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# find first loadAmbulances
start1 = content.find('async function loadAmbulances()')
start2 = content.find('async function loadAmbulances()', start1 + 10)
end_target = content.find('async function loadMedicines()')

if start1 != -1 and start2 != -1:
    new_content = content[:start1] + content[start2:end_target] + content[end_target:]
    with open('js/users.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Removed duplicate loadAmbulances block!")
else:
    print("Not found duplicates")
