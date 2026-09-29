import re

def get_hsp_form():
    with open('hsp.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    match = re.search(r'(<form id="vendorProfileForm".*?</form>)', html, re.DOTALL)
    if match:
        form_html = match.group(1)
        # Change "Hospital Vendor Profile" text just in case it's in the form? 
        # No, the title is outside the form.
        return form_html
    return None

hsp_form = get_hsp_form()

if hsp_form:
    for filename in ['mdc.html', 'mdeq.html']:
        with open(filename, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Replace the entire vendorProfileForm
        html = re.sub(r'<form id="vendorProfileForm".*?</form>', hsp_form, html, flags=re.DOTALL)
        
        # Change title text to match
        panel_name = "Medicine Vendor" if "mdc.html" in filename else "Medical Equipment Vendor"
        html = re.sub(
            r'<h3[^>]*>Profile Details</h3>', 
            f'<h3 style="margin:0; font-size:20px; font-weight:800; font-family:var(--font-heading); color:var(--hk-text-main, #0f172a);">{panel_name} Profile</h3>', 
            html
        )
        html = re.sub(
            r'<h3[^>]*>Equipment Vendor Profile</h3>', 
            f'<h3 style="margin:0; font-size:20px; font-weight:800; font-family:var(--font-heading); color:var(--hk-text-main, #0f172a);">{panel_name} Profile</h3>', 
            html
        )
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Updated {filename} with hsp.html's vendorProfileForm.")

else:
    print("Could not extract vendorProfileForm from hsp.html")
