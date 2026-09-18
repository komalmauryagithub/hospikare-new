const fs = require('fs');
let content = fs.readFileSync('routes_vendor_profile.js', 'utf8');

// Replace the UPDATE hospitals query to include hospital_ownership
const regex = /hospital_registration_number = \?, hospital_type = \?, contact_number = \?,/g;
content = content.replace(regex, 'hospital_registration_number = ?, hospital_type = ?, hospital_ownership = ?, contact_number = ?,');

fs.writeFileSync('routes_vendor_profile.js', content, 'utf8');
