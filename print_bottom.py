with open('js/users.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("".join(lines[-100:]))
