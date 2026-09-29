import re
import os

def patch_file(filename):
    if not os.path.exists(filename):
        return
        
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Show all entities in the dropdown, not just uncompleted ones
    js = re.sub(
        r"data\.data\.forEach\(ent\s*=>\s*\{\s*if\s*\(!ent\.profile_completed\)\s*\{\s*select\.innerHTML\s*\+=\s*'<option value=\"'\s*\+\s*ent\.id\s*\+\s*'\">' \+\s*ent\.name\s*\+\s*'</option>';\s*\}\s*\}\);",
        r"data.data.forEach(ent => { select.innerHTML += '<option value=\"' + ent.id + '\">' + ent.name + '</option>'; });",
        js
    )

    # 2. Add the disable logic and request edit button in the change listener
    replacement_change = """                                    if (result.success && result.data) {
                                        const form = document.getElementById('vendorProfileForm');
                                        const entityData = result.data;
                                        
                                        for (const key in entityData) {
                                            const input = form.querySelector('[name="' + key + '"]');
                                            if (input && entityData[key]) {
                                                input.value = entityData[key];
                                            }
                                        }
                                        
                                        const actionButtons = document.getElementById('profileModalActionButtons');
                                        const allInputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
                                        const fileInputs = form.querySelectorAll('input[type="file"]');
                                        const entitySelectNode = document.getElementById('entitySelect');
                                        
                                        if (!entityData.profile_completed || entityData.edit_allowed) {
                                            allInputs.forEach(inp => { if (inp !== entitySelectNode) inp.disabled = false; inp.style.backgroundColor = ''; });
                                            if (actionButtons) {
                                                actionButtons.innerHTML = `
                                                    <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                                                    <button type="submit" id="saveProfileBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Profile</button>
                                                `;
                                            }
                                        } else {
                                            allInputs.forEach(inp => { if (inp !== entitySelectNode) inp.disabled = true; inp.style.backgroundColor = '#f1f5f9'; });
                                            if (actionButtons) {
                                                if (!entityData.edit_requested) {
                                                    actionButtons.innerHTML = `
                                                        <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                                                        <button type="button" id="reqEditBtn" style="padding:10px 18px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Request Admin Edit</button>
                                                    `;
                                                    document.getElementById('reqEditBtn').onclick = async () => {
                                                        try {
                                                            document.getElementById('reqEditBtn').innerText = "Requesting...";
                                                            const r = await fetch('/api/vendor/request-profile-edit/' + entityType + '/' + entityId, {method:'POST'});
                                                            const rD = await r.json();
                                                            if(rD.success) {
                                                                alert('Request sent to admin!');
                                                                // trigger re-select to update UI
                                                                select.dispatchEvent(new Event('change'));
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
                                    }"""

    js = re.sub(
        r"if\s*\(\s*result\.success\s*&&\s*result\.data\s*\)\s*\{\s*const\s*form\s*=\s*document\.getElementById\('vendorProfileForm'\);\s*for\s*\(\s*const\s*key\s*in\s*result\.data\s*\)\s*\{\s*const\s*input\s*=\s*form\.querySelector\('\[name=\"'\s*\+\s*key\s*\+\s*'\"\]'\);\s*if\s*\(\s*input\s*&&\s*result\.data\[key\]\s*\)\s*\{\s*input\.value\s*=\s*result\.data\[key\];\s*\}\s*\}\s*\}",
        replacement_change,
        js
    )

    # 3. Fix the "All profiles completed" logic
    js = re.sub(
        r"if\s*\(\s*select\.options\.length\s*===\s*1\s*\)\s*\{\s*select\.innerHTML\s*=\s*'<option value=\"\">All profiles completed or no entities added\.</option>';\s*\}",
        r"if (select.options.length === 1) { select.innerHTML = '<option value=\"\">No entities added yet.</option>'; }",
        js
    )
    
    # 4. Remove duplicate listener if present
    target_bad_listener = """document.getElementById("vendorProfileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const password = document.getElementById("profilePassword")?.value || "";
    const confirmPassword = document.getElementById("profileConfirmPassword")?.value || "";
    if (password && password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    const formData = new FormData(form);
    if (!password) formData.delete("password");
    const response = await fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: formData });
    const result = await response.json();
    if (result.success) {
        alert("Profile updated successfully");
        closeProfileModal();
        await loadUserProfile();
    } else {
        alert(result.message || "Profile update failed");
    }
});"""
    js = js.replace(target_bad_listener, "")
    
    # 5. Fix trigger text
    target_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }"""
    replacement_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            const pTriggerText = document.getElementById('profileTriggerText');
            if (pTriggerText) {
                pTriggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }"""
    js = js.replace(target_trigger, replacement_trigger)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"{filename} successfully updated via regex.")

for fn in ['js/mdc.js', 'js/lt.js', 'js/ins.js']:
    patch_file(fn)
