const mysql = require('mysql2/promise');
async function run() {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'hospinew' });
    try {
        const [rows] = await pool.query("DESCRIBE ambulance_drivers");
        console.log("ambulance_drivers schema:", rows);
        
        const [amb] = await pool.query("DESCRIBE ambulances");
        console.log("ambulances schema:", amb);
    } catch(e) { console.error(e); }
    process.exit();
}
run();
