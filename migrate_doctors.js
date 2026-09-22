const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    try {
        const [hospitals] = await pool.query("SELECT id, hospital_name, doctors FROM hospitals");
        for (const hosp of hospitals) {
            let docs = [];
            if (typeof hosp.doctors === "string") {
                try {
                    docs = JSON.parse(hosp.doctors);
                } catch(e) {}
            } else if (Array.isArray(hosp.doctors)) {
                docs = hosp.doctors;
            }

            for (const doc of docs) {
                // Check if already exists to avoid duplicates if run multiple times
                const [existing] = await pool.query("SELECT id FROM hospital_doctors WHERE hospital_id = ? AND name = ?", [hosp.id, doc.doctor_name || doc.name || ""]);
                if (existing.length === 0) {
                    await pool.query(
                        `INSERT INTO hospital_doctors (hospital_id, hospital_name, name, speciality, experience, qualification, available_days, fees, status, gender, dob_age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            hosp.id,
                            hosp.hospital_name,
                            doc.doctor_name || doc.name || "",
                            doc.speciality || "",
                            doc.experience || "",
                            doc.qualification || "",
                            doc.available_days || "",
                            doc.fees || "",
                            doc.status || "",
                            doc.gender || "",
                            doc.dob_age || ""
                        ]
                    );
                    console.log(`Migrated doctor ${doc.doctor_name || doc.name} for hospital ${hosp.hospital_name}`);
                }
            }
        }
        console.log("Migration complete.");
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

migrate();
