with open('js/users.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'async function loadAmbulances' in line:
        print(f"Line {i+1}: {line.strip()}")
