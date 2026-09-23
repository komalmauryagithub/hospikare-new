const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });
    try {
        const [rows] = await pool.query('SELECT DISTINCT users_id FROM labs');
        console.log("USERS:", rows);

        // We will just use the first user_id or 1
        const userId = rows.length > 0 ? rows[0].users_id : 1;

        // Delete existing data
        await pool.query('DELETE FROM labs');
        console.log("Deleted old lab tests.");

        // Insert 5 proper sample tests
        const sampleLabs = [
            {
                users_id: userId,
                lab_name: "Thyrocare Technologies",
                address: "Andheri East, Mumbai",
                location: "Mumbai",
                description: "Comprehensive full body checkup and blood tests.",
                lab_type: JSON.stringify(["Pathology", "Biochemistry"]),
                test: JSON.stringify(["Complete Blood Count (CBC)", "Thyroid Profile"]),
                home_coll: "Yes",
                test_price: "1200",
                pathologist: JSON.stringify([{"name":"Dr. Anil Sharma","qualification":"MD Pathology","experience":"10 Yrs","image":""}]),
                lab_hrs: "08:00 AM - 08:00 PM",
                test_time: "24 Hrs",
                emergency_test: "Yes",
                profile_completed: 1
            },
            {
                users_id: userId,
                lab_name: "Dr. Lal PathLabs",
                address: "Connaught Place, New Delhi",
                location: "Delhi",
                description: "Advanced diagnostic imaging and lab tests.",
                lab_type: JSON.stringify(["Pathology", "Microbiology"]),
                test: JSON.stringify(["Lipid Profile", "Liver Function Test"]),
                home_coll: "Yes",
                test_price: "1500",
                pathologist: JSON.stringify([{"name":"Dr. Sunita Rao","qualification":"MBBS, MD","experience":"15 Yrs","image":""}]),
                lab_hrs: "07:00 AM - 09:00 PM",
                test_time: "12 Hrs",
                emergency_test: "Yes",
                profile_completed: 1
            },
            {
                users_id: userId,
                lab_name: "Metropolis Healthcare",
                address: "Koramangala, Bangalore",
                location: "Bangalore",
                description: "Specialized in immunology and serology.",
                lab_type: JSON.stringify(["Immunology", "Pathology"]),
                test: JSON.stringify(["Vitamin D3", "HbA1c"]),
                home_coll: "Yes",
                test_price: "950",
                pathologist: JSON.stringify([{"name":"Dr. Vikram Singh","qualification":"MD Pathology","experience":"8 Yrs","image":""}]),
                lab_hrs: "06:30 AM - 08:30 PM",
                test_time: "24 Hrs",
                emergency_test: "No",
                profile_completed: 1
            },
            {
                users_id: userId,
                lab_name: "SRL Diagnostics",
                address: "Banjara Hills, Hyderabad",
                location: "Hyderabad",
                description: "State-of-the-art genetic testing and molecular diagnostics.",
                lab_type: JSON.stringify(["Molecular Biology", "Genetics"]),
                test: JSON.stringify(["RT-PCR", "Dengue Antigen NS1"]),
                home_coll: "No",
                test_price: "1800",
                pathologist: JSON.stringify([{"name":"Dr. Anjali Verma","qualification":"Ph.D. Molecular Bio","experience":"12 Yrs","image":""}]),
                lab_hrs: "08:00 AM - 06:00 PM",
                test_time: "48 Hrs",
                emergency_test: "Yes",
                profile_completed: 1
            },
            {
                users_id: userId,
                lab_name: "Apollo Diagnostics",
                address: "Salt Lake, Kolkata",
                location: "Kolkata",
                description: "Reliable testing and quick reporting.",
                lab_type: JSON.stringify(["Clinical Pathology", "Hematology"]),
                test: JSON.stringify(["Kidney Function Test", "Urine Routine"]),
                home_coll: "Yes",
                test_price: "850",
                pathologist: JSON.stringify([{"name":"Dr. Rohan Gupta","qualification":"MD","experience":"5 Yrs","image":""}]),
                lab_hrs: "07:00 AM - 10:00 PM",
                test_time: "6 Hrs",
                emergency_test: "No",
                profile_completed: 1
            }
        ];

        for (const lab of sampleLabs) {
            const keys = Object.keys(lab).join(', ');
            const placeholders = Object.keys(lab).map(() => '?').join(', ');
            const values = Object.values(lab);
            await pool.query(`INSERT INTO labs (${keys}) VALUES (${placeholders})`, values);
        }
        console.log("Inserted 5 sample lab tests successfully.");

    } catch (e) {
        console.error(e);
    }
    pool.end();
}
run();
