const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        console.log('Creating vendor_pharmacies table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendor_pharmacies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                pharmacy_name VARCHAR(255) NOT NULL,
                owner_name VARCHAR(255) NOT NULL,
                pharmacy_type VARCHAR(100) NOT NULL,
                contact_number VARCHAR(50) NOT NULL,
                email VARCHAR(255),
                alternate_contact VARCHAR(50),
                address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                google_location VARCHAR(255),
                opening_time VARCHAR(20),
                closing_time VARCHAR(20),
                available_24_7 BOOLEAN DEFAULT false,
                home_delivery BOOLEAN DEFAULT false,
                delivery_radius VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating vendor_pharmacists table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendor_pharmacists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                pharmacist_name VARCHAR(255) NOT NULL,
                pharmacy_name VARCHAR(255) NOT NULL,
                registration_number VARCHAR(100) NOT NULL,
                qualification VARCHAR(100) NOT NULL,
                state_pharmacy_council VARCHAR(255) NOT NULL,
                contact_number VARCHAR(50) NOT NULL,
                availability VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Database updated successfully for Pharmacies and Pharmacists.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
