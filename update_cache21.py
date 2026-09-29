import re
import time

new_v = str(int(time.time()))

with open('users.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\?v=\d+', f'?v={new_v}', content)

with open('users.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cache busters!")
