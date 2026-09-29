import re

with open('js/amb.js', 'r', encoding='utf-8') as f:
    js = f.read()
    
# In openProfileModal, find where business_address is mapped and insert bank_account and ifsc
pattern = r"if \(form\.elements\['business_address'\]\) form\.elements\['business_address'\]\.value = user\.business_address \|\| '';"
replacement = """if (form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
            if (form.elements['bank_account']) form.elements['bank_account'].value = user.bank_account || '';
            if (form.elements['ifsc']) form.elements['ifsc'].value = user.ifsc || '';"""
            
new_js = re.sub(pattern, replacement, js)

with open('js/amb.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Patched amb.js")
