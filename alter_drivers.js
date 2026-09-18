const mysql = require('mysql2/promise');
async function run() {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'hospinew' });
    try {
        await pool.query("ALTER TABLE ambulance_drivers MODIFY ambulance_id INT NULL;");
        await pool.query("ALTER TABLE ambulance_drivers ADD COLUMN driver_id_str VARCHAR(100) NULL;");
        await pool.query("ALTER TABLE ambulance_drivers ADD COLUMN address VARCHAR(255) NULL;");
        await pool.query("ALTER TABLE ambulance_drivers ADD COLUMN status VARCHAR(50) DEFAULT 'Active';");
        
        await pool.query("ALTER TABLE ambulances ADD COLUMN assigned_driver_id INT NULL;");
        console.log("DB updated");
    } catch(e) { console.error(e); }
    process.exit();
}
run();
