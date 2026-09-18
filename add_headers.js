const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const regex = /<th>ID<\/th>\s*<th>Type<\/th>\s*<th>Base Charge<\/th>/;
const replacement = `<th>ID</th>
                              <th>Type</th>
                              <th>Reg. No</th>
                              <th>Assigned Driver</th>
                              <th>Base Charge</th>`;
ambHtml = ambHtml.replace(regex, replacement);

fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Added headers to ambulance table');
