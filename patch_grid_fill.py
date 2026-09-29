import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace auto-fit with auto-fill to prevent cards from stretching massively
content = content.replace('auto-fit', 'auto-fill')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated grid to auto-fill!")
