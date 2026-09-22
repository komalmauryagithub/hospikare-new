const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});

async function seed() {
    try {
        const types = [
            'ICU Ambulance',
            'Trauma Ambulance',
            'Emergency Ambulance',
            'Mortuary Ambulance'
        ];
        
        // Find a vendor user id
        const [users] = await pool.query("SELECT id FROM users LIMIT 1");
        const vendorId = users.length ? users[0].id : 1;
        
        for (const type of types) {
            // Create an ambulance
            const [ambRes] = await pool.query(
                "INSERT INTO ambulances (users_id, ambulance_type, vehicle_number, status) VALUES (?, ?, ?, 'Available')",
                [vendorId, type, 'VH-' + Math.floor(Math.random()*9000 + 1000)]
            );
            const ambId = ambRes.insertId;
            
            // Create a driver for it
            const [driverRes] = await pool.query(
                "INSERT INTO ambulance_drivers (users_id, driver_name, mobile_number, status, assigned_ambulance_id) VALUES (?, ?, ?, 'Active', ?)",
                [vendorId, type + ' Driver', '9876543210', ambId]
            );
            const driverId = driverRes.insertId;
            
            // Assign driver to ambulance just in case
            await pool.query(
                "UPDATE ambulances SET assigned_driver_id = ? WHERE id = ?",
                [driverId, ambId]
            );
            
            console.log(`Created ${type} with Ambulance ID ${ambId} and Driver ID ${driverId}`);
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
seed();
