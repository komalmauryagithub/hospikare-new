import re
import time

new_v = str(int(time.time()))

for file in ['users.html', 'act.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'\?v=\d+', f'?v={new_v}', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated cache busters!")
