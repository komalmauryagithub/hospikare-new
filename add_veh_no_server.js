const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

let regex = /INSERT INTO ambulances\s*\([\s\S]*?veh_ins,\s*assigned_driver_id\s*\)\s*VALUES\s*\(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)/;
let replacement = `INSERT INTO ambulances
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
                    assigned_driver_id,
                    vehicle_number
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
serverJs = serverJs.replace(regex, replacement);

regex = /body\.driver_exp,\n\s*req\.files\.veh_ins\s*\?\s*req\.files\.veh_ins\[0\]\.filename\s*:\s*"",\n\s*body\.assigned_driver_id \|\| null/g;
replacement = `body.driver_exp,
            req.files.veh_ins ? req.files.veh_ins[0].filename : "",
            body.assigned_driver_id || null,
            body.vehicle_number || null`;
serverJs = serverJs.replace(regex, replacement);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Added vehicle_number to INSERT INTO ambulances');
