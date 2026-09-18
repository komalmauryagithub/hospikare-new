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
        await pool.query("UPDATE hospitals SET hospital_type = COALESCE(hospital_type, 'Multi-Specialty Hospital'), hospital_ownership = COALESCE(hospital_ownership, 'Private') WHERE hospital_type IS NULL OR hospital_ownership IS NULL");
        console.log('Updated existing hospital rows with default type and ownership');
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
