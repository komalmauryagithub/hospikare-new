import os

for f in ['hsp.html', 'lt.html', 'mdc.html', 'mdeq.html', 'ins.html', 'amb.html']:
    html = open(f, encoding='utf-8', errors='ignore').read()
    print(f)
    print("  contact_number:", 'name="contact_number"' in html)
    print("  email:", 'name="email"' in html)
