const fs = require('fs');
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

const oldChangeRegex = /\/\/ Auto-fill form when entity is selected\s*select\.addEventListener\('change', async \(e\) => \{[\s\S]*?\}\s*\}\s*\}\s*\}\);\s*\}\s*\}/;

const newChange = `// Auto-fill form when entity is selected
                        select.addEventListener('change', async (e) => {
                            const entityId = e.target.value;
                            if (!entityId) return;
                            try {
                                const res = await fetch('/api/vendor/entity-details/' + entityType + '/' + entityId);
                                const result = await res.json();
                                if (result.success && result.data) {
                                    const form = document.getElementById('vendorProfileForm');
                                    const data = result.data;
                                    
                                    // Remove any previous banners or request buttons
                                    const oldBanner = document.getElementById('editStatusBanner');
                                    if (oldBanner) oldBanner.remove();
                                    const oldReqBtn = document.getElementById('requestEditBtn');
                                    if (oldReqBtn) oldReqBtn.remove();

                                    // Populate all text & number fields
                                    if (form.elements['hospital_registration_number']) {
                                        form.elements['hospital_registration_number'].value = data.hospital_registration_number || '';
                                    }
                                    if (form.elements['address']) {
                                        form.elements['address'].value = data.address || '';
                                    }
                                    if (form.elements['contact_number']) {
                                        form.elements['contact_number'].value = data.contact_number || '';
                                    }
                                    if (form.elements['number_of_beds']) {
                                        form.elements['number_of_beds'].value = data.number_of_beds || '';
                                    }
                                    if (form.elements['facilities']) {
                                        form.elements['facilities'].value = data.facilities || '';
                                    }
                                    
                                    // Explicit matching for hospital_type dropdown
                                    if (data.hospital_type) {
                                        const typeSelect = form.querySelector('select[name="hospital_type"]');
                                        if (typeSelect) {
                                            for (let i = 0; i < typeSelect.options.length; i++) {
                                                if (typeSelect.options[i].value.toLowerCase() === data.hospital_type.toLowerCase() || typeSelect.options[i].text.toLowerCase() === data.hospital_type.toLowerCase()) {
                                                    typeSelect.selectedIndex = i;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Explicit matching for hospital_ownership dropdown
                                    if (data.hospital_ownership) {
                                        const ownSelect = form.querySelector('select[name="hospital_ownership"]');
                                        if (ownSelect) {
                                            for (let i = 0; i < ownSelect.options.length; i++) {
                                                if (ownSelect.options[i].value.toLowerCase() === data.hospital_ownership.toLowerCase() || ownSelect.options[i].text.toLowerCase() === data.hospital_ownership.toLowerCase()) {
                                                    ownSelect.selectedIndex = i;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    const submitBtn = document.getElementById('saveProfileBtn');
                                    const actionBtnsContainer = document.getElementById('profileModalActionButtons');
                                    const fileInputs = form.querySelectorAll('input[type="file"]');
                                    const formInputs = form.querySelectorAll('input:not(#profileEntityType), select:not(#entitySelect), textarea');

                                    // Permission Logic:
                                    // Case 1: Initial Profile (Not completed yet)
                                    if (!data.profile_completed) {
                                        formInputs.forEach(el => { el.disabled = false; el.style.opacity = '1'; });
                                        fileInputs.forEach(input => input.setAttribute('required', 'required'));
                                        if (submitBtn) {
                                            submitBtn.style.display = 'inline-block';
                                            submitBtn.innerText = 'Save Profile';
                                        }
                                    } 
                                    // Case 2: Completed, but Admin Edit permission not granted
                                    else if (data.profile_completed && !data.edit_allowed) {
                                        // Lock all inputs
                                        formInputs.forEach(el => { el.disabled = true; el.style.opacity = '0.85'; el.style.cursor = 'not-allowed'; });
                                        fileInputs.forEach(input => input.removeAttribute('required'));
                                        if (submitBtn) submitBtn.style.display = 'none';

                                        if (data.edit_requested) {
                                            // Edit request already sent, waiting for admin
                                            const banner = document.createElement('div');
                                            banner.id = 'editStatusBanner';
                                            banner.style.cssText = 'grid-column: 1 / -1; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #d97706; padding: 12px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 4px;';
                                            banner.innerHTML = '<i class="fa-solid fa-clock" style="font-size: 16px;"></i> Edit request already sent to Admin. Waiting for Admin approval to edit.';
                                            form.insertBefore(banner, form.children[1]);
                                        } else {
                                            // Show Request Admin for Edit button
                                            if (actionBtnsContainer) {
                                                const reqBtn = document.createElement('button');
                                                reqBtn.type = 'button';
                                                reqBtn.id = 'requestEditBtn';
                                                reqBtn.style.cssText = 'padding: 10px 18px; border: none; background: #f59e0b; color: #fff; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;';
                                                reqBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Request Admin for Edit';
                                                reqBtn.onclick = async () => {
                                                    reqBtn.disabled = true;
                                                    reqBtn.innerText = 'Sending Request...';
                                                    try {
                                                        const reqRes = await fetch('/api/vendor/request-profile-edit/' + entityType + '/' + entityId, { method: 'POST' });
                                                        const reqData = await reqRes.json();
                                                        if (reqData.success) {
                                                            alert(reqData.message || 'Edit request sent to Admin!');
                                                            select.dispatchEvent(new Event('change'));
                                                        } else {
                                                            alert(reqData.message || 'Failed to send request');
                                                            reqBtn.disabled = false;
                                                            reqBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Request Admin for Edit';
                                                        }
                                                    } catch(err) {
                                                        alert('Server error');
                                                        reqBtn.disabled = false;
                                                        reqBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Request Admin for Edit';
                                                    }
                                                };
                                                actionBtnsContainer.prepend(reqBtn);
                                            }
                                        }
                                    } 
                                    // Case 3: Admin Approved Edit Permission
                                    else if (data.profile_completed && data.edit_allowed) {
                                        formInputs.forEach(el => { el.disabled = false; el.style.opacity = '1'; el.style.cursor = 'auto'; });
                                        fileInputs.forEach(input => input.removeAttribute('required'));
                                        
                                        const banner = document.createElement('div');
                                        banner.id = 'editStatusBanner';
                                        banner.style.cssText = 'grid-column: 1 / -1; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #059669; padding: 12px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 4px;';
                                        banner.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size: 16px;"></i> Admin has approved editing! You can now update and save your hospital details.';
                                        form.insertBefore(banner, form.children[1]);

                                        if (submitBtn) {
                                            submitBtn.style.display = 'inline-block';
                                            submitBtn.innerText = 'Update Profile';
                                        }
                                    }
                                }
                            } catch(err) { console.error(err); }
                        });
                    }
                }
            });
    }
}`;

hspJs = hspJs.replace(oldChangeRegex, newChange);
fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Successfully updated js/hsp.js with Admin Edit Approval permission workflow');
