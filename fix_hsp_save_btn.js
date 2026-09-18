const fs = require('fs');

// 1. Update vendor-panel-controls.js to never hide saveProfileBtn
let vpc = fs.readFileSync('js/vendor-panel-controls.js', 'utf8');
vpc = vpc.replace(/if\(saveBtn\)\s*saveBtn\.style\.display\s*=\s*'none';/g, '// if(saveBtn) saveBtn.style.display = \'none\';');
fs.writeFileSync('js/vendor-panel-controls.js', vpc, 'utf8');
console.log('Fixed vendor-panel-controls.js');

// 2. Update js/hsp.js
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

// Remove setProfileMode in loadUserProfile
hspJs = hspJs.replace(/if\(window\.setProfileMode\)\s*\{\s*window\.setProfileMode\([^)]+\);\s*\}/g, '');

// Ensure saveBtn is visible in openProfileModal
const oldOpenModalRegex = /function openProfileModal\(\) \{[\s\S]*?const entityType = document\.getElementById\('profileEntityType'\)\?\.value;/;

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
    const entityType = document.getElementById('profileEntityType')?.value;`;

hspJs = hspJs.replace(oldOpenModalRegex, newOpenModal);
fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Fixed js/hsp.js openProfileModal save button visibility');
