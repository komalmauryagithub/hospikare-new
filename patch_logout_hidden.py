with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

css_addition = '''
#logoutBtn[hidden] {
    display: none !important;
}
'''
content += css_addition

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added hidden override for logoutBtn!")
