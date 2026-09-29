with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

avatar_css = '''
/* Avatar Override */
#authOpenBtn:has(img) {
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
}
#authOpenBtn:has(img):hover {
    background: transparent !important;
    transform: scale(1.05) !important;
    box-shadow: none !important;
}
'''
content += avatar_css

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added :has(img) overrides to CSS!")
