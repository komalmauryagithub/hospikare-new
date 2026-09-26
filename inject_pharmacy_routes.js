const fs = require('fs');

const routes = `
// ==================== PHARMACY ENDPOINTS ====================
app.post("/api/vendor/add-pharmacy", upload.any(), async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        
        const vendorId = req.session.user.id;
        const b = req.body;
        
        await pool.query(
            \`INSERT INTO vendor_pharmacies 
            (vendor_id, pharmacy_name, owner_name, pharmacy_type, contact_number, city, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')\`,
            [vendorId, b.pharmacy_name, b.owner_name, b.pharmacy_type, b.contact_number, b.city]
        );
        
        res.json({ success: true, message: "Pharmacy added successfully" });
    } catch (error) {
        console.error("Add Pharmacy Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.post("/api/vendor/add-pharmacist", upload.any(), async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        
        const vendorId = req.session.user.id;
        const b = req.body;
        
        await pool.query(
            \`INSERT INTO vendor_pharmacists 
            (vendor_id, pharmacist_name, pharmacy_name, registration_number, qualification, state_pharmacy_council, contact_number, availability) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
            [vendorId, b.pharmacist_name, b.pharmacy_name, b.registration_number, b.qualification, b.state_pharmacy_council, b.contact_number, b.availability]
        );
        
        res.json({ success: true, message: "Pharmacist added successfully" });
    } catch (error) {
        console.error("Add Pharmacist Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/api/vendor/pharmacies", async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        const vendorId = req.session.user.id;
        
        const [rows] = await pool.query("SELECT * FROM vendor_pharmacies WHERE vendor_id = ? ORDER BY id DESC", [vendorId]);
        res.json({ success: true, pharmacies: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/api/vendor/pharmacists", async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        const vendorId = req.session.user.id;
        
        const [rows] = await pool.query("SELECT * FROM vendor_pharmacists WHERE vendor_id = ? ORDER BY id DESC", [vendorId]);
        res.json({ success: true, pharmacists: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
// ============================================================

`;

let content = fs.readFileSync('server.js', 'utf8');
content = content.replace('app.get("/api/vendor/dashboard"', routes + 'app.get("/api/vendor/dashboard"');
fs.writeFileSync('server.js', content);
console.log('Routes injected successfully.');
