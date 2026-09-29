import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Fix broken labels
html = html.replace('</label required>', '</label>')

with open('mdeq.html', 'w', encoding='utf-8') as f:
    f.write(html)
