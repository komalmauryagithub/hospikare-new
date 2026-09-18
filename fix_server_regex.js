const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

// Normalize line endings to \n first or match with \r?\n
const regex = /\{\s*name:\s*"incorp_cert",\s*maxCount:\s*1\s*\},[\s\S]*?if\s*\(!req\.session\.user\)\s*\{/;

const replacement = `{ name: "incorp_cert", maxCount: 1 },
    { name: "add_proof", maxCount: 1 },
    { name: "drug_lic", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "gst_cer", maxCount: 1 },
    { name: "pharm_cer", maxCount: 1 },
    { name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
    { name: "business_reg_cert", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "gst_cert", maxCount: 1 },
    { name: "auth_person_id", maxCount: 1 },
    { name: "vendor_address_proof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {`;

if (regex.test(serverJs)) {
    serverJs = serverJs.replace(regex, replacement);
    fs.writeFileSync('server.js', serverJs, 'utf8');
    console.log('Successfully replaced regex in server.js');
} else {
    console.log('Regex did not match');
}
