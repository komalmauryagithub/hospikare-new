import re

with open('amb.html', 'r', encoding='utf-8') as f:
    amb_html = f.read()

# The block to remove is between <style> and </style> in the head
pattern = re.compile(r'<style>.*?#topNavbar.*?justify-content: space-between !important;\n\s*\}\n\s*</style>\n', re.DOTALL)
if pattern.search(amb_html):
    amb_html = pattern.sub('', amb_html)
    with open('amb.html', 'w', encoding='utf-8') as f:
        f.write(amb_html)
    print("Removed inline style block from amb.html.")
else:
    print("Could not find the inline style block.")
