const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospikare'
    });
    const tables = ['hospitals', 'ambulances', 'labs', 'pharmacies', 'equipment_sources', 'insurances', 'users'];
    for (const tbl of tables) {
        try {
            await pool.query(`ALTER TABLE ${tbl} ADD COLUMN edit_requested TINYINT(1) DEFAULT 0`);
            console.log(`Added edit_requested to ${tbl}`);
        } catch(e) { /* already exists */ }
        try {
            await pool.query(`ALTER TABLE ${tbl} ADD COLUMN edit_allowed TINYINT(1) DEFAULT 0`);
            console.log(`Added edit_allowed to ${tbl}`);
        } catch(e) { /* already exists */ }
    }
    console.log('Migration completed');
    pool.end();
}
run();
