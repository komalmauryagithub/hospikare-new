import mysql.connector
import os

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="hospikare"
    )
    cursor = conn.cursor()
    
    # 1. Alter user_hospital_bookings
    try:
        cursor.execute("ALTER TABLE user_hospital_bookings ADD COLUMN payment_type ENUM('Full', 'Part') DEFAULT 'Full' AFTER total_amount")
        print("Added payment_type to user_hospital_bookings")
    except Exception as e:
        print(f"Error adding payment_type to hospital bookings: {e}")
        
    try:
        cursor.execute("ALTER TABLE user_hospital_bookings ADD COLUMN paid_amount DECIMAL(10,2) AFTER payment_type")
        # Update existing records
        cursor.execute("UPDATE user_hospital_bookings SET paid_amount = total_amount WHERE paid_amount IS NULL")
        print("Added paid_amount to user_hospital_bookings")
    except Exception as e:
        print(f"Error adding paid_amount to hospital bookings: {e}")

    # 2. Alter user_lab_test_bookings
    try:
        cursor.execute("ALTER TABLE user_lab_test_bookings ADD COLUMN payment_type ENUM('Full', 'Part') DEFAULT 'Full' AFTER total_amount")
        print("Added payment_type to user_lab_test_bookings")
    except Exception as e:
        print(f"Error adding payment_type to lab bookings: {e}")
        
    try:
        cursor.execute("ALTER TABLE user_lab_test_bookings ADD COLUMN paid_amount DECIMAL(10,2) AFTER payment_type")
        # Update existing records
        cursor.execute("UPDATE user_lab_test_bookings SET paid_amount = total_amount WHERE paid_amount IS NULL")
        print("Added paid_amount to user_lab_test_bookings")
    except Exception as e:
        print(f"Error adding paid_amount to lab bookings: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("Database updates completed successfully.")

except Exception as e:
    print(f"Connection error: {e}")
