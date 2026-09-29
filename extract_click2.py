import re
js = open('js/mdeq.js', encoding='utf-8').read()
m = re.search(r'item\.addEventListener\([\'"]click[\'"][\s\S]*?(?=\n    \}\))', js)
print(m.group(0) if m else "not found")
