import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the authOpenBtn textContent logic with innerHTML logic that includes the image
pattern = r'authOpenBtn\.textContent = user \? `Hi, \$\{firstName\(user\.full_name \|\| user\.name \|\| "User"\)\}` : "Login \/ Portal";'

replacement = '''
if (user) {
    const fName = firstName(user.full_name || user.name || "User");
    if (user.profile_photo) {
        authOpenBtn.innerHTML = `<img src="/uploads/${escapeAttr(user.profile_photo)}" alt="Profile" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; margin-right: 6px; display: inline-block; vertical-align: middle;"> <span style="vertical-align: middle;">Hi, ${escapeHtml(fName)}</span>`;
    } else {
        authOpenBtn.innerHTML = `<span style="vertical-align: middle;">Hi, ${escapeHtml(fName)}</span>`;
    }
} else {
    authOpenBtn.textContent = "Login / Portal";
}
'''
content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn to show profile picture!")
