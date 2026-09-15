const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [res] = await pool.query(`UPDATE user_medicine_orders SET order_status = 'CONFIRMED' WHERE id = 6`);
        console.log(res);
        const [rows] = await pool.query(`SELECT order_status FROM user_medicine_orders WHERE id = 6`);
        console.log("Current status:", rows[0].order_status);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
