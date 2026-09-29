import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_auth = r'#authOpenBtn \{[^}]*\}'
replacement_auth = '''#authOpenBtn {
    background: #f8fafc !important;
    color: #0f172a !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 9999px !important;
    font-weight: 700 !important;
    padding: 6px 16px 6px 6px !important; /* Extra padding on right, tight on left for image */
    font-size: 0.9rem !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: default !important;
    transition: all 0.2s ease !important;
}
#authOpenBtn:hover {
    background: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
}'''
content = re.sub(pattern_auth, replacement_auth, content)

pattern_logout = r'#logoutBtn \{[^}]*\}'
replacement_logout = '''#logoutBtn {
    background: transparent !important;
    color: #64748b !important;
    border: 1px solid transparent !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
    transition: all 0.2s ease !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
}'''
content = re.sub(pattern_logout, replacement_logout, content)

pattern_logout_hover = r'#logoutBtn:hover \{[^}]*\}'
replacement_logout_hover = '''#logoutBtn:hover {
    background: #fee2e2 !important;
    color: #dc2626 !important;
    border-color: #fca5a5 !important;
}'''
content = re.sub(pattern_logout_hover, replacement_logout_hover, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Navbar Buttons CSS!")
