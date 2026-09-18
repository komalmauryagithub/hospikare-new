const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospikare'
    });
    try {
        await pool.query('ALTER TABLE ambulance_drivers ADD COLUMN assigned_ambulance_id INT NULL');
        console.log('Added assigned_ambulance_id to ambulance_drivers');
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') console.log('Column already exists');
        else console.error(e.message);
    } finally {
        pool.end();
    }
}
run();
