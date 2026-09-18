const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

// Update the SELECT in GET /api/user/profile to include all new vendor columns
serverJs = serverJs.replace(
    'SELECT id, name, users_type, emailorcontact, profile_photo, bank_account, ifsc, identity_proof, cheque FROM users WHERE id = ?',
    'SELECT id, name, users_type, emailorcontact, profile_photo, bank_account, ifsc, identity_proof, cheque, company_name, business_reg_number, contact_number, email, business_address, service_area, service_24x7, business_reg_cert, pan_card, gst_cert, auth_person_id, vendor_address_proof, vendor_profile_completed FROM users WHERE id = ?'
);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Updated GET /api/user/profile to return vendor fields');
