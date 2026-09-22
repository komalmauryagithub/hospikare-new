const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
async function run() {
    const [rows] = await pool.query("SELECT b.id, a.ambulance_type, ad.driver_name FROM user_ambulance_bookings b LEFT JOIN ambulances a ON b.ambulance_id = a.id LEFT JOIN ambulance_drivers ad ON (a.assigned_driver_id = ad.id OR ad.assigned_ambulance_id = a.id) WHERE b.tracking_token = '2a64d2ba028a149011f37054097b7312'");
    console.log("Result length: ", rows.length);
    console.log(rows);
    process.exit(0);
}
run();
