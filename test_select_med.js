const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [rows] = await pool.query(`SELECT medicine_id, medicine_name, price, stock_quantity FROM med_lists WHERE price = 0 OR medicine_name IS NULL OR medicine_name = ''`);
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
