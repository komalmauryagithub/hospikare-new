const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "root",
        database: "hospinew"
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS insurance_companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                users_id INT NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                company_type VARCHAR(100),
                contact_person VARCHAR(255),
                mobile_number VARCHAR(20),
                email VARCHAR(255),
                website VARCHAR(255),
                full_address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                insurance_tpa_name VARCHAR(255),
                policy_types VARCHAR(255),
                cashless_available VARCHAR(50),
                claim_support VARCHAR(100),
                network_hospitals INT,
                status VARCHAR(50) DEFAULT 'Active',
                verification_status VARCHAR(50) DEFAULT 'Pending',
                company_registration_cert VARCHAR(255),
                irdai_registration VARCHAR(255),
                authorization_doc VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("insurance_companies table created.");
        
        try {
            await pool.query(`ALTER TABLE insurances ADD COLUMN company_id INT`);
            console.log("company_id added to insurances table.");
        } catch(e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("company_id already exists.");
            else console.error(e);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
