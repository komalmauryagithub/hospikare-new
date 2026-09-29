import re
html = open('amb.html', encoding='utf-8', errors='ignore').read()
print("bank_account:", [m for m in re.findall(r'<input[^>]*name="bank_account"[^>]*>', html)])
print("ifsc:", [m for m in re.findall(r'<input[^>]*name="ifsc"[^>]*>', html)])
print("required missing?", [m for m in re.findall(r'<input[^>]*required[^>]*>', html) if 'name="' in m])
