const mysql = require('mysql2/promise');
const pool = mysql.createPool({host:'localhost', user:'root', password:'root', database:'hospinew'});
const crypto = require('crypto');
async function run() {
    try {
        const tracking_token = crypto.randomBytes(16).toString("hex");
        const [result] = await pool.execute(
        `INSERT INTO
                user_ambulance_bookings(
                    user_id,
                    ambulance_id,
                    patient_name,
                    patient_condition,
                    pickup_address,
                    destination_address,
                    booking_date,
                    total_amount,
                    razorpay_order_id,
                    razorpay_payment_id,
                    payment_status,
                    tracking_token
                )
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            17,
            10,
            "test",
            "test",
            "a",
            "b",
            "2026-09-18T10:24:00.000Z",
            3000,
            "test_order",
            "test_payment",
            "paid",
            tracking_token,
        ]
        );
        console.log(result);
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
