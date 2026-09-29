import re
import time

new_v = str(int(time.time()))

with open('hosp_data.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\?v=\d+', f'?v={new_v}', content)

with open('hosp_data.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated cache buster in hosp_data.html!")
