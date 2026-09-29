with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Count of init:", content.count('async function init()'))
print("Count of loadMedicines:", content.count('async function loadMedicines()'))
print("Count of getSavedUser:", content.count('function getSavedUser()'))
print("Count of toast:", content.count('function toast(message)'))
