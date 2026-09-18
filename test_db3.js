const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [rows] = await pool.query(`SELECT id, hospital_name as name, profile_completed FROM hospitals`);
        console.log("Success. Rows:", rows.length);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        process.exit();
    }
}
run();
