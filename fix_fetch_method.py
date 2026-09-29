import re

with open('js/ins.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# Replace the method 'POST' with editId ? 'PUT' : 'POST'
js = js.replace("const res = await fetch(url, { method: 'POST', body: formData });", "const res = await fetch(url, { method: editId ? 'PUT' : 'POST', body: formData });")

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed method in ins.js")
