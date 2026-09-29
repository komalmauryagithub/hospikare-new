with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('function handleAmbulanceBooking(event) {', 'async function handleAmbulanceBooking(event) {')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed async!")
