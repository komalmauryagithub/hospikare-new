const mysql = require('mysql2/promise');
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'root', database: 'hospinew' });

async function test() {
    try {
        const userId = 16; // A user that might have edit_allowed = 1
        
        // Force it to 1 first
        await pool.query("UPDATE users SET edit_allowed = 1 WHERE id = ?", [userId]);
        
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = rows[0];
        console.log("Before:", { vendor_profile_completed: user.vendor_profile_completed, edit_allowed: user.edit_allowed });
        
        let updates = [];
        let values = [];
        let body = { is_vendor_profile: '1', bank_account: '1234', ifsc: 'ABCD' };
        
        if (body.is_vendor_profile || body.company_name || body.business_reg_number || body.bank_account || body.ifsc) {
            updates.push("vendor_profile_completed = 1");
            updates.push("edit_allowed = 0");
            updates.push("edit_requested = 0");
        }
        
        if (updates.length > 0) {
            values.push(userId);
            await pool.query(
                `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
                values,
            );
            console.log("UPDATE successful");
        }
        
        const [rows2] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user2 = rows2[0];
        console.log("After:", { vendor_profile_completed: user2.vendor_profile_completed, edit_allowed: user2.edit_allowed });
        
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
test();
