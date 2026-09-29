import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('authOpenBtn.style.background = "transparent";', 'authOpenBtn.style.setProperty("background", "transparent", "important");')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/act.js', 'r', encoding='utf-8') as f:
    act_content = f.read()

act_content = act_content.replace('authOpenBtn.style.background = "transparent";', 'authOpenBtn.style.setProperty("background", "transparent", "important");')

with open('js/act.js', 'w', encoding='utf-8') as f:
    f.write(act_content)

print("Added !important to JS styles!")
