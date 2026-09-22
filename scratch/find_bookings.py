import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("Bookings:", re.findall(r'app\.get\([\'"]/api/[a-zA-Z0-9_-]*booking[a-zA-Z0-9_-]*[\'"]', content))
print("Orders:", re.findall(r'app\.get\([\'"]/api/[a-zA-Z0-9_-]*order[a-zA-Z0-9_-]*[\'"]', content))

# Let's also find where they query tables for bookings and orders
print("Queries:")
for m in re.finditer(r'SELECT.*?FROM.*?WHERE.*?(?:booking|order)', content, re.IGNORECASE | re.DOTALL):
    # just print the first line of the query
    print(m.group(0).split('\n')[0].strip()[:100])
