const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
async function run() {
    try {
        await pool.query("ALTER TABLE user_ambulance_bookings MODIFY COLUMN booking_status ENUM('pending', 'accepted', 'arrived', 'completed', 'cancelled') DEFAULT 'pending'");
        console.log("DB Updated");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
