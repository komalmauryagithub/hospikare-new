import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

labels_to_asterisk = ['MRP', 'Selling Price', 'Stock Quantity', 'Stock Status']

for label in labels_to_asterisk:
    search_str = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label}</label>'
    replace_str = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label} <span style="color:red;">*</span></label>'
    html = html.replace(search_str, replace_str)

with open('mdeq.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Added missing asterisks")
