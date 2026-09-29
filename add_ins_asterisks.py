with open('ins.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Important labels to add asterisk (inside companyForm only)
# Company Name already has it
labels_to_asterisk = [
    'Company Type',
    'Contact Person', 
    'Mobile Number',
    'Email',
    'Full Address',
    'City',
    'State',
    'Pincode',
    'Policy Types',
    'Status',
]

for label in labels_to_asterisk:
    old = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label}</label>'
    new = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label} <span style="color:red;">*</span></label>'
    # Only replace first occurrence (inside companyForm area)
    html = html.replace(old, new, 1)

with open('ins.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Added asterisks to important insurance company fields!")
