const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
async function run() {
    const [rows] = await pool.query("SELECT a.id as ambulance_id FROM ambulances a LEFT JOIN ambulance_drivers ad ON (a.assigned_driver_id = ad.id OR ad.assigned_ambulance_id = a.id) WHERE a.status = 'Available' AND a.ambulance_type = 'Mortuary Ambulance' AND ad.id IS NOT NULL LIMIT 1");
    console.log(rows);
    process.exit(0);
}
run();
