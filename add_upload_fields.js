const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const regex = /{ name: "app_comp", maxCount: 1 },/;
const replacement = `{ name: "app_comp", maxCount: 1 },
      { name: "business_reg_cert", maxCount: 1 },
      { name: "pan_card", maxCount: 1 },
      { name: "gst_cert", maxCount: 1 },
      { name: "auth_person_id", maxCount: 1 },
      { name: "vendor_address_proof", maxCount: 1 },`;

serverJs = serverJs.replace(regex, replacement);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Added new file fields to /api/user/profile');
