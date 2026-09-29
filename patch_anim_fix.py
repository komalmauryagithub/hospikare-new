import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace oth; with ackwards; for the animation
content = content.replace('animation: cardFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;', 'animation: cardFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing animation fill mode!")
