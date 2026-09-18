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
        const [hospitals] = await pool.query('SELECT id, users_id, hospital_name, address, hospital_type, hospital_ownership, profile_completed FROM hospitals');
        console.log('ALL HOSPITALS IN DB:', JSON.stringify(hospitals, null, 2));
        
        const [users] = await pool.query("SELECT id, name, emailorcontact, users_type FROM users");
        console.log('ALL USERS:', JSON.stringify(users, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
