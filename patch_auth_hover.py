import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all existing #authOpenBtn rules
content = re.sub(r'#authOpenBtn\s*\{[^}]*\}', '', content)
content = re.sub(r'#authOpenBtn:hover\s*\{[^}]*\}', '', content)

# Add a single unified clean rule
new_css = '''
#authOpenBtn {
    background: transparent !important;
    color: #1d4ed8 !important;
    border: 2px solid transparent !important;
    border-radius: 9999px !important;
    padding: 6px 16px !important;
    font-weight: 700 !important;
    font-size: 0.9rem !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
}
#authOpenBtn:hover {
    background: #f1f5f9 !important;
    transform: scale(1.02) !important;
}
'''

content += new_css

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn CSS for correct hover!")
