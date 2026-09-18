const fs = require('fs');

const replacementLogic = `
// ====== NEW PROFILE FLOW LOGIC ======
function openProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
    
    // Fetch entities to populate the dropdown
    const entityType = document.getElementById('profileEntityType')?.value;
    if (entityType) {
        fetch('/api/vendor/my-entities/' + entityType)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const select = document.getElementById('entitySelect');
                    if (select) {
                        select.innerHTML = '<option value="">Select entity...</option>';
                        data.data.forEach(ent => {
                            if (!ent.profile_completed) {
                                select.innerHTML += '<option value="' + ent.id + '">' + ent.name + '</option>';
                            }
                        });
                        if (select.options.length === 1) {
                            select.innerHTML = '<option value="">All profiles completed or no entities added.</option>';
                        }
                    }
                }
            });
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}

document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const entityId = document.getElementById('entitySelect')?.value;
    const entityType = document.getElementById('profileEntityType')?.value;
    
    if (!entityId) {
        alert('Please select an entity first.');
        return;
    }
    
    const formData = new FormData(form);
    
    const submitBtn = document.getElementById('saveProfileBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';
    }

    try {
        const response = await fetch('/api/vendor/complete-profile/' + entityType + '/' + entityId, { 
            method: 'POST', 
            body: formData 
        });
        const result = await response.json();
        if (result.success) {
            alert('Profile completed successfully!');
            closeProfileModal();
            form.reset();
        } else {
            alert(result.message || 'Profile completion failed');
        }
    } catch (e) {
        alert('An error occurred.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Profile';
        }
    }
});
// ===================================
`;

const jsFiles = ['js/hsp.js', 'js/amb.js', 'js/lt.js', 'js/mdc.js', 'js/mdeq.js', 'js/ins.js'];

for (const file of jsFiles) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove existing openProfileModal and closeProfileModal
        content = content.replace(/function openProfileModal\(\)[\s\S]*?modal\.style\.display = "flex";\s*\}/g, '');
        content = content.replace(/function closeProfileModal\(\)[\s\S]*?modal\.style\.display = "none";\s*\}/g, '');
        
        // Remove existing vendorProfileForm event listener
        const regex = /document\.getElementById\('vendorProfileForm'\)\?\.addEventListener\('submit'[\s\S]*?\}\);/g;
        content = content.replace(regex, '');

        // Append the new logic
        content += '\n' + replacementLogic;
        
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    } catch(e) {
        console.log('Failed to update ' + file + ': ' + e.message);
    }
}
