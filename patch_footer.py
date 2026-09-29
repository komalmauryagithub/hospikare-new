import re

with open('users.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace footer background
pattern1 = r'<footer class="footer" style="background: var\(--hk-blue\); color: white; padding: var\(--space-16\) 0 var\(--space-8\); margin-top: var\(--space-16\);">'
replacement1 = '<footer class="footer" style="background: #0f172a; color: white; padding: 5rem 0 2rem; margin-top: 5rem; border-top: 1px solid #1e293b;">'
content = re.sub(pattern1, replacement1, content)

# Inject some CSS for footer links into users.css instead of editing every single inline link
footer_css = '''
/* --- PREMIUM FOOTER --- */
.footer {
    position: relative;
    overflow: hidden;
}
.footer::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent);
}
.footer .container > div h3 {
    color: #f8fafc !important;
    font-size: 1.1rem;
    letter-spacing: 0.5px;
}
.footer .container > div p {
    color: #94a3b8 !important;
    font-size: 0.95rem;
}
.footer .container > div a {
    color: #94a3b8 !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    font-size: 0.95rem;
    display: inline-block;
    padding: 2px 0;
}
.footer .container > div a:hover {
    color: #38bdf8 !important;
    transform: translateX(4px);
}
'''
with open('css/users.css', 'a', encoding='utf-8') as f:
    f.write(footer_css)

with open('users.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Footer style!")
