with open('css/users.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            stack.append(i + 1)
        elif char == '}':
            if len(stack) == 0:
                print(f"Extra closing brace at line {i + 1}: {line.strip()}")
            else:
                stack.pop()

if len(stack) > 0:
    print("Unclosed braces opened at lines:", stack)
