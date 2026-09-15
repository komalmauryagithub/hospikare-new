const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        const [res] = await pool.query(`DELETE FROM med_lists WHERE selling_price = 0 OR medicine_name IS NULL OR medicine_name = ''`);
        console.log(res);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
