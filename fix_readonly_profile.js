const fs = require('fs');

// 1. Update amb.html
let ambHtml = fs.readFileSync('amb.html', 'utf8');

ambHtml = ambHtml.replace(
    '<h3 style="margin:0; font-size:18px; font-weight:700; font-family:var(--font-heading); color:var(--text-main, #0f172a);">Profile Details</h3>',
    '<h3 id="profileModalTitle" style="margin:0; font-size:18px; font-weight:700; font-family:var(--font-heading); color:var(--text-main, #0f172a);">Profile Details</h3>'
);

ambHtml = ambHtml.replace(
    '<p style="margin:4px 0 0; font-size:12.5px; color:var(--text-muted, #64748b);">Manage your ambulance vendor credentials and business details</p>',
    '<p id="profileModalSubtitle" style="margin:4px 0 0; font-size:12.5px; color:var(--text-muted, #64748b);">Manage your ambulance vendor credentials and business details</p>'
);

fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Updated amb.html profile modal header IDs');

// 2. Update amb.js
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// Update loadUserProfile
const oldLoadUserRegex = /async function loadUserProfile\(\)\{[\s\S]*?const profileSectionTrigger = document\.getElementById\("profileSectionTrigger"\);/;

const newLoadUser = `async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await response.json();
        if(result.success){
            const vendorName = result.user?.company_name || result.user?.name || result.details?.vendor_name || "Ambulance Partner";
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = \`Welcome \${vendorName}\`;
            
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });

            const profileNameEl = document.querySelector('.profile-name');
            if (profileNameEl) profileNameEl.innerText = vendorName;

            fillProfileForm(result.user, result.details || {});
            
            const isComplete = Boolean(result.user.vendor_profile_completed);
            const triggerEl = document.getElementById('profileSectionTrigger');
            if (triggerEl) {
                triggerEl.style.display = 'flex';
                const triggerText = document.getElementById('profileTriggerText');
                const triggerIcon = triggerEl.querySelector('i');
                if(triggerText) {
                    triggerText.innerText = isComplete ? 'View Profile' : 'Complete Profile';
                }
                if(triggerIcon) {
                    triggerIcon.className = isComplete ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                    triggerIcon.style.color = isComplete ? '#10b981' : '#3b82f6';
                }
            }
        }
        else{
            window.location.href = "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const profileSectionTrigger = document.getElementById("profileSectionTrigger");`;

ambJs = ambJs.replace(oldLoadUserRegex, newLoadUser);

// Update openProfileModal logic
const oldOpenModalRegex = /function openProfileModal\(\) \{[\s\S]*?function closeProfileModal\(\) \{/;

const newOpenModal = `function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const form = document.getElementById('vendorProfileForm');
    const saveBtn = document.getElementById('saveProfileBtn');
    const titleEl = document.getElementById('profileModalTitle');
    const subtitleEl = document.getElementById('profileModalSubtitle');
    
    // Auto-fill form and check completion status
    fetch('/api/user/profile')
        .then(res => res.json())
        .then(result => {
            if (result.success && result.user) {
                const user = result.user;
                const isComplete = Boolean(user.vendor_profile_completed);
                
                if (form) {
                    if(form.elements['company_name']) form.elements['company_name'].value = user.company_name || '';
                    if(form.elements['name']) form.elements['name'].value = user.name || '';
                    if(form.elements['business_reg_number']) form.elements['business_reg_number'].value = user.business_reg_number || '';
                    if(form.elements['contact_number']) form.elements['contact_number'].value = user.contact_number || '';
                    if(form.elements['email']) form.elements['email'].value = user.email || '';
                    if(form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
                    if(form.elements['service_area']) form.elements['service_area'].value = user.service_area || '';
                    if(form.elements['service_24x7']) form.elements['service_24x7'].value = user.service_24x7 || 'Yes';
                    
                    if (isComplete) {
                        // READ-ONLY VIEW MODE: Disable all inputs and hide save button
                        form.querySelectorAll('input, select, textarea').forEach(el => {
                            el.disabled = true;
                            el.style.opacity = '0.9';
                            el.style.cursor = 'default';
                        });
                        if (saveBtn) saveBtn.style.display = 'none';
                        if (titleEl) titleEl.innerHTML = 'Profile Details <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 12px; padding: 2px 8px; border-radius: 6px; font-weight: 700; margin-left: 8px;">? Verified Profile</span>';
                        if (subtitleEl) subtitleEl.innerText = 'Submitted vendor details & credentials (Read-Only)';
                    } else {
                        // EDIT / COMPLETE MODE: Enable all inputs and show save button
                        form.querySelectorAll('input, select, textarea').forEach(el => {
                            el.disabled = false;
                            el.style.opacity = '1';
                            el.style.cursor = 'auto';
                        });
                        if (saveBtn) {
                            saveBtn.style.display = 'inline-block';
                            saveBtn.innerText = 'Save Profile';
                        }
                        if (titleEl) titleEl.innerText = 'Profile Details';
                        if (subtitleEl) subtitleEl.innerText = 'Manage your ambulance vendor credentials and business details';
                    }
                }
            }
        }).catch(err => console.error(err));
}

function closeProfileModal() {`;

ambJs = ambJs.replace(oldOpenModalRegex, newOpenModal);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated amb.js with read-only profile view mode');
