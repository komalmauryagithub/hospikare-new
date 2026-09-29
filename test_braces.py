with open('css/users.css', 'r', encoding='utf-8') as f:
    text = f.read()

open_braces = text.count('{')
close_braces = text.count('}')
print(f"Open: {open_braces}, Close: {close_braces}")
if open_braces != close_braces:
    print("MISMATCH IN BRACES!")
else:
    print("Braces match.")
