module.exports = function(app, pool, upload) {

    // 1. Fetch Entities
    app.get('/api/vendor/my-entities/:type', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const userId = req.session.user.id;
            const type = req.params.type;
            let query = '';
            if (type === 'hospital') { query = 'SELECT id, hospital_name as name, profile_completed FROM hospitals WHERE users_id = ?'; }
            else if (type === 'ambulance') { query = "SELECT id, COALESCE(NULLIF(ambulance_service_name, ''), CONCAT(ambulance_type, ' Ambulance (', COALESCE(vehicle_number, id), ')')) as name, profile_completed FROM ambulances WHERE users_id = ?"; }
            else if (type === 'lab') { query = 'SELECT id, lab_name as name, profile_completed FROM labs WHERE users_id = ?'; }
            else if (type === 'pharmacy') { query = 'SELECT id, pharmacy_name as name, profile_completed FROM pharmacies WHERE users_id = ?'; }
            else if (type === 'equipment_source') { query = 'SELECT id, business_name as name, profile_completed FROM equipment_sources WHERE users_id = ?'; }
            else if (type === 'insurance') { query = 'SELECT id, comp_name as name, profile_completed FROM insurances WHERE users_id = ?'; }
            else { return res.json({ success: false, message: 'Invalid type' }); }

            const [rows] = await pool.query(query, [userId]);
            res.json({ success: true, data: rows });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    
    // 1.5 Fetch Entity Details
    app.get('/api/vendor/entity-details/:type/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const type = req.params.type;
            const entityId = req.params.id;
            let query = '';
            
            if (type === 'hospital') { query = 'SELECT * FROM hospitals WHERE id = ?'; }
            else if (type === 'ambulance') { query = 'SELECT * FROM ambulances WHERE id = ?'; }
            else if (type === 'lab') { query = 'SELECT * FROM labs WHERE id = ?'; }
            else if (type === 'pharmacy') { query = 'SELECT * FROM pharmacies WHERE id = ?'; }
            else if (type === 'equipment_source') { query = 'SELECT * FROM equipment_sources WHERE id = ?'; }
            else if (type === 'insurance') { query = 'SELECT * FROM insurances WHERE id = ?'; }
            
            const [rows] = await pool.query(query, [entityId]);
            if (rows.length > 0) {
                res.json({ success: true, data: rows[0] });
            } else {
                res.json({ success: false });
            }
        } catch (e) {
            res.json({ success: false });
        }
    });

    
    // 1.8 Request Profile Edit from Admin
    app.post('/api/vendor/request-profile-edit/:type/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const type = req.params.type;
            const entityId = req.params.id;
            const userId = req.session.user.id;
            
            const tableMap = { 
                hospital: 'hospitals', 
                ambulance: 'ambulances', 
                lab: 'labs', 
                pharmacy: 'pharmacies', 
                equipment_source: 'equipment_sources', 
                insurance: 'insurances',
                vendor_ambulance: 'users',
                user: 'users',
                vendor: 'users'
            };
            const tbl = tableMap[type];
            if (!tbl) return res.json({ success: false, message: 'Invalid entity type' });
            
            if (tbl === 'users') {
                await pool.query(`UPDATE users SET edit_requested = 1, edit_allowed = 0 WHERE id = ?`, [userId]);
                return res.json({ success: true, message: 'Edit request sent to Admin. Once approved, you can update details.' });
            }

            await pool.query(`UPDATE \`${tbl}\` SET edit_requested = 1, edit_allowed = 0 WHERE id = ? AND users_id = ?`, [entityId, userId]);
            res.json({ success: true, message: 'Edit request sent to Admin. Once approved, you can update details.' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    // 1.9 Admin: Approve / Reject Profile Edit Request
    app.post('/api/admin/approve-profile-edit/:type/:id', async (req, res) => {
        try {
            const type = req.params.type;
            const entityId = req.params.id;
            const tableMap = { hospital: 'hospitals', ambulance: 'ambulances', lab: 'labs', pharmacy: 'pharmacies', equipment_source: 'equipment_sources', insurance: 'insurances', vendor_ambulance: 'users', user: 'users', vendor: 'users' };
            const tbl = tableMap[type];
            if (!tbl) return res.json({ success: false, message: 'Invalid entity type' });

            if (tbl === 'users') {
                await pool.query(`UPDATE users SET edit_allowed = 1, edit_requested = 0 WHERE id = ?`, [entityId]);
                return res.json({ success: true, message: 'Profile edit permission approved for vendor.' });
            }

            await pool.query(`UPDATE \`${tbl}\` SET edit_allowed = 1, edit_requested = 0 WHERE id = ?`, [entityId]);
            res.json({ success: true, message: 'Profile edit permission approved for vendor.' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    app.post('/api/admin/reject-profile-edit/:type/:id', async (req, res) => {
        try {
            const type = req.params.type;
            const entityId = req.params.id;
            const tableMap = { hospital: 'hospitals', ambulance: 'ambulances', lab: 'labs', pharmacy: 'pharmacies', equipment_source: 'equipment_sources', insurance: 'insurances', vendor_ambulance: 'users', user: 'users', vendor: 'users' };
            const tbl = tableMap[type];
            if (!tbl) return res.json({ success: false, message: 'Invalid entity type' });

            if (tbl === 'users') {
                await pool.query(`UPDATE users SET edit_allowed = 0, edit_requested = 0 WHERE id = ?`, [entityId]);
                return res.json({ success: true, message: 'Profile edit request rejected.' });
            }

            await pool.query(`UPDATE \`${tbl}\` SET edit_allowed = 0, edit_requested = 0 WHERE id = ?`, [entityId]);
            res.json({ success: true, message: 'Profile edit request rejected.' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    app.post('/api/admin/revoke-profile-edit/:type/:id', async (req, res) => {
        try {
            const type = req.params.type;
            const entityId = req.params.id;
            const tableMap = { hospital: 'hospitals', ambulance: 'ambulances', lab: 'labs', pharmacy: 'pharmacies', equipment_source: 'equipment_sources', insurance: 'insurances', vendor_ambulance: 'users', user: 'users', vendor: 'users' };
            const tbl = tableMap[type];
            if (!tbl) return res.json({ success: false, message: 'Invalid entity type' });

            if (tbl === 'users') {
                await pool.query(`UPDATE users SET edit_allowed = 0, edit_requested = 0 WHERE id = ?`, [entityId]);
                return res.json({ success: true, message: 'Profile edit permission revoked.' });
            }

            await pool.query(`UPDATE \`${tbl}\` SET edit_allowed = 0, edit_requested = 0 WHERE id = ?`, [entityId]);
            res.json({ success: true, message: 'Profile edit permission revoked.' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    app.get('/api/admin/pending-profile-edits', async (req, res) => {
        try {
            const queries = [
                pool.query(`SELECT h.id, h.hospital_name as name, 'hospital' as type, h.users_id, u.name as vendor_name, u.emailorcontact, h.created_at FROM hospitals h JOIN users u ON h.users_id = u.id WHERE h.edit_requested = 1`),
                pool.query(`SELECT a.id, a.ambulance_service_name as name, 'ambulance' as type, a.users_id, u.name as vendor_name, u.emailorcontact, a.created_at FROM ambulances a JOIN users u ON a.users_id = u.id WHERE a.edit_requested = 1`),
                pool.query(`SELECT l.id, l.lab_name as name, 'lab' as type, l.users_id, u.name as vendor_name, u.emailorcontact, l.created_at FROM labs l JOIN users u ON l.users_id = u.id WHERE l.edit_requested = 1`),
                pool.query(`SELECT p.id, p.pharmacy_name as name, 'pharmacy' as type, p.users_id, u.name as vendor_name, u.emailorcontact, p.created_at FROM pharmacies p JOIN users u ON p.users_id = u.id WHERE p.edit_requested = 1`),
                pool.query(`SELECT e.id, e.business_name as name, 'equipment_source' as type, e.users_id, u.name as vendor_name, u.emailorcontact, e.created_at FROM equipment_sources e JOIN users u ON e.users_id = u.id WHERE e.edit_requested = 1`),
                pool.query(`SELECT i.id, i.comp_name as name, 'insurance' as type, i.users_id, u.name as vendor_name, u.emailorcontact, i.created_at FROM insurances i JOIN users u ON i.users_id = u.id WHERE i.edit_requested = 1`),
                pool.query(`SELECT u.id, COALESCE(NULLIF(u.company_name, ''), u.name) as name, 'vendor_ambulance' as type, u.id as users_id, u.name as vendor_name, u.emailorcontact, u.created_at FROM users u WHERE u.users_type = 'ambulance' AND u.edit_requested = 1`)
            ];
            const results = await Promise.allSettled(queries);
            let allPending = [];
            results.forEach(r => {
                if (r.status === 'fulfilled' && r.value && r.value[0]) {
                    allPending = allPending.concat(r.value[0]);
                }
            });
            res.json({ success: true, count: allPending.length, data: allPending });
        } catch (e) {
            console.error(e);
            res.json({ success: false, count: 0, data: [] });
        }
    });

// 2. Complete Profile endpoints

    const uploadFields = upload.fields([
        { name: 'hospital_reg_certificate', maxCount: 1 },
        { name: 'pan_card', maxCount: 1 },
        { name: 'gst_certificate', maxCount: 1 },
        { name: 'authorized_person_id_proof', maxCount: 1 },
        { name: 'ambulance_registration_rc', maxCount: 1 },
        { name: 'vehicle_fitness_certificate', maxCount: 1 },
        { name: 'vehicle_insurance', maxCount: 1 },
        { name: 'driver_license', maxCount: 1 },
        { name: 'business_registration_proof', maxCount: 1 },
        { name: 'nabl_certificate', maxCount: 1 },
        { name: 'drug_license_doc', maxCount: 1 },
        { name: 'pharmacist_registration_cert', maxCount: 1 },
        { name: 'manufacturer_authorization', maxCount: 1 },
        { name: 'irdai_license_doc', maxCount: 1 },
        { name: 'company_registration_cert', maxCount: 1 }
    ]);

    app.post('/api/vendor/complete-profile/:type/:id', upload.any(), async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const userId = req.session.user.id;
            const type = req.params.type;
            const entityId = req.params.id;
            const body = req.body;
            const files = req.files || [];

            const getFile = (name) => {
                if (!files) return null;
                if (Array.isArray(files)) {
                    const f = files.find(item => item.fieldname === name);
                    return f ? f.filename : null;
                }
                return files[name]?.[0]?.filename || null;
            };

            if (type === 'hospital') {
                const doc1 = getFile('hospital_reg_certificate');
                const doc2 = getFile('pan_card');
                const doc3 = getFile('gst_certificate');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    `UPDATE hospitals SET 
                        hospital_registration_number = ?, hospital_type = ?, hospital_ownership = ?, contact_number = ?, 
                        number_of_beds = ?, address = ?, facilities = ?,
                        hospital_reg_certificate = COALESCE(?, hospital_reg_certificate),
                        pan_card = COALESCE(?, pan_card),
                        gst_certificate = COALESCE(?, gst_certificate),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.hospital_registration_number, body.hospital_type, body.hospital_ownership, body.contact_number, 
                     body.number_of_beds, body.address, body.facilities,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            } 
            else if (type === 'ambulance') {
                const doc1 = getFile('ambulance_registration_rc') || getFile('rc') || getFile('business_reg_cert');
                const doc2 = getFile('vehicle_fitness_certificate');
                const doc3 = getFile('vehicle_insurance') || getFile('veh_ins');
                const doc4 = getFile('driver_license') || getFile('lic');
                const doc5 = getFile('business_registration_proof') || getFile('vendor_address_proof');
                
                await pool.query(
                    `UPDATE ambulances SET 
                        ambulance_service_name = COALESCE(?, ambulance_service_name),
                        registration_number = ?, contact_number = ?, vehicle_number = ?, 
                        service_area = ?, address = ?, ambulance_type = ?,
                        rc = COALESCE(?, rc),
                        vehicle_fitness_certificate = COALESCE(?, vehicle_fitness_certificate),
                        veh_ins = COALESCE(?, veh_ins),
                        lic = COALESCE(?, lic),
                        business_registration_proof = COALESCE(?, business_registration_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.ambulance_service_name || body.company_name || null,
                     body.registration_number || body.business_reg_number || null, 
                     body.contact_number, body.vehicle_number, 
                     body.service_area, body.address || body.business_address, body.ambulance_type,
                     doc1, doc2, doc3, doc4, doc5, entityId, userId]
                );
            } 
            else if (type === 'lab') {
                const doc1 = getFile('hospital_reg_certificate');
                const doc2 = getFile('nabl_certificate');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    `UPDATE labs SET 
                        lab_registration_number = ?, contact_number = ?, address = ?, 
                        test = ?, home_coll = ?,
                        lab_reg = COALESCE(?, lab_reg),
                        nabl = COALESCE(?, nabl),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.lab_registration_number, body.contact_number, body.address, 
                     body.test, body.home_coll,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            }
            else if (type === 'pharmacy') {
                const doc1 = getFile('drug_license_doc');
                const doc2 = getFile('pharmacist_registration_cert');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    `UPDATE pharmacies SET 
                        drug_license_number = ?, contact_number = ?, address = ?, 
                        pharmacist_name = ?, home_delivery = ?,
                        drug_license_doc = COALESCE(?, drug_license_doc),
                        pharmacist_registration_cert = COALESCE(?, pharmacist_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.drug_license_number, body.contact_number, body.address, 
                     body.pharmacist_name, body.home_delivery,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            }
            else if (type === 'equipment_source') {
                const doc1 = getFile('business_registration_proof');
                const doc2 = getFile('gst_certificate');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                const doc5 = getFile('manufacturer_authorization');
                
                await pool.query(
                    `UPDATE equipment_sources SET 
                        business_registration_number = ?, contact_number = ?, address = ?, 
                        equipment_category = ?, sale_rental = ?,
                        business_registration_cert = COALESCE(?, business_registration_cert),
                        gst_certificate = COALESCE(?, gst_certificate),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        manufacturer_authorization = COALESCE(?, manufacturer_authorization),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.business_registration_number, body.contact_number, body.address, 
                     body.equipment_category, body.sale_rental,
                     doc1, doc2, doc3, doc4, doc5, entityId, userId]
                );
            }
            else if (type === 'insurance') {
                const doc1 = getFile('irdai_license_doc');
                const doc2 = getFile('company_registration_cert');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    `UPDATE insurances SET 
                        irdai = ?, contact_number = ?, offc_add = ?, 
                        insurance_plans = ?, website = ?,
                        irdai_license_doc = COALESCE(?, irdai_license_doc),
                        company_registration_cert = COALESCE(?, company_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.irdai_registration_number, body.contact_number, body.registered_office_address, 
                     body.insurance_plans, body.website,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            }

            res.json({ success: true, message: 'Profile completed successfully' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

    // 3. Add Driver
    const driverUpload = upload.fields([
        { name: 'driver_photo', maxCount: 1 },
        { name: 'driving_license_doc', maxCount: 1 }
    ]);
    app.post('/api/vendor/add-driver', driverUpload, async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            const body = req.body;
            const files = req.files || {};
            const photo = files['driver_photo'] ? files['driver_photo'][0].filename : null;
            const doc = files['driving_license_doc'] ? files['driving_license_doc'][0].filename : null;

            await pool.query(`INSERT INTO ambulance_drivers 
                (ambulance_id, users_id, driver_name, driver_photo, mobile_number, driving_license_number, license_expiry_date, driving_license_doc) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [body.ambulance_id, req.session.user.id, body.driver_name, photo, body.mobile_number, body.driving_license_number, body.license_expiry_date, doc]);
            res.json({ success: true });
        } catch(e) {
            res.json({ success: false, error: e.message });
        }
    });

    // 4. Add Pharmacy Basic
    app.post('/api/vendor/add-pharmacy-basic', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            await pool.query(`INSERT INTO pharmacies (users_id, pharmacy_name) VALUES (?, ?)`, [req.session.user.id, req.body.pharmacy_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    // 5. Add Equipment Source Basic
    app.post('/api/vendor/add-equipment-source-basic', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            await pool.query(`INSERT INTO equipment_sources (users_id, source_type, business_name) VALUES (?, ?, ?)`, 
                [req.session.user.id, req.body.source_type, req.body.business_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    // 6. Add Insurance Company Basic
    app.post('/api/vendor/add-insurance-company-basic', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            await pool.query(`INSERT INTO insurances (users_id, comp_name) VALUES (?, ?)`, [req.session.user.id, req.body.company_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });


    // ================= DRIVER CRUD =================
    app.get('/api/vendor/drivers', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const [rows] = await pool.query(
                `SELECT d.*, 
                        COALESCE(a.ambulance_type, a2.ambulance_type) AS ambulance_type, 
                        COALESCE(a.vehicle_number, a2.vehicle_number) AS vehicle_number,
                        COALESCE(a.base_chrge, a2.base_chrge) AS base_chrge,
                        COALESCE(a.min_chrge, a2.min_chrge) AS min_chrge,
                        COALESCE(a.night_chrg, a2.night_chrg) AS night_chrg,
                        COALESCE(a.wait_chrg, a2.wait_chrg) AS wait_chrg,
                        COALESCE(a.area, a2.area) AS area,
                        COALESCE(a.eta, a2.eta) AS eta,
                        COALESCE(d.assigned_ambulance_id, a2.id) AS assigned_ambulance_id
                 FROM ambulance_drivers d 
                 LEFT JOIN ambulances a ON d.assigned_ambulance_id = a.id 
                 LEFT JOIN ambulances a2 ON a2.assigned_driver_id = d.id
                 WHERE d.users_id = ? ORDER BY d.id DESC`, 
                [req.session.user.id]
            );
            res.json({ success: true, data: rows });
        } catch (e) { res.json({ success: false, message: e.message }); }
    });

    app.get('/api/vendor/driver/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const [rows] = await pool.query(
                `SELECT d.*, 
                        COALESCE(d.assigned_ambulance_id, a.id) AS assigned_ambulance_id,
                        COALESCE(a.ambulance_type, '') AS ambulance_type,
                        COALESCE(a.vehicle_number, '') AS vehicle_number,
                        COALESCE(a.base_chrge, '') AS base_chrge,
                        COALESCE(a.min_chrge, '') AS min_chrge,
                        COALESCE(a.area, '') AS area,
                        COALESCE(a.eta, '') AS eta
                 FROM ambulance_drivers d
                 LEFT JOIN ambulances a ON a.assigned_driver_id = d.id OR d.assigned_ambulance_id = a.id
                 WHERE d.id = ? AND d.users_id = ?`, 
                [req.params.id, req.session.user.id]
            );
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
                `INSERT INTO ambulance_drivers 
                (users_id, driver_name, driver_id_str, mobile_number, status, address, driving_license_number, license_expiry_date, driver_photo, driving_license_doc, assigned_ambulance_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.session.user.id, body.driver_name, body.driver_id_str, body.mobile_number, body.status, body.address, body.driving_license_number, body.license_expiry_date || null, photo, doc, ambId]
            );
            
            let assignedAmbulance = null;
            if (ambId) {
                // Clear any previous driver assigned to this ambulance
                await pool.query('UPDATE ambulance_drivers SET assigned_ambulance_id = NULL WHERE assigned_ambulance_id = ? AND users_id = ? AND id != ?', [ambId, req.session.user.id, insRes.insertId]);
                await pool.query('UPDATE ambulances SET assigned_driver_id = ? WHERE id = ? AND users_id = ?', [insRes.insertId, ambId, req.session.user.id]);
                
                const [ambRows] = await pool.query('SELECT ambulance_type, vehicle_number, base_chrge, min_chrge, area, eta FROM ambulances WHERE id = ?', [ambId]);
                if (ambRows.length > 0) assignedAmbulance = ambRows[0];
            }
            res.json({
                success: true,
                driver: {
                    id: insRes.insertId,
                    driver_name: body.driver_name,
                    driver_id_str: body.driver_id_str,
                    mobile_number: body.mobile_number,
                    status: body.status,
                    assigned_ambulance_id: ambId,
                    ambulance: assignedAmbulance
                }
            });
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
                `UPDATE ambulance_drivers SET 
                driver_name = ?, driver_id_str = ?, mobile_number = ?, status = ?, address = ?, driving_license_number = ?, 
                license_expiry_date = ?, driver_photo = COALESCE(?, driver_photo), driving_license_doc = COALESCE(?, driving_license_doc),
                assigned_ambulance_id = ?
                WHERE id = ? AND users_id = ?`,
                [body.driver_name, body.driver_id_str, body.mobile_number, body.status, body.address, body.driving_license_number, body.license_expiry_date || null, photo, doc, ambId, req.params.id, req.session.user.id]
            );
            
            // Sync ambulance assignment
            await pool.query('UPDATE ambulances SET assigned_driver_id = NULL WHERE assigned_driver_id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
            let assignedAmbulance = null;
            if (ambId) {
                await pool.query('UPDATE ambulance_drivers SET assigned_ambulance_id = NULL WHERE assigned_ambulance_id = ? AND users_id = ? AND id != ?', [ambId, req.session.user.id, req.params.id]);
                await pool.query('UPDATE ambulances SET assigned_driver_id = ? WHERE id = ? AND users_id = ?', [req.params.id, ambId, req.session.user.id]);
                const [ambRows] = await pool.query('SELECT ambulance_type, vehicle_number, base_chrge, min_chrge, area, eta FROM ambulances WHERE id = ?', [ambId]);
                if (ambRows.length > 0) assignedAmbulance = ambRows[0];
            }
            
            res.json({
                success: true,
                driver: {
                    id: req.params.id,
                    driver_name: body.driver_name,
                    driver_id_str: body.driver_id_str,
                    mobile_number: body.mobile_number,
                    status: body.status,
                    assigned_ambulance_id: ambId,
                    ambulance: assignedAmbulance
                }
            });
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
    // ================= END DRIVER CRUD =================
    // ================= END DRIVER CRUD =================

};
