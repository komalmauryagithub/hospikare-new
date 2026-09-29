import re

def patch_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # The current fillProfileForm looks like:
    # async function fillProfileForm(profile, details = {}) { ... }
    # Let's replace the whole function.
    
    pattern = r"async function fillProfileForm\(profile,\s*details\s*=\s*\{\}\)\s*\{[\s\S]*?(?=\n\s*\n|\Z|async function openProfileModal|function openProfileModal|document\.getElementById)"
    
    # Actually, it's safer to just find the end of the function manually.
    
    # Let's just use string replacement on the known body.
    
    replacement = """async function fillProfileForm(profile, details = {}) {
    if (!profile) return;
    const nameField = document.getElementById("profileName");
    const emailField = document.getElementById("profileEmail");
    const userTypeField = document.getElementById("profileUserType");
    const bankField = document.getElementById("profileBank");
    const ifscField = document.getElementById("profileIfsc");

    if (nameField) nameField.value = profile.name || "";
    if (emailField) emailField.value = profile.email || profile.emailorcontact || "";
    if (userTypeField && profile.users_type) userTypeField.value = profile.users_type;
    if (bankField) bankField.value = profile.bank_account || "";
    if (ifscField) ifscField.value = profile.ifsc || "";

    const form = document.getElementById('vendorProfileForm');
    if (form) {
        const profileMap = {
            'company_name': profile.company_name,
            'name': profile.name,
            'contact_number': profile.contact_number,
            'email': profile.email || profile.emailorcontact,
            'business_address': profile.business_address,
            'bank_account': profile.bank_account,
            'ifsc': profile.ifsc,
            'business_reg_number': profile.business_reg_number,
            'service_area': profile.service_area,
            'service_24x7': profile.service_24x7
        };
        for (const [key, val] of Object.entries(profileMap)) {
            const input = form.querySelector('[name="' + key + '"]');
            if (input && input.type !== 'file') {
                input.value = val || "";
            }
        }
    }

    if (details) {
        for (const [key, value] of Object.entries(details)) {
            const input = document.querySelector('#vendorProfileForm [name="' + key + '"]');
            if (input && input.type !== 'file' && !input.value) {
                input.value = value || "";
            }
        }
    }
}"""

    # We will use regex to replace it
    # We find 'async function fillProfileForm(profile, details = {}) {' and find its matching closing brace
    
    start_idx = js.find('async function fillProfileForm(profile, details = {}) {')
    if start_idx != -1:
        # Find closing brace by counting braces
        brace_count = 0
        end_idx = -1
        for i in range(start_idx, len(js)):
            if js[i] == '{':
                brace_count += 1
            elif js[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i
                    break
        
        if end_idx != -1:
            js = js[:start_idx] + replacement + js[end_idx+1:]
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(js)
            print(f"Patched fillProfileForm in {filename}")

patch_file('js/amb.js')
patch_file('js/ins.js')
