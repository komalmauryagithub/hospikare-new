import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Show all entities in the dropdown, not just uncompleted ones
target_dropdown = """                          data.data.forEach(ent => {
                              if (!ent.profile_completed) {
                                  select.innerHTML += '<option value="' + ent.id + '">' + ent.name + '</option>';
                              }
                          });"""
replacement_dropdown = """                          data.data.forEach(ent => {
                              select.innerHTML += '<option value="' + ent.id + '">' + ent.name + '</option>';
                          });"""
js = js.replace(target_dropdown, replacement_dropdown)

# 2. Add the disable logic and request edit button in the change listener
target_change = """                                    if (result.success && result.data) {
                                        const form = document.getElementById('vendorProfileForm');
                                        for (const key in result.data) {
                                            const input = form.querySelector('[name="' + key + '"]');
                                            if (input && result.data[key]) {
                                                input.value = result.data[key];
                                            }
                                        }
                                    }"""

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
                                        
                                        // Skip the entity selector from being disabled
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
                                                            const r = await fetch('/api/vendor/request-profile-edit/' + entityType + '/' + entityId, {method:'POST'});
                                                            const rD = await r.json();
                                                            if(rD.success) {
                                                                alert('Request sent to admin!');
                                                                document.getElementById('profileSectionTrigger').click();
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
js = js.replace(target_change, replacement_change)

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("js/mdeq.js updated with edit restrictions.")
