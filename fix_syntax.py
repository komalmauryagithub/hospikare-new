import re

def fix(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # The broken part is:
    # }
    # }) {
    #     if (!profile) return;
    
    # Let's find "async function fillProfileForm(profile, details = {}) {" and everything after it until we find a known function like "async function openProfileModal" or "function openProfileModal"
    # Actually, we can just look for the replacement text I inserted, and then delete the junk after it up to openProfileModal or whatever is next.

    pattern = r"(async function fillProfileForm\(profile, details = \{\}\) \{[\s\S]*?\}\n\})\) \{[\s\S]*?(?=\nasync function openProfileModal|\nfunction openProfileModal|\n\n\n|\Z)"
    
    # Wait, the junk is:
    # }) {
    #     if (!profile) return;
    #     ...
    # }
    
    # So it looks like:
    # }
    # }) {
    #    ...
    # }
    
    # Let's just find the duplicate function body and remove it.
    
    # Or better yet, let's restore the file from a git checkout (if git is tracking it) or just use regex.
    # Let's use a simpler approach:
    # I will replace the ENTIRE broken block by matching `async function fillProfileForm(profile, details = {}) {` and going until `async function openProfileModal` (or `function openProfileModal`).
    
    pattern2 = r"async function fillProfileForm\(profile, details = \{\}\) \{[\s\S]*?(?=\nasync function openProfileModal|\nfunction openProfileModal)"
    
    replacement2 = """async function fillProfileForm(profile, details = {}) {
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
}
"""
    
    js = re.sub(pattern2, replacement2, js)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Fixed {filename}")

fix('js/amb.js')
fix('js/ins.js')
