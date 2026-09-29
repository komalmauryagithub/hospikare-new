with open('js/users.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines[-400:]):
    if 'function ' in line:
        print(line.strip())
