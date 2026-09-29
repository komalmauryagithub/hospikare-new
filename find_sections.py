import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
sections = re.findall(r'id=\"([A-Za-z0-9_]+Section)\"', html)
print(sections)
