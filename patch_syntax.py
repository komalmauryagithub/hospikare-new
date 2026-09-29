import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken keyframes remnants
broken_remnants = '''/* --- ULTIMATE FLASHY ANIMATED CARDS --- */

    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}


    50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.4); }
    100% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.2); }
}'''

content = content.replace(broken_remnants, '')

# Also remove the text /* --- ULTIMATE FLASHY ANIMATED CARDS --- */ if it's there
content = content.replace('/* --- ULTIMATE FLASHY ANIMATED CARDS --- */\n', '')

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed syntax errors!")
