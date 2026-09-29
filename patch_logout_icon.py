import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'if \(logoutBtn\) \{\s*logoutBtn\.hidden = !user;\s*\}'
replacement = '''if (logoutBtn) {
    logoutBtn.hidden = !user;
    if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
}'''

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added icon to logout button!")
