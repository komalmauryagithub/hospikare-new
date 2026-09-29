import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'#authOpenBtn \{[^}]*box-shadow: none !important;\s*\}'
replacement = '''#authOpenBtn {
    background: #eff6ff !important;
    color: #1d4ed8 !important;
    border: 1px solid #bfdbfe !important;
    border-radius: 9999px !important;
    font-weight: 700 !important;
    padding: 6px 16px !important;
    font-size: 0.9rem !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
}'''

content = re.sub(pattern, replacement, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn CSS for flex layout!")
