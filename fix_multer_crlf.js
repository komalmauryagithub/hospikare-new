const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const regexUpload = /\{\s*name:\s*"app_comp",\s*maxCount:\s*1\s*\},?\r?\n\s*\]\),/;

const replacementUpload = `{ name: "app_comp", maxCount: 1 },
    { name: "business_reg_cert", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "gst_cert", maxCount: 1 },
    { name: "auth_person_id", maxCount: 1 },
    { name: "vendor_address_proof", maxCount: 1 },
  ]),`;

if (regexUpload.test(serverJs)) {
    serverJs = serverJs.replace(regexUpload, replacementUpload);
    fs.writeFileSync('server.js', serverJs, 'utf8');
    console.log('Successfully added vendor fields to PUT /api/user/profile upload.fields');
} else {
    console.log('regexUpload did not match');
}
