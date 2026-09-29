import re
import time

version = str(int(time.time()))
filename = 'lt.html'
with open(filename, 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

html = re.sub(r'src="js/lt\.js[^"]*"', f'src="js/lt.js?v={version}"', html)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(html)
