const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        // Hospitals
        await pool.query(`ALTER TABLE hospitals ADD COLUMN hospital_registration_number VARCHAR(255);`).catch(e => console.log('hospitals.hospital_registration_number exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN hospital_type VARCHAR(255);`).catch(e => console.log('hospitals.hospital_type exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN contact_number VARCHAR(50);`).catch(e => console.log('hospitals.contact_number exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN number_of_beds INT;`).catch(e => console.log('hospitals.number_of_beds exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN pan_card VARCHAR(255);`).catch(e => console.log('hospitals.pan_card exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN gst_certificate VARCHAR(255);`).catch(e => console.log('hospitals.gst_certificate exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN authorized_person_id_proof VARCHAR(255);`).catch(e => console.log('hospitals.authorized_person_id_proof exists'));
        await pool.query(`ALTER TABLE hospitals ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;`).catch(e => console.log('hospitals.profile_completed exists'));

        // Ambulances
        await pool.query(`ALTER TABLE ambulances ADD COLUMN ambulance_service_name VARCHAR(255);`).catch(e => console.log('ambulances.ambulance_service_name exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN registration_number VARCHAR(255);`).catch(e => console.log('ambulances.registration_number exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN address TEXT;`).catch(e => console.log('ambulances.address exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN contact_number VARCHAR(50);`).catch(e => console.log('ambulances.contact_number exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN vehicle_number VARCHAR(100);`).catch(e => console.log('ambulances.vehicle_number exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN service_area VARCHAR(255);`).catch(e => console.log('ambulances.service_area exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN vehicle_fitness_certificate VARCHAR(255);`).catch(e => console.log('ambulances.vehicle_fitness_certificate exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN business_registration_proof VARCHAR(255);`).catch(e => console.log('ambulances.business_registration_proof exists'));
        await pool.query(`ALTER TABLE ambulances ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;`).catch(e => console.log('ambulances.profile_completed exists'));

        // Ambulance Drivers
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ambulance_drivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ambulance_id INT NOT NULL,
                users_id INT NOT NULL,
                driver_name VARCHAR(255),
                driver_photo VARCHAR(255),
                mobile_number VARCHAR(50),
                driving_license_number VARCHAR(255),
                license_expiry_date DATE,
                driving_license_doc VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Labs
        await pool.query(`ALTER TABLE labs ADD COLUMN lab_registration_number VARCHAR(255);`).catch(e => console.log('labs.lab_registration_number exists'));
        await pool.query(`ALTER TABLE labs ADD COLUMN contact_number VARCHAR(50);`).catch(e => console.log('labs.contact_number exists'));
        await pool.query(`ALTER TABLE labs ADD COLUMN pan_card VARCHAR(255);`).catch(e => console.log('labs.pan_card exists'));
        await pool.query(`ALTER TABLE labs ADD COLUMN authorized_person_id_proof VARCHAR(255);`).catch(e => console.log('labs.authorized_person_id_proof exists'));
        await pool.query(`ALTER TABLE labs ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;`).catch(e => console.log('labs.profile_completed exists'));

        // Pharmacies
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pharmacies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                users_id INT NOT NULL,
                pharmacy_name VARCHAR(255),
                drug_license_number VARCHAR(255),
                address TEXT,
                contact_number VARCHAR(50),
                pharmacist_name VARCHAR(255),
                home_delivery VARCHAR(50),
                drug_license_doc VARCHAR(255),
                pharmacist_registration_cert VARCHAR(255),
                pan_card VARCHAR(255),
                authorized_person_id_proof VARCHAR(255),
                profile_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`ALTER TABLE medicines ADD COLUMN pharmacy_id INT;`).catch(e => console.log('medicines.pharmacy_id exists'));

        // Equipment Sources
        await pool.query(`
            CREATE TABLE IF NOT EXISTS equipment_sources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                users_id INT NOT NULL,
                source_type VARCHAR(255),
                business_name VARCHAR(255),
                business_registration_number VARCHAR(255),
                address TEXT,
                contact_number VARCHAR(50),
                equipment_category VARCHAR(255),
                sale_rental VARCHAR(50),
                business_registration_cert VARCHAR(255),
                gst_certificate VARCHAR(255),
                pan_card VARCHAR(255),
                authorized_person_id_proof VARCHAR(255),
                manufacturer_authorization VARCHAR(255),
                profile_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`ALTER TABLE equipment_products ADD COLUMN source_id INT;`).catch(e => console.log('equipment_products.source_id exists'));

        // Insurances
        await pool.query(`ALTER TABLE insurances ADD COLUMN contact_number VARCHAR(50);`).catch(e => console.log('insurances.contact_number exists'));
        await pool.query(`ALTER TABLE insurances ADD COLUMN insurance_plans TEXT;`).catch(e => console.log('insurances.insurance_plans exists'));
        await pool.query(`ALTER TABLE insurances ADD COLUMN website VARCHAR(255);`).catch(e => console.log('insurances.website exists'));
        await pool.query(`ALTER TABLE insurances ADD COLUMN authorized_person_id_proof VARCHAR(255);`).catch(e => console.log('insurances.authorized_person_id_proof exists'));
        await pool.query(`ALTER TABLE insurances ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;`).catch(e => console.log('insurances.profile_completed exists'));
        
        console.log("Database update complete!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}
run();
