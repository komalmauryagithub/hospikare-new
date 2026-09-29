import re
js = open('server.js', encoding='utf-8').read()
m = re.search(r'app\.post\([\'"]/api/edit/equipment-product/:id[\'"][\s\S]*?(?=\napp\.)', js)
print(m.group(0) if m else "not found")
