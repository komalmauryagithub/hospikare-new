const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// 1. In loadUserProfile, do not disable form fields via setProfileMode
ambJs = ambJs.replace(/if\(window\.setProfileMode\)\s*\{\s*window\.setProfileMode\([^)]+\);\s*\}/g, '');

// 2. In openProfileModal, ensure all inputs in vendorProfileForm are enabled
const oldOpenProfile = `function openProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
    
    // Auto-fill form if vendor profile is already completed`;

const newOpenProfile = `function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const form = document.getElementById('vendorProfileForm');
    if (form) {
        form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
    }
    
    // Auto-fill form if vendor profile is already completed`;

ambJs = ambJs.replace(oldOpenProfile, newOpenProfile);

// 3. Remove the old duplicate submit listener at the bottom that required entitySelect
const duplicateSubmitRegex = /document\.getElementById\('vendorProfileForm'\)\?\.addEventListener\('submit', async \(event\) => \{\s*event\.preventDefault\(\);\s*const form = event\.target;\s*const entityId = document\.getElementById\('entitySelect'\)\?\.value;[\s\S]*?\}\);/;
ambJs = ambJs.replace(duplicateSubmitRegex, '// Vendor profile submit handled above');

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed amb.js profile modal logic and enabled inputs');
