import re
with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'src="js/admin\.js[^"]*"', f'src="js/admin.js?v=99999"', html)
with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
