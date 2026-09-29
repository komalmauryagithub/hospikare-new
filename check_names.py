import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
# Extract inputs inside supplierForm
m = re.search(r'<form id="supplierForm">([\s\S]*?)</form>', html)
if m:
    form_html = m.group(1)
    # Find all ids or names
    print("Ids:", re.findall(r'id="([^"]+)"', form_html))
    print("Names:", re.findall(r'name="([^"]+)"', form_html))
else:
    print("Not found")
