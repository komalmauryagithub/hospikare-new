const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');
ambHtml = ambHtml.replace('<input type="hidden" id="profileEntityType" value="vendor_ambulance">', '<input type="hidden" name="profileEntityType" id="profileEntityType" value="vendor_ambulance">');
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Added name attribute to profileEntityType');
