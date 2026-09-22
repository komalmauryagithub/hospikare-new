CREATE TABLE IF NOT EXISTS hospital_doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    speciality VARCHAR(255),
    experience VARCHAR(100),
    qualification VARCHAR(255),
    available_days VARCHAR(255),
    fees VARCHAR(50),
    status VARCHAR(50),
    gender VARCHAR(50),
    dob_age VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
