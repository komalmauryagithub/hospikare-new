import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'authOpenBtn\.innerHTML = `<img[^>]*>`;'
replacement = '''authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
authOpenBtn.style.padding = "0";
authOpenBtn.style.background = "transparent";'''

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/act.js', 'r', encoding='utf-8') as f:
    act_content = f.read()

act_content = re.sub(pattern, replacement, act_content)

with open('js/act.js', 'w', encoding='utf-8') as f:
    f.write(act_content)

print("Updated JS to handle avatar padding dynamically!")
