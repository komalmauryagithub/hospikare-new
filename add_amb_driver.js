const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Update INSERT INTO ambulances
content = content.replace(
    /INSERT INTO ambulances[\s\S]*?VALUES[\s\S]*?\(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)/,
    `INSERT INTO ambulances
                (
                    users_id,
                    ambulance_type,
                    base_chrge,
                    min_chrge,
                    night_chrg,
                    wait_chrg,
                    status,
                    eta,
                    book_time_slot,
                    area,
                    description,
                    lic,
                    rc,
                    driver_exp,
                    veh_ins,
                    assigned_driver_id
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// Update parameters array for INSERT INTO ambulances
content = content.replace(
    /req\.files\["veh_ins"\]\?\.\[0\]\?\.filename \|\| null,\n\s*\]/g,
    `req.files["veh_ins"]?.[0]?.filename || null,
            body.assigned_driver_id || null,
        ]`
);

// Update UPDATE ambulances
content = content.replace(
    /veh_ins = COALESCE\(\?, veh_ins\)/g,
    'veh_ins = COALESCE(?, veh_ins),\n                    assigned_driver_id = ?'
);
content = content.replace(
    /req\.files\["veh_ins"\]\?\.\[0\]\?\.filename \|\| null,\n\s*ambulanceId,\n\s*userId,\n\s*\]/g,
    `req.files["veh_ins"]?.[0]?.filename || null,
            body.assigned_driver_id || null,
            ambulanceId,
            userId,
        ]`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Modified server.js');
