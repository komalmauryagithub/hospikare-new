import re
with open('mdeq.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<form id="supplierForm">', '<form id="supplierForm">\n<input type="hidden" id="edit_supplier_id">')

with open('mdeq.html', 'w', encoding='utf-8') as f:
    f.write(html)
