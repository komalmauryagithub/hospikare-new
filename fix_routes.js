const fs = require('fs');
let content = fs.readFileSync('routes_vendor_profile.js', 'utf8');

// Replace the UPDATE hospitals query to include hospital_ownership
const searchStr = 'hospital_registration_number = ?, hospital_type = ?, contact_number = ?,\n                        number_of_beds = ?, address = ?, facilities = ?,';
const replaceStr = 'hospital_registration_number = ?, hospital_type = ?, hospital_ownership = ?, contact_number = ?,\n                        number_of_beds = ?, address = ?, facilities = ?,';

content = content.replace(searchStr, replaceStr);

// Replace the array of parameters
const paramSearch = '[body.hospital_registration_number, body.hospital_type, body.contact_number, \n                     body.number_of_beds, body.address, body.facilities,';
const paramReplace = '[body.hospital_registration_number, body.hospital_type, body.hospital_ownership, body.contact_number, \n                     body.number_of_beds, body.address, body.facilities,';

content = content.replace(paramSearch, paramReplace);

fs.writeFileSync('routes_vendor_profile.js', content, 'utf8');
