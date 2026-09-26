const fs = require('fs');
let mdc = fs.readFileSync('js/mdc.js', 'utf8');

// Remove stub functions (handle both \r\n and \n line endings)
// Stub editMedicine
mdc = mdc.replace(/window\.editMedicine = function\(id\) \{\s*alert\("Edit Medicine functionality coming soon for ID: " \+ id\);\s*\};/g, 
    '// editMedicine: full implementation defined below');

// Stub editPharmacy
mdc = mdc.replace(/window\.editPharmacy = function\(id\) \{\s*alert\("Edit Pharmacy functionality coming soon for ID: " \+ id\);\s*\};/g, 
    '// editPharmacy: full implementation defined below');

// Stub editPharmacist
mdc = mdc.replace(/window\.editPharmacist = function\(id\) \{\s*alert\("Edit Pharmacist functionality coming soon for ID: " \+ id\);\s*\};/g, 
    '// editPharmacist: full implementation defined below');

fs.writeFileSync('js/mdc.js', mdc);
console.log('Stub functions removed successfully!');
