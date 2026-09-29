import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'<form id="productForm">([\s\S]*?)</form>', html)
if m:
    print('\n'.join(re.findall(r'<label.*?</label>', m.group(1))))
else:
    print("Not found")
