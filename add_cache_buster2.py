import os
import re
import time

version = str(int(time.time()))

def buster(filename):
    with open(filename, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()
    
    html = re.sub(r'src="js/hsp\.js[^"]*"', f'src="js/hsp.js?v={version}"', html)
    html = re.sub(r'src="js/mdc\.js[^"]*"', f'src="js/mdc.js?v={version}"', html)
    html = re.sub(r'src="js/mdeq\.js[^"]*"', f'src="js/mdeq.js?v={version}"', html)
    html = re.sub(r'src="js/amb\.js[^"]*"', f'src="js/amb.js?v={version}"', html)
    html = re.sub(r'src="js/lt\.js[^"]*"', f'src="js/lt.js?v={version}"', html)
    html = re.sub(r'src="js/ins\.js[^"]*"', f'src="js/ins.js?v={version}"', html)
    html = re.sub(r'src="js/admin\.js[^"]*"', f'src="js/admin.js?v={version}"', html)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Added cache buster to {filename}")

files = ['hsp.html', 'mdc.html', 'mdeq.html', 'amb.html', 'lt.html', 'ins.html', 'admin.html']
for f in files:
    if os.path.exists(f):
        buster(f)
