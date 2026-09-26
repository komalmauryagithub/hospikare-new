
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addHospitalIdColumn() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await pool.query('ALTER TABLE ambulances ADD COLUMN hospital_id INT DEFAULT NULL');
        console.log("Added hospital_id column to ambulances table");
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column hospital_id already exists.");
        } else {
            console.error(e);
        }
    }
    process.exit();
}
addHospitalIdColumn();
