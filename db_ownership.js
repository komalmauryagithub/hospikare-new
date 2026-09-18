const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        await pool.query(`ALTER TABLE hospitals ADD COLUMN hospital_ownership VARCHAR(255);`).catch(e => console.log('hospitals.hospital_ownership exists'));
        console.log("Database update complete!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}
run();
