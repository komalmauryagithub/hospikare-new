with open('ins.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Find the insuranceForm section and add asterisks to important fields
# These labels are ONLY inside insuranceForm (after line ~326), not in companyForm
# We need to be careful to only replace inside insuranceForm

# Split at insuranceForm to only modify that section
marker = '<form id="insuranceForm"'
parts = html.split(marker, 1)
if len(parts) == 2:
    form_section = parts[1]
    
    labels_to_asterisk = [
        'Company Name',
        'Company Type',  
        'Description',
        'IRDAI Number',
        'Company PAN',
        'Office Address',
        'Claim Type',
        'Required Documents',
        'Customer Support Number',
        'Email Support',
        'Certificate',
    ]
    
    for label in labels_to_asterisk:
        old = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label}</label>'
        new = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label} <span style="color:red;">*</span></label>'
        form_section = form_section.replace(old, new, 1)
    
    html = parts[0] + marker + form_section
    
    with open('ins.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Added asterisks to important insurance plan form fields!")
else:
    print("insuranceForm not found")
