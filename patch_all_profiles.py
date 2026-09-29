import re
import os

replacement = """async function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const form = document.getElementById('vendorProfileForm');
    const actionButtons = document.getElementById('profileModalActionButtons');
    if (!form) return;
    
    try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await res.json();
        if (result.success && result.user) {
            const user = result.user;
            
            // Populate fields if they exist
            if (form.elements['company_name']) form.elements['company_name'].value = user.company_name || '';
            if (form.elements['name']) form.elements['name'].value = user.name || '';
            if (form.elements['business_reg_number']) form.elements['business_reg_number'].value = user.business_reg_number || '';
            if (form.elements['contact_number']) form.elements['contact_number'].value = user.contact_number || user.emailorcontact || '';
            if (form.elements['email']) form.elements['email'].value = user.email || (user.emailorcontact && user.emailorcontact.includes('@') ? user.emailorcontact : '');
            if (form.elements['service_area']) form.elements['service_area'].value = user.service_area || '';
            if (form.elements['service_24x7']) form.elements['service_24x7'].value = user.service_24x7 || 'Yes';
            if (form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
            
            const allInputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
            const isCompleted = Boolean(user.vendor_profile_completed);
            const isEditAllowed = Boolean(user.edit_allowed);
            const isEditRequested = Boolean(user.edit_requested);
            
            if (!isCompleted || isEditAllowed) {
                allInputs.forEach(inp => { inp.disabled = false; inp.style.backgroundColor = ''; });
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                        <button type="submit" id="saveProfileBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Profile</button>
                    `;
                }
            } else {
                allInputs.forEach(inp => { inp.disabled = true; inp.style.backgroundColor = '#f1f5f9'; });
                if (actionButtons) {
                    if (!isEditRequested) {
                        actionButtons.innerHTML = `
                            <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                            <button type="button" id="reqAdminBtn" style="padding:10px 18px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Request Admin Edit</button>
                        `;
                        document.getElementById('reqAdminBtn').onclick = async () => {
                            try {
                                document.getElementById('reqAdminBtn').innerText = "Requesting...";
                                const r = await fetch('/api/vendor/request-profile-edit/user/' + user.id, {method:'POST'});
                                const rD = await r.json();
                                if(rD.success) {
                                    alert('Request sent to admin!');
                                    openProfileModal();
                                } else {
                                    alert(rD.message);
                                }
                            } catch(e) {}
                        };
                    } else {
                        actionButtons.innerHTML = `
                            <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                            <button type="button" disabled style="padding:10px 18px; border:none; background:#94a3b8; color:#fff; border-radius:10px; cursor:not-allowed; font-weight:600;">Edit Requested...</button>
                        `;
                    }
                }
            }
        }
    } catch(err) { console.error(err); }
}"""

for filename in ['js/mdc.js', 'js/lt.js', 'js/ins.js', 'js/amb.js']:
    if not os.path.exists(filename):
        continue
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Simple replacement: Find the function openProfileModal() { ... } and replace it completely
    # It might be async function openProfileModal() or function openProfileModal()
    # It might span multiple lines.
    
    match = re.search(r"(?:async\s+)?function\s+openProfileModal\s*\(\)\s*\{.*?(?=\n(?:function|document|let|const|var|\/\/|$))", js, re.DOTALL)
    
    if match:
        js = js[:match.start()] + replacement + js[match.end():]
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(js)
        print(f"{filename} updated.")
    else:
        # Fallback if no specific end found
        # In files like mdc.js it might be short:
        # function openProfileModal() {
        #     const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
        #     if (modal) modal.style.display = "flex";
        # }
        match_short = re.search(r"(?:async\s+)?function\s+openProfileModal\s*\(\)\s*\{[^}]+\}", js)
        if match_short:
            js = js[:match_short.start()] + replacement + js[match_short.end():]
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(js)
            print(f"{filename} updated with short fallback.")
        else:
            print(f"Could not find openProfileModal in {filename}")
