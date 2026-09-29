with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines[:330]):
    if 'function' in line:
        print(f"Line {i+1}: {line.strip()}")
