with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('async function loadAmbulances()')
end = content.find('async function loadMedicines()')
print(content[start:end])
