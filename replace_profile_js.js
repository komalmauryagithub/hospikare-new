const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const regex = /function openProfileModal\(\) \{[\s\S]*?\}\);/g;

const newLogic = `function openProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
    
    // Auto-fill form if vendor profile is already completed
    fetch('/api/user/profile')
        .then(res => res.json())
        .then(result => {
            if (result.success && result.user) {
                const user = result.user;
                if (user.vendor_profile_completed) {
                    const form = document.getElementById('vendorProfileForm');
                    if(form.elements['company_name']) form.elements['company_name'].value = user.company_name || '';
                    if(form.elements['name']) form.elements['name'].value = user.name || '';
                    if(form.elements['business_reg_number']) form.elements['business_reg_number'].value = user.business_reg_number || '';
                    if(form.elements['contact_number']) form.elements['contact_number'].value = user.contact_number || '';
                    if(form.elements['email']) form.elements['email'].value = user.email || '';
                    if(form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
                    if(form.elements['service_area']) form.elements['service_area'].value = user.service_area || '';
                    if(form.elements['service_24x7']) form.elements['service_24x7'].value = user.service_24x7 || 'Yes';
                    
                    // Since it's completed, change button text
                    const submitBtn = document.getElementById('saveProfileBtn');
                    if (submitBtn) {
                        submitBtn.innerText = 'Update Profile';
                    }
                    
                    // Remove required attributes from files if updating
                    const fileInputs = form.querySelectorAll('input[type="file"]');
                    fileInputs.forEach(input => {
                        input.removeAttribute('required');
                    });
                }
            }
        }).catch(err => console.error(err));
}
`;

ambJs = ambJs.replace(regex, newLogic);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated openProfileModal logic');
