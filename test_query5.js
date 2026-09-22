const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
async function run() {
    const [cols] = await pool.query("SHOW COLUMNS FROM ambulances WHERE Field = 'status'");
    console.log(cols);
    process.exit(0);
}
run();
