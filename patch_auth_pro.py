import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'#authOpenBtn\s*\{[^}]*\}'
replacement = '''#authOpenBtn {
    background: #2563eb !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 9999px !important;
    padding: 8px 20px !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
    transition: all 0.2s ease !important;
}'''

content = re.sub(pattern, replacement, content)

pattern_hover = r'#authOpenBtn:hover\s*\{[^}]*\}'
replacement_hover = '''#authOpenBtn:hover {
    background: #1d4ed8 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
}'''

content = re.sub(pattern_hover, replacement_hover, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn to Premium Solid Blue!")
