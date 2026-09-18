const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [rows] = await pool.query(`SELECT id, hospital_name, profile_completed FROM hospitals`);
        console.log(rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}
run();
