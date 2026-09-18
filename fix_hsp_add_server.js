const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const oldAddHspQuery = `                    electricity_bill
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const newAddHspQuery = `                    electricity_bill,
                    hospital_type,
                    hospital_ownership
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

serverJs = serverJs.replace(oldAddHspQuery, newAddHspQuery);

const oldAddHspParams = `          req.files["medical_council_registration"]?.[0]?.filename || null,
          req.files["electricity_bill"]?.[0]?.filename || null,
        ]`;

const newAddHspParams = `          req.files["medical_council_registration"]?.[0]?.filename || null,
          req.files["electricity_bill"]?.[0]?.filename || null,
          body.hospital_type || 'General Hospital',
          body.hospital_ownership || 'Private'
        ]`;

serverJs = serverJs.replace(oldAddHspParams, newAddHspParams);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Updated POST /api/add/hospital in server.js');
