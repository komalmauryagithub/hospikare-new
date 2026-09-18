const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const oldLoadUser = /async function loadUserProfile\(\)\{[\s\S]*?const profileSectionTrigger = document\.getElementById\("profileSectionTrigger"\);/;

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
                if (isComplete) {
                    // Hide option completely once profile is completed/updated
                    triggerEl.style.display = 'none';
                } else {
                    triggerEl.style.display = 'flex';
                    const triggerText = document.getElementById('profileTriggerText');
                    if(triggerText) {
                        triggerText.innerText = 'Complete Profile';
                    }
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

ambJs = ambJs.replace(oldLoadUser, newLoadUser);

// Also in submit listener, hide trigger immediately
ambJs = ambJs.replace(
    'alert("Profile updated successfully");\n        closeProfileModal();\n        await loadUserProfile();',
    'alert("Profile updated successfully");\n        closeProfileModal();\n        const triggerEl = document.getElementById("profileSectionTrigger");\n        if (triggerEl) triggerEl.style.display = "none";\n        await loadUserProfile();'
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated loadUserProfile to hide Complete Profile once completed');
