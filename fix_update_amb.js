const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    /UPDATE ambulances SET\s*ambulance_type = \?,\s*base_chrge = \?,\s*min_chrge = \?,\s*night_chrg = \?,\s*wait_chrg = \?,\s*status = \?,\s*eta = \?,\s*book_time_slot = \?,\s*area = \?,\s*description = \?,\s*lic = COALESCE\(\?, lic\),\s*rc = COALESCE\(\?, rc\),\s*driver_exp = \?,\s*veh_ins = COALESCE\(\?, veh_ins\)/g,
    `UPDATE ambulances SET
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
                    lic = COALESCE(?, lic),
                    rc = COALESCE(?, rc),
                    driver_exp = ?,
                    veh_ins = COALESCE(?, veh_ins),
                    assigned_driver_id = ?`
);

content = content.replace(
    /req\.files\["veh_ins"\]\?\.\[0\]\?\.filename \|\| null,\n\s*\],\n\s*\);/g,
    `req.files["veh_ins"]?.[0]?.filename || null,
            body.assigned_driver_id || null,
          ],
        );`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Fixed UPDATE ambulances in server.js');
