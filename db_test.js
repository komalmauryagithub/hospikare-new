const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [rows] = await pool.query(`SELECT JSON_ARRAYAGG(JSON_OBJECT('id', 1)) as val`);
        console.log("JSON_ARRAYAGG works");
        process.exit(0);
    } catch (e) {
        console.log("JSON_ARRAYAGG fails");
        process.exit(1);
    }
}
run();
