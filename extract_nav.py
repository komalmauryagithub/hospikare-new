import re
content = open('amb.html', 'r', encoding='utf-8').read()
m = re.search(r'<nav id="topNavbar">.*?</nav>', content, re.DOTALL)
print(m.group(0))
