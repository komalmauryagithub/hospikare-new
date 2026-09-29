with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

index1 = content.find('async function loadMedicines()')
index2 = content.find('async function loadMedicines()', index1 + 100)
index3 = content.find('async function loadMedicines()', index2 + 100)
index4 = content.find('async function loadMedicines()', index3 + 100)
index5 = content.find('async function loadMedicines()', index4 + 100)
index_end = content.find('async function handleInsuranceClaim(event)')

print("Index 1:", index1)
print("Index 2:", index2)
print("Index 3:", index3)
print("Index 4:", index4)
print("Index 5:", index5)
print("Index end:", index_end)
