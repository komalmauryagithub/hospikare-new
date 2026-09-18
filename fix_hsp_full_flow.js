const fs = require('fs');
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

// 1. Update loadUserProfile with dynamic Complete Profile vs Show Profile check
const oldLoadUserRegex = /async function loadUserProfile\(\)\{[\s\S]*?document\.getElementById\("hospitalForm"\)/;

const newLoadUser = `async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await response.json();
        if(result.success){
            const vendorName = result.user?.name || result.details?.hospital_name || "Vendor";
            currentVendorName = vendorName;
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = \`Welcome \${vendorName}\`;
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });
            fillProfileForm(result.user, result.details || {});
            
            // Check if ALL hospitals of this user have completed their profiles
            try {
                const resEnt = await fetch('/api/vendor/my-entities/hospital');
                const entData = await resEnt.json();
                const triggerText = document.getElementById('profileTriggerText');
                const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
                if (entData.success && entData.data && entData.data.length > 0) {
                    const allCompleted = entData.data.every(h => Boolean(h.profile_completed));
                    if (triggerText) {
                        triggerText.innerText = allCompleted ? 'Show Profile' : 'Complete Profile';
                    }
                    if (triggerIcon) {
                        triggerIcon.className = allCompleted ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                        triggerIcon.style.color = allCompleted ? '#10b981' : '#3b82f6';
                    }
                } else if (triggerText) {
                    triggerText.innerText = 'Complete Profile';
                }
            } catch(e) {}
        }
    } catch(err) {
        console.error("Error loading profile:", err);
    }
}

document.getElementById("hospitalForm")`;

hspJs = hspJs.replace(oldLoadUserRegex, newLoadUser);

// 2. Update openProfileModal and submit in js/hsp.js
const oldOpenModalRegex = /function openProfileModal\(\) \{[\s\S]*?function closeProfileModal\(\) \{/;

const newOpenModal = `function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.style.display = 'inline-block';
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Profile';
    }
    
    const form = document.getElementById('vendorProfileForm');
    if (form) {
        form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
    }
    
    // Fetch entities to populate the dropdown
    const entityType = document.getElementById('profileEntityType')?.value;
    if (entityType) {
        fetch('/api/vendor/my-entities/' + entityType)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const select = document.getElementById('entitySelect');
                    if (select) {
                        select.innerHTML = '<option value="">Select Hospital Name...</option>';
                        data.data.forEach(ent => {
                            select.innerHTML += '<option value="' + ent.id + '">' + ent.name + (ent.profile_completed ? ' (Profile Completed)' : '') + '</option>';
                        });
                        
                        if (select.options.length === 1) {
                            select.innerHTML = '<option value="">No hospitals added yet.</option>';
                        }
                        
                        // Auto-fill form when entity is selected
                        select.addEventListener('change', async (e) => {
                            const entityId = e.target.value;
                            if (!entityId) return;
                            try {
                                const res = await fetch('/api/vendor/entity-details/' + entityType + '/' + entityId);
                                const result = await res.json();
                                if (result.success && result.data) {
                                    const form = document.getElementById('vendorProfileForm');
                                    const data = result.data;
                                    
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
                                    
                                    // Toggle button text and required file fields
                                    const submitBtn = document.getElementById('saveProfileBtn');
                                    const fileInputs = form.querySelectorAll('input[type="file"]');
                                    if (data.profile_completed) {
                                        if (submitBtn) submitBtn.innerText = 'Update Profile';
                                        fileInputs.forEach(input => input.removeAttribute('required'));
                                    } else {
                                        if (submitBtn) submitBtn.innerText = 'Save Profile';
                                        fileInputs.forEach(input => input.setAttribute('required', 'required'));
                                    }
                                }
                            } catch(err) { console.error(err); }
                        });
                    }
                }
            });
    }
}

function closeProfileModal() {`;

hspJs = hspJs.replace(oldOpenModalRegex, newOpenModal);

// Also in submit listener, reload loadUserProfile on success
hspJs = hspJs.replace(
    "closeProfileModal();\n            form.reset();",
    "closeProfileModal();\n            form.reset();\n            await loadUserProfile();"
);

fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Successfully updated js/hsp.js');
