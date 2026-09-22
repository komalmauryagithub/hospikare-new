const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
async function run() {
    const [rows] = await pool.query("SELECT a.id, a.ambulance_type, a.status, ad.driver_name FROM ambulances a LEFT JOIN ambulance_drivers ad ON (a.assigned_driver_id = ad.id OR ad.assigned_ambulance_id = a.id)");
    console.log(rows);
    process.exit(0);
}
run();
