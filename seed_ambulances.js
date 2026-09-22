const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospikare'
    });
    
    // get an ambulance vendor user
    const [users] = await pool.query("SELECT id FROM users WHERE users_type = 'ambulance' AND status = 'approved' LIMIT 1");
    if (users.length === 0) {
        console.log("No approved ambulance vendor found.");
        process.exit();
    }
    const vendorId = users[0].id;

    const types = [
        { type: "Basic Life Support (BLS)", base: 1500 },
        { type: "Advanced Life Support (ALS)", base: 3000 },
        { type: "Patient Transport", base: 1000 },
        { type: "ICU Ambulance", base: 5000 }
    ];

    for (let t of types) {
        const [existing] = await pool.query("SELECT * FROM ambulances WHERE ambulance_type = ?", [t.type]);
        if (existing.length === 0) {
            await pool.query(
                "INSERT INTO ambulances (users_id, ambulance_type, area, status, eta, base_chrge, driver_exp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [vendorId, t.type, "All Zones", "Available", "15 mins", t.base, "5 Years"]
            );
            console.log("Inserted:", t.type);
        }
    }
    console.log("Done seeding ambulances.");
    process.exit();
}
run();
