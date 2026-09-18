const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const regex = /SELECT \*\s*FROM ambulances\s*WHERE users_id = \?\s*ORDER BY id DESC/;
const replacement = `SELECT ambulances.*, ambulance_drivers.driver_name 
                    FROM ambulances 
                    LEFT JOIN ambulance_drivers ON ambulances.assigned_driver_id = ambulance_drivers.id 
                    WHERE ambulances.users_id = ? 
                    ORDER BY ambulances.id DESC`;

serverJs = serverJs.replace(regex, replacement);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Added LEFT JOIN to /api/ambulances');
