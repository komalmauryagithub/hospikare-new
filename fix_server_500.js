const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

// 1. Add missing fields to upload.fields in PUT /api/user/profile
const oldFields = `{ name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
  ]),
  async (req, res) => {`;

const newFields = `{ name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
    { name: "business_reg_cert", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "gst_cert", maxCount: 1 },
    { name: "auth_person_id", maxCount: 1 },
    { name: "vendor_address_proof", maxCount: 1 },
  ]),
  async (req, res) => {`;

serverJs = serverJs.replace(oldFields, newFields);

// 2. Update GET /api/ambulances query to return driver assignment details
const oldAmbQuery = /SELECT ambulances\.\*, ambulance_drivers\.driver_name\s*FROM ambulances\s*LEFT JOIN ambulance_drivers ON ambulances\.assigned_driver_id = ambulance_drivers\.id\s*WHERE ambulances\.users_id = \?\s*ORDER BY ambulances\.id DESC/;

const newAmbQuery = `SELECT ambulances.*, 
             COALESCE(d.id, d2.id) AS assigned_driver_id,
             COALESCE(d.driver_name, d2.driver_name) AS driver_name
      FROM ambulances 
      LEFT JOIN ambulance_drivers d ON ambulances.assigned_driver_id = d.id 
      LEFT JOIN ambulance_drivers d2 ON d2.assigned_ambulance_id = ambulances.id
      WHERE ambulances.users_id = ? 
      ORDER BY ambulances.id DESC`;

serverJs = serverJs.replace(oldAmbQuery, newAmbQuery);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Successfully updated server.js (fixed profile multer fields & ambulance driver join)');
