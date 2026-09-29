import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Fix dropdown icon boolean logic (if it exists)
    pattern1 = r"const (isComplete|isCompleted) = Boolean\(result\.user\?\.vendor_profile_completed( \|\| \(result\.user\?\.bank_account && result\.user\?\.ifsc\))?\);"
    def rep1(m):
        return f"const {m.group(1)} = Number(result.user?.vendor_profile_completed) === 1;"
    js = re.sub(pattern1, rep1, js)

    # 2. Fix the form locking boolean logic (if it uses Boolean)
    pattern2 = r"const isCompleted = Boolean\(user\.vendor_profile_completed\);"
    def rep2(m):
        return r"const isCompleted = Number(user.vendor_profile_completed) === 1;"
    js = re.sub(pattern2, rep2, js)
    
    # 3. Replace ONLY fillProfileForm
    # We use regex to find ONLY the body of fillProfileForm.
    # Since we know the exact body for amb.js and ins.js from git restore:
    old_fill = """async function fillProfileForm(profile, details = {}) {
    if (!profile) return;
    const nameField = document.getElementById("profileName");
    const emailField = document.getElementById("profileEmail");
    const userTypeField = document.getElementById("profileUserType");
    const bankField = document.getElementById("profileBank");
    const ifscField = document.getElementById("profileIfsc");

    if (nameField) nameField.value = profile.name || "";
    if (emailField) emailField.value = profile.emailorcontact || "";
    if (userTypeField && profile.users_type) userTypeField.value = profile.users_type;
    if (bankField) bankField.value = profile.bank_account || "";
    if (ifscField) ifscField.value = profile.ifsc || "";

    if (details) {
        for (const [key, value] of Object.entries(details)) {
            const input = document.querySelector('#vendorProfileForm [name="' + key + '"]');
            if (input && input.type !== 'file') {
                input.value = value || "";
            }
        }
    }
}"""
    
    new_fill = """async function fillProfileForm(profile, details = {}) {
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
    
    js = js.replace(old_fill, new_fill)
    
    # 4. Patch openProfileModal inside amb.js specifically (add bank_account and ifsc)
    if 'amb.js' in filename:
        p_open = r"if \(form\.elements\['business_address'\]\) form\.elements\['business_address'\]\.value = user\.business_address \|\| '';"
        r_open = """if (form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
            if (form.elements['bank_account']) form.elements['bank_account'].value = user.bank_account || '';
            if (form.elements['ifsc']) form.elements['ifsc'].value = user.ifsc || '';"""
        js = re.sub(p_open, r_open, js)
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Properly patched {filename}")

fix_file('js/amb.js')
fix_file('js/ins.js')
