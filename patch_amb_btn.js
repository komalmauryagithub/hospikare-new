const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');

code = code.replace(
    /<button class="btn btn-primary" type="button" onclick="document\.getElementById\('emergencySosModal'\).*?">Book Now<\/button>/g,
    '<button class="btn btn-primary" type="button" data-action="book-ambulance" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" data-condition="Non-Emergency">Book Now</button>'
);

fs.writeFileSync('js/users.js', code);
console.log('Restored ambulance booking flow in users.js');
