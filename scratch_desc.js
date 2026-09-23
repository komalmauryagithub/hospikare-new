const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });
    try {
        const [rows] = await pool.query('DESCRIBE labs');
        console.log(rows);
    } catch (e) {
        console.error(e);
    }
    pool.end();
}
run();
