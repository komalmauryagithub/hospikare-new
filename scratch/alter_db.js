const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
    user: process.env.DB_USER || process.env.MYSQLUSER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "root",
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || "hospinew",
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  });

  console.log('Connected to MySQL database.');

  try {
    // 1. user_hospital_bookings
    const [cols1] = await connection.query("SHOW COLUMNS FROM user_hospital_bookings LIKE 'payment_type'");
    if (cols1.length === 0) {
      await connection.query("ALTER TABLE user_hospital_bookings ADD COLUMN payment_type ENUM('Full', 'Part') DEFAULT 'Full' AFTER total_amount");
      await connection.query("ALTER TABLE user_hospital_bookings ADD COLUMN paid_amount DECIMAL(10,2) NULL AFTER payment_type");
      console.log("Added payment_type and paid_amount to user_hospital_bookings");
    } else {
      console.log("user_hospital_bookings already has payment_type");
    }

    // 2. user_lab_test_bookings
    const [cols2] = await connection.query("SHOW COLUMNS FROM user_lab_test_bookings LIKE 'payment_type'");
    if (cols2.length === 0) {
      await connection.query("ALTER TABLE user_lab_test_bookings ADD COLUMN payment_type ENUM('Full', 'Part') DEFAULT 'Full' AFTER total_amount");
      await connection.query("ALTER TABLE user_lab_test_bookings ADD COLUMN paid_amount DECIMAL(10,2) NULL AFTER payment_type");
      console.log("Added payment_type and paid_amount to user_lab_test_bookings");
    } else {
      console.log("user_lab_test_bookings already has payment_type");
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await connection.end();
  }
}

runMigration();
