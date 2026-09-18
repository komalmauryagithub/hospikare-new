const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const targetStr = `    { name: "lab_reg", maxCount: 1 },
    { name: "nabl", maxCount: 1 },
    { name: "incorp_cert", maxCount: 1 },
          success: false,
          message: "Unauthorized",
        });
      }`;

const replacementStr = `    { name: "lab_reg", maxCount: 1 },
    { name: "nabl", maxCount: 1 },
    { name: "incorp_cert", maxCount: 1 },
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
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }`;

serverJs = serverJs.replace(targetStr, replacementStr);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Fixed PUT /api/user/profile multer upload fields in server.js');
