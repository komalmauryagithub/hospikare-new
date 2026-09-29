import re
js = open('server.js', encoding='utf-8').read()
m = re.search(r'app\.put\([\'"]/api/user/profile[\'"][\s\S]*?(?=app\.)', js)
print(m.group(0) if m else "not found")
