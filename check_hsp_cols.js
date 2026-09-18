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
        const [cols] = await pool.query('DESCRIBE hospitals');
        console.log('HOSPITALS COLS:', cols.map(c => c.Field));
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
