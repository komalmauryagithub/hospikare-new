import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = re.findall(r'app\.get\([\'"](/[^\'"]*book[^\'"]*)[\'"]', content, re.IGNORECASE)
orders = re.findall(r'app\.get\([\'"](/[^\'"]*order[^\'"]*)[\'"]', content, re.IGNORECASE)

print("Booking endpoints:")
for e in endpoints:
    print(e)
    
print("\nOrder endpoints:")
for e in orders:
    print(e)
