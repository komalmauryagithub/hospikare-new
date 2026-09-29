with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '$("#authOpenBtn")?.addEventListener("click", showAuthModal);'
new_code = '''$("#authOpenBtn")?.addEventListener("click", () => {
        if (!state.user) {
            showAuthModal();
        }
    });'''

content = content.replace(old_code, new_code)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authOpenBtn click listener in users.js!")
