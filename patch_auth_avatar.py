import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'if \(user\.profile_photo\) \{[\s\S]*?\} else \{[\s\S]*?\}'

replacement = '''
    const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
    authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"> <span>Hi, ${escapeHtml(fName)}</span>`;
'''

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn to always show avatar!")
