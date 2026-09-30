const mysql = require('mysql2/promise');
(async () => {
    const pool = await mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
    const queries = [
        'ALTER TABLE user_insurance_claims ADD COLUMN hospital_name VARCHAR(255) DEFAULT NULL',
        'ALTER TABLE user_insurance_claims ADD COLUMN treatment_type VARCHAR(255) DEFAULT NULL',
        'ALTER TABLE user_insurance_claims ADD COLUMN approved_amount DECIMAL(10,2) DEFAULT NULL',
        'ALTER TABLE user_insurance_claims ADD COLUMN admin_remarks TEXT DEFAULT NULL',
        "ALTER TABLE user_insurance_claims MODIFY COLUMN claim_status ENUM('pending','approved','rejected','settled') DEFAULT 'pending'"
    ];
    for (const q of queries) {
        try { await pool.query(q); console.log('Success:', q); }
        catch(e) { console.log('Failed:', e.message); }
    }
    pool.end();
})();
