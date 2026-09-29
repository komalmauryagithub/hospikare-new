with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('async async function', 'async function')
content = content.replace('async  async function', 'async function')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up async async!")
