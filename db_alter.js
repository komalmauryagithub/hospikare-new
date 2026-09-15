const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'hospinew'
    });

    try {
        console.log('Updating user_medicine_orders...');
        
        await pool.query(`ALTER TABLE user_medicine_orders MODIFY COLUMN order_status ENUM('placed', 'packed', 'shipped', 'delivered', 'cancelled', 'pending_payment', 'confirmed', 'processing', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'rejected') DEFAULT 'pending_payment'`);
        await pool.query(`ALTER TABLE user_medicine_orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'`);
        
        try { await pool.query(`ALTER TABLE user_medicine_orders ADD COLUMN prescription_status ENUM('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'NOT_REQUIRED'`); } catch(e){}
        try { await pool.query(`ALTER TABLE user_medicine_orders ADD COLUMN razorpay_order_id VARCHAR(255) NULL`); } catch(e){}
        try { await pool.query(`ALTER TABLE user_medicine_orders ADD COLUMN razorpay_payment_id VARCHAR(255) NULL`); } catch(e){}

        console.log('Updating user_equipment_orders...');
        
        await pool.query(`ALTER TABLE user_equipment_orders MODIFY COLUMN order_status ENUM('placed', 'delivered', 'returned', 'cancelled', 'pending_payment', 'confirmed', 'processing', 'packed', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'rejected') DEFAULT 'pending_payment'`);
        await pool.query(`ALTER TABLE user_equipment_orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'`);
        
        try { await pool.query(`ALTER TABLE user_equipment_orders ADD COLUMN razorpay_order_id VARCHAR(255) NULL`); } catch(e){}
        try { await pool.query(`ALTER TABLE user_equipment_orders ADD COLUMN razorpay_payment_id VARCHAR(255) NULL`); } catch(e){}

        console.log('Database updated successfully.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
