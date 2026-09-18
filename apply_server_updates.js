const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

// 1. Add fields to upload.fields in PUT /api/user/profile
const targetUpload = `    { name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
  ]),`;

const newUpload = `    { name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
    { name: "business_reg_cert", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "gst_cert", maxCount: 1 },
    { name: "auth_person_id", maxCount: 1 },
    { name: "vendor_address_proof", maxCount: 1 },
  ]),`;

serverJs = serverJs.replace(targetUpload, newUpload);

// 2. Add vendor_ambulance handling in PUT /api/user/profile
const targetUpdatesCheck = `      if (updates.length === 0 && Object.keys(detailPayload).length === 0) {`;

const newVendorHandling = `      // Add Ambulance Vendor fields to users table updates
      if (req.body.profileEntityType === 'vendor_ambulance') {
        const vendorFields = [
            'company_name', 'business_reg_number', 'contact_number', 'email',
            'business_address', 'service_area', 'service_24x7'
        ];
        vendorFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(\`\\\`\${field}\\\` = ?\`);
                values.push(req.body[field]);
            }
        });
        
        const vendorFiles = [
            'business_reg_cert', 'pan_card', 'gst_cert', 'auth_person_id', 'vendor_address_proof'
        ];
        vendorFiles.forEach(field => {
            if (req.files && req.files[field] && req.files[field][0]) {
                updates.push(\`\\\`\${field}\\\` = ?\`);
                values.push(req.files[field][0].filename);
            }
        });
        
        updates.push(\`vendor_profile_completed = ?\`);
        values.push(1);
      }

      if (updates.length === 0 && Object.keys(detailPayload).length === 0) {`;

serverJs = serverJs.replace(targetUpdatesCheck, newVendorHandling);

// 3. Update GET /api/user/profile query to return vendor fields
serverJs = serverJs.replace(
    'SELECT id, name, users_type, emailorcontact, profile_photo, bank_account, ifsc, identity_proof, cheque FROM users WHERE id = ?',
    'SELECT id, name, users_type, emailorcontact, profile_photo, bank_account, ifsc, identity_proof, cheque, company_name, business_reg_number, contact_number, email, business_address, service_area, service_24x7, business_reg_cert, pan_card, gst_cert, auth_person_id, vendor_address_proof, vendor_profile_completed FROM users WHERE id = ?'
);

// 4. Update GET /api/ambulances to return assigned driver info
const oldAmbQuery = `                      SELECT *
                      FROM ambulances
                      WHERE users_id = ?
                      ORDER BY id DESC`;

const newAmbQuery = `                      SELECT ambulances.*, 
                             COALESCE(d.id, d2.id) AS assigned_driver_id,
                             COALESCE(d.driver_name, d2.driver_name) AS driver_name
                      FROM ambulances 
                      LEFT JOIN ambulance_drivers d ON ambulances.assigned_driver_id = d.id 
                      LEFT JOIN ambulance_drivers d2 ON d2.assigned_ambulance_id = ambulances.id
                      WHERE ambulances.users_id = ? 
                      ORDER BY ambulances.id DESC`;

serverJs = serverJs.replace(oldAmbQuery, newAmbQuery);

// 5. Add POST /api/update/ambulance/:id endpoint
const newEditEndpoint = `
// Full edit ambulance
app.post("/api/update/ambulance/:id",
  upload.fields([
    { name: "lic", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "veh_ins", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: "Login Required" });
      }
      const body = req.body;
      const userId = req.session.user.id;
      const ambId = req.params.id;

      await pool.query(
        \`UPDATE ambulances SET
          ambulance_type = ?,
          base_chrge = ?,
          min_chrge = ?,
          night_chrg = ?,
          wait_chrg = ?,
          status = ?,
          eta = ?,
          book_time_slot = ?,
          area = ?,
          description = ?,
          vehicle_number = ?,
          lic = COALESCE(?, lic),
          rc = COALESCE(?, rc),
          veh_ins = COALESCE(?, veh_ins)
        WHERE id = ? AND users_id = ?\`,
        [
          body.ambulance_type,
          body.base_chrge,
          body.min_chrge,
          body.night_chrg,
          body.wait_chrg,
          body.status,
          body.eta,
          body.book_time_slot,
          body.area,
          body.description,
          body.vehicle_number || null,
          req.files && req.files.lic ? req.files.lic[0].filename : null,
          req.files && req.files.rc ? req.files.rc[0].filename : null,
          req.files && req.files.veh_ins ? req.files.veh_ins[0].filename : null,
          ambId,
          userId
        ]
      );
      res.json({ success: true, message: "Ambulance updated" });
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: "Server Error" });
    }
  }
);

`;

serverJs = serverJs.replace('app.put("/api/update/ambulance"', newEditEndpoint + 'app.put("/api/update/ambulance"');

// 6. Support vehicle_number in POST /api/add/ambulance
const oldAddAmbQuery = `                      lic,
                      rc,
                      driver_exp,
                      veh_ins
                  )
                  VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const newAddAmbQuery = `                      lic,
                      rc,
                      driver_exp,
                      veh_ins,
                      vehicle_number
                  )
                  VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

serverJs = serverJs.replace(oldAddAmbQuery, newAddAmbQuery);

const oldAddAmbValues = `            body.driver_exp,
            req.files.veh_ins ? req.files.veh_ins[0].filename : "",
          ]`;

const newAddAmbValues = `            body.driver_exp,
            req.files && req.files.veh_ins ? req.files.veh_ins[0].filename : "",
            body.vehicle_number || null
          ]`;

serverJs = serverJs.replace(oldAddAmbValues, newAddAmbValues);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Applied all server.js updates successfully');
