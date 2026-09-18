const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const regex = /if \(updates\.length === 0 && Object\.keys\(detailPayload\)\.length === 0\) \{/;

const replacement = `
      // Add Ambulance Vendor fields to users table updates
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

serverJs = serverJs.replace(regex, replacement);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Injected vendor profile update logic');
