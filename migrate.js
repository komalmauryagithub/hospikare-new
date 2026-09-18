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
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN company_name VARCHAR(255) NULL,
            ADD COLUMN business_reg_number VARCHAR(100) NULL,
            ADD COLUMN contact_number VARCHAR(20) NULL,
            ADD COLUMN email VARCHAR(100) NULL,
            ADD COLUMN business_address TEXT NULL,
            ADD COLUMN service_area TEXT NULL,
            ADD COLUMN service_24x7 VARCHAR(10) NULL,
            ADD COLUMN business_reg_cert VARCHAR(255) NULL,
            ADD COLUMN pan_card VARCHAR(255) NULL,
            ADD COLUMN gst_cert VARCHAR(255) NULL,
            ADD COLUMN auth_person_id VARCHAR(255) NULL,
            ADD COLUMN vendor_address_proof VARCHAR(255) NULL,
            ADD COLUMN vendor_profile_completed TINYINT(1) DEFAULT 0
        `);
        console.log('Added columns to users table');
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist');
        } else {
            console.error(e.message);
        }
    } finally {
        pool.end();
    }
}
run();
