async function openHospitalProfileModal(hospitalId) {
    const modal = document.getElementById("hospitalEntityModal");
    const entitySelect = document.getElementById('hospitalEntitySelect');
    
    if (entitySelect) {
        if (entitySelect.options.length <= 1) {
            try {
                const res = await fetch('/api/vendor/my-entities/hospital');
                const result = await res.json();
                if (result.success && result.data) {
                    entitySelect.innerHTML = '<option value="">Select Hospital...</option>';
                    let count = 0;
                    result.data.forEach(ent => {
                        entitySelect.innerHTML += `<option value="${ent.id}">${ent.name}</option>`;
                        count++;
                    });
                    if (count === 0) {
                        entitySelect.innerHTML = '<option value="">No hospitals available</option>';
                    }
                }
            } catch(e) {}
        }
        
        if (hospitalId) {
            if (!Array.from(entitySelect.options).some(opt => opt.value == hospitalId)) {
                entitySelect.innerHTML += `<option value="${hospitalId}">Loading...</option>`;
            }
            entitySelect.parentElement.style.display = 'none';
            entitySelect.value = hospitalId;
        } else {
            entitySelect.parentElement.style.display = 'flex';
            entitySelect.value = '';
        }
        
        // Trigger data fetch for the selected hospital
        await handleHospitalEntitySelect(entitySelect.value);
    }
    
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeHospitalEntityModal() {
    const modal = document.getElementById("hospitalEntityModal");
    if (modal) modal.style.display = "none";
}

async function handleHospitalEntitySelect(entityId) {
    const bannerContainer = document.getElementById('hospitalStatusBannerContainer');
    const actionButtons = document.getElementById('hospitalEntityActionButtons');
    const form = document.getElementById('hospitalEntityForm');
    
    if (!entityId) {
        if (bannerContainer) bannerContainer.innerHTML = '';
        form.reset();
        if (actionButtons) {
            actionButtons.innerHTML = `
                <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Details</button>
            `;
        }
        return;
    }
    
    try {
        const res = await fetch('/api/vendor/entity-details/hospital/' + entityId);
        const result = await res.json();
        if (result.success && result.data) {
            const entityData = result.data;
            
            // Populate text & number fields
            const textFields = ['hospital_registration_number', 'address', 'contact_number', 'number_of_beds', 'facilities'];
            textFields.forEach(field => {
                if (form.elements[field]) {
                    form.elements[field].value = entityData[field] || '';
                }
            });
            
            // Explicit matching for dropdowns
            ['hospital_type', 'hospital_ownership'].forEach(field => {
                if (entityData[field]) {
                    const select = form.querySelector(`select[name="${field}"]`);
                    if (select) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value.toLowerCase() === entityData[field].toLowerCase() || select.options[i].text.toLowerCase() === entityData[field].toLowerCase()) {
                                select.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
            });
            
            const fileInputs = form.querySelectorAll('input[type="file"]');
            const allInputs = form.querySelectorAll('input, select, textarea');
            
            if (!entityData.profile_completed) {
                // Not completed
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '#fff';
                });
                fileInputs.forEach(input => input.setAttribute('required', 'required'));
                // GST is optional
                const gst = form.querySelector('[name="gst_certificate"]');
                if(gst) gst.removeAttribute('required');
                
                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="padding:12px 16px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:10px; font-size:13px; color:#1d4ed8; font-weight:500; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-circle-info" style="font-size:16px;"></i>
                            <div>Please complete the required details and upload your hospital registration documents below to verify your hospital.</div>
                        </div>
                    `;
                }
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                        <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 22px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-floppy-disk"></i> Save Details</button>
                    `;
                }
            } else if (!entityData.edit_allowed) {
                // Completed & Locked
                allInputs.forEach(input => {
                    if (input.id !== 'hospitalEntitySelect' && input.name !== 'hospitalEntityType') {
                        input.disabled = true;
                        input.style.backgroundColor = '#f8fafc';
                    }
                });
                fileInputs.forEach(input => input.removeAttribute('required'));
                
                if (!entityData.edit_requested) {
                    if (bannerContainer) {
                        let statusHtml = '';
                        if (entityData.status === 'pending') {
                            statusHtml = `
                            <div style="background:rgba(245, 158, 11, 0.1); color:#d97706; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(245, 158, 11, 0.2);">
                                <i class="fa-solid fa-clock"></i>
                                <div style="font-size:13px;">
                                    <strong style="display:block; margin-bottom:2px;">Under Review</strong>
                                    Hospital details are currently being reviewed by our admin team.
                                </div>
                            </div>`;
                        } else if (entityData.status === 'approved') {
                            statusHtml = `
                            <div style="background:rgba(16, 185, 129, 0.1); color:#059669; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(16, 185, 129, 0.2);">
                                <i class="fa-solid fa-circle-check"></i>
                                <div style="font-size:13px; display:flex; justify-content:space-between; align-items:center; width:100%;">
                                    <div>
                                        <strong style="display:block; margin-bottom:2px;">Hospital Verified</strong>
                                        Hospital details are verified and active on the platform.
                                    </div>
                                    <button type="button" onclick="requestHospitalEdit(${entityId})" style="background:#059669; color:#fff; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                                        Request Edit <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                </div>
                            </div>`;
                        }
                        bannerContainer.innerHTML = statusHtml;
                    }
                } else {
                    if (bannerContainer) {
                        bannerContainer.innerHTML = `
                            <div style="padding:12px 16px; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; font-size:13px; color:#92400e; font-weight:500; display:flex; align-items:center; gap:10px;">
                                <i class="fa-solid fa-shield-halved" style="color:#d97706; font-size:18px;"></i>
                                <div style="flex:1;">
                                    <strong>Edit Requested.</strong> Pending admin approval to update hospital details.
                                </div>
                            </div>
                        `;
                    }
                }
                
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                    `;
                }
            } else {
                // Edit Mode Unlocked
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '#fff';
                });
                fileInputs.forEach(input => input.removeAttribute('required'));
                
                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="background:rgba(59, 130, 246, 0.1); color:#2563eb; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(59, 130, 246, 0.2);">
                            <i class="fa-solid fa-unlock"></i>
                            <div style="font-size:13px;">
                                <strong style="display:block; margin-bottom:2px;">Edit Mode Unlocked</strong>
                                You can now update hospital details.
                            </div>
                        </div>
                    `;
                }
                
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Cancel</button>
                        <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 22px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-paper-plane"></i> Submit Updates</button>
                    `;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching entity details:', e);
    }
}

document.getElementById('hospitalEntitySelect')?.addEventListener('change', (e) => {
    handleHospitalEntitySelect(e.target.value);
});

async function requestHospitalEdit(entityId) {
    try {
        const reqRes = await fetch('/api/vendor/request-profile-edit/hospital/' + entityId, { method: 'POST' });
        const reqData = await reqRes.json();
        if (reqData.success) {
            alert('Edit request sent to Admin successfully! Once Admin approves, you can update details.');
            handleHospitalEntitySelect(entityId);
        } else {
            alert(reqData.message || 'Failed to submit request.');
        }
    } catch(err) {
        alert('Network error while requesting edit.');
    }
}

document.getElementById('hospitalEntityForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const entityId = document.getElementById('hospitalEntitySelect')?.value;
    if (!entityId) {
        alert("Please select a hospital first.");
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const btn = document.getElementById('saveHospitalEntityBtn');
    if(btn) { btn.disabled = true; btn.innerHTML = 'Saving...'; }
    
    try {
        const res = await fetch('/api/vendor/complete-profile/hospital/' + entityId, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message || 'Hospital details saved successfully!');
            closeHospitalEntityModal();
            loadHospitalProfiles(); // Refresh the list
        } else {
            alert(data.message || 'Failed to save details.');
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    } finally {
        if(btn) { btn.disabled = false; btn.innerHTML = 'Save Details'; }
    }
});
