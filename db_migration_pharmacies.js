const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "root",
        database: "hospinew"
    });

    const columnsToAdd = [
        "full_name VARCHAR(255)",
        "email_address VARCHAR(255)",
        "profile_photo VARCHAR(255)",
        "bank_account_number VARCHAR(100)",
        "bank_name VARCHAR(255)",
        "account_holder_name VARCHAR(255)",
        "ifsc_code VARCHAR(50)",
        "cancelled_cheque_file VARCHAR(255)",
        "profile_status VARCHAR(50) DEFAULT 'Active'",
        "verification_status VARCHAR(50) DEFAULT 'Pending'"
    ];

    try {
        for (const col of columnsToAdd) {
            try {
                await pool.query(`ALTER TABLE pharmacies ADD COLUMN ${col}`);
                console.log(`Added column: ${col.split(' ')[0]}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${col.split(' ')[0]}`);
                } else {
                    console.error(`Error adding ${col.split(' ')[0]}:`, e.message);
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
