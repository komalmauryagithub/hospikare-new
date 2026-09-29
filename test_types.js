const mysql = require('mysql2/promise');
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'hospinew' });

async function test() {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = 30");
    console.log(typeof rows[0].edit_allowed, rows[0].edit_allowed);
    console.log(typeof rows[0].vendor_profile_completed, rows[0].vendor_profile_completed);
    process.exit(0);
}
test();
