import re

# 1. Remove My Orders Highlight from users.css
with open('css/users.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

pattern_myorders = r'/\* My Orders Highlight \*/[\s\S]*?\.nav-links a\[href="act\.html"\]\s*\{[^}]*\}'
css_content = re.sub(pattern_myorders, '', css_content)

# Update authOpenBtn CSS to be a perfect circle avatar button
pattern_authbtn = r'#authOpenBtn\s*\{[^}]*\}'
replacement_authbtn = '''#authOpenBtn {
    background: transparent !important;
    color: #1d4ed8 !important;
    border: none !important;
    border-radius: 50% !important;
    padding: 0 !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: default !important;
    transition: transform 0.2s ease !important;
}
#authOpenBtn:hover {
    transform: scale(1.05) !important;
}'''
css_content = re.sub(pattern_authbtn, replacement_authbtn, css_content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(css_content)
print("Updated users.css!")

# 2. Update users.js to remove "Hi, Name"
with open('js/users.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

pattern_js = r'authOpenBtn\.innerHTML = `<img src="\$\{photoUrl\}" alt="Profile" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba\(0,0,0,0\.1\);"> <span>Hi, \$\{escapeHtml\(fName\)\}</span>`;'
replacement_js = 'authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer;">`;'
js_content = re.sub(pattern_js, replacement_js, js_content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated users.js!")
