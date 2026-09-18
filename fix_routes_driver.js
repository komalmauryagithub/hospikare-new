const fs = require('fs');
let routes = fs.readFileSync('routes_vendor_profile.js', 'utf8');

const oldCrudRegex = /\/\/ ================= DRIVER CRUD =================[\s\S]*?\/\/ ================= END DRIVER CRUD =================/;

const newCrud = `// ================= DRIVER CRUD =================
    app.get('/api/vendor/drivers', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const [rows] = await pool.query(
                \`SELECT d.*, a.ambulance_type, a.vehicle_number 
                 FROM ambulance_drivers d 
                 LEFT JOIN ambulances a ON d.assigned_ambulance_id = a.id 
                 WHERE d.users_id = ? ORDER BY d.id DESC\`, 
                [req.session.user.id]
            );
            res.json({ success: true, data: rows });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });

    app.get('/api/vendor/driver/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const [rows] = await pool.query('SELECT * FROM ambulance_drivers WHERE id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
            if (rows.length > 0) res.json({ success: true, data: rows[0] });
            else res.json({ success: false, message: 'Not found' });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });

    app.post('/api/vendor/driver/create', upload.fields([
        { name: 'driver_photo', maxCount: 1 },
        { name: 'driving_license_doc', maxCount: 1 }
    ]), async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const body = req.body;
            const photo = req.files && req.files['driver_photo'] ? req.files['driver_photo'][0].filename : null;
            const doc = req.files && req.files['driving_license_doc'] ? req.files['driving_license_doc'][0].filename : null;
            const ambId = body.assigned_ambulance_id && body.assigned_ambulance_id !== "" ? body.assigned_ambulance_id : null;
            
            const [insRes] = await pool.query(
                \`INSERT INTO ambulance_drivers 
                (users_id, driver_name, driver_id_str, mobile_number, status, address, driving_license_number, license_expiry_date, driver_photo, driving_license_doc, assigned_ambulance_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
                [req.session.user.id, body.driver_name, body.driver_id_str, body.mobile_number, body.status, body.address, body.driving_license_number, body.license_expiry_date || null, photo, doc, ambId]
            );
            
            if (ambId) {
                await pool.query('UPDATE ambulances SET assigned_driver_id = ? WHERE id = ? AND users_id = ?', [insRes.insertId, ambId, req.session.user.id]);
            }
            res.json({ success: true });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });

    app.post('/api/vendor/driver/update/:id', upload.fields([
        { name: 'driver_photo', maxCount: 1 },
        { name: 'driving_license_doc', maxCount: 1 }
    ]), async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const body = req.body;
            const photo = req.files && req.files['driver_photo'] ? req.files['driver_photo'][0].filename : null;
            const doc = req.files && req.files['driving_license_doc'] ? req.files['driving_license_doc'][0].filename : null;
            const ambId = body.assigned_ambulance_id && body.assigned_ambulance_id !== "" ? body.assigned_ambulance_id : null;
            
            await pool.query(
                \`UPDATE ambulance_drivers SET 
                driver_name = ?, driver_id_str = ?, mobile_number = ?, status = ?, address = ?, driving_license_number = ?, 
                license_expiry_date = ?, driver_photo = COALESCE(?, driver_photo), driving_license_doc = COALESCE(?, driving_license_doc),
                assigned_ambulance_id = ?
                WHERE id = ? AND users_id = ?\`,
                [body.driver_name, body.driver_id_str, body.mobile_number, body.status, body.address, body.driving_license_number, body.license_expiry_date || null, photo, doc, ambId, req.params.id, req.session.user.id]
            );
            
            // Sync ambulance assignment
            await pool.query('UPDATE ambulances SET assigned_driver_id = NULL WHERE assigned_driver_id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
            if (ambId) {
                await pool.query('UPDATE ambulances SET assigned_driver_id = ? WHERE id = ? AND users_id = ?', [req.params.id, ambId, req.session.user.id]);
            }
            
            res.json({ success: true });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });

    app.post('/api/vendor/driver/delete/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            await pool.query('UPDATE ambulances SET assigned_driver_id = NULL WHERE assigned_driver_id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
            await pool.query('DELETE FROM ambulance_drivers WHERE id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
            res.json({ success: true });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });
    // ================= END DRIVER CRUD =================`;

routes = routes.replace(oldCrudRegex, newCrud);
fs.writeFileSync('routes_vendor_profile.js', routes, 'utf8');
console.log('Updated routes_vendor_profile.js driver CRUD');
