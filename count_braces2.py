with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

open_braces = content.count('{')
close_braces = content.count('}')
print(f"Open: {open_braces}, Close: {close_braces}, Diff: {open_braces - close_braces}")
