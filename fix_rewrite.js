const fs = require('fs');

const fileContent = `module.exports = function(app, pool, upload) {

    // 1. Fetch Entities
    app.get('/api/vendor/my-entities/:type', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const userId = req.session.user.id;
            const type = req.params.type;
            let query = '';
            if (type === 'hospital') { query = 'SELECT id, hospital_name as name, profile_completed FROM hospitals WHERE users_id = ?'; }
            else if (type === 'ambulance') { query = 'SELECT id, ambulance_service_name as name, profile_completed FROM ambulances WHERE users_id = ?'; }
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

    app.post('/api/vendor/complete-profile/:type/:id', uploadFields, async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const userId = req.session.user.id;
            const type = req.params.type;
            const entityId = req.params.id;
            const body = req.body;
            const files = req.files || {};

            const getFile = (name) => files[name] && files[name][0] ? files[name][0].filename : null;

            if (type === 'hospital') {
                const doc1 = getFile('hospital_reg_certificate');
                const doc2 = getFile('pan_card');
                const doc3 = getFile('gst_certificate');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    \`UPDATE hospitals SET 
                        hospital_registration_number = ?, hospital_type = ?, contact_number = ?, 
                        number_of_beds = ?, address = ?, facilities = ?,
                        hospital_reg_certificate = COALESCE(?, hospital_reg_certificate),
                        pan_card = COALESCE(?, pan_card),
                        gst_certificate = COALESCE(?, gst_certificate),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
                    [body.hospital_registration_number, body.hospital_type, body.contact_number, 
                     body.number_of_beds, body.address, body.facilities,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            } 
            else if (type === 'ambulance') {
                const doc1 = getFile('ambulance_registration_rc');
                const doc2 = getFile('vehicle_fitness_certificate');
                const doc3 = getFile('vehicle_insurance');
                const doc4 = getFile('driver_license');
                const doc5 = getFile('business_registration_proof');
                
                await pool.query(
                    \`UPDATE ambulances SET 
                        registration_number = ?, contact_number = ?, vehicle_number = ?, 
                        service_area = ?, address = ?, ambulance_type = ?,
                        rc = COALESCE(?, rc),
                        vehicle_fitness_certificate = COALESCE(?, vehicle_fitness_certificate),
                        veh_ins = COALESCE(?, veh_ins),
                        lic = COALESCE(?, lic),
                        business_registration_proof = COALESCE(?, business_registration_proof),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
                    [body.registration_number, body.contact_number, body.vehicle_number, 
                     body.service_area, body.address, body.ambulance_type,
                     doc1, doc2, doc3, doc4, doc5, entityId, userId]
                );
            }
            else if (type === 'lab') {
                const doc1 = getFile('hospital_reg_certificate');
                const doc2 = getFile('nabl_certificate');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    \`UPDATE labs SET 
                        lab_registration_number = ?, contact_number = ?, address = ?, 
                        test = ?, home_coll = ?,
                        lab_reg = COALESCE(?, lab_reg),
                        nabl = COALESCE(?, nabl),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
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
                    \`UPDATE pharmacies SET 
                        drug_license_number = ?, contact_number = ?, address = ?, 
                        pharmacist_name = ?, home_delivery = ?,
                        drug_license_doc = COALESCE(?, drug_license_doc),
                        pharmacist_registration_cert = COALESCE(?, pharmacist_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
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
                    \`UPDATE equipment_sources SET 
                        business_registration_number = ?, contact_number = ?, address = ?, 
                        equipment_category = ?, sale_rental = ?,
                        business_registration_cert = COALESCE(?, business_registration_cert),
                        gst_certificate = COALESCE(?, gst_certificate),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        manufacturer_authorization = COALESCE(?, manufacturer_authorization),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
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
                    \`UPDATE insurances SET 
                        irdai = ?, contact_number = ?, offc_add = ?, 
                        insurance_plans = ?, website = ?,
                        irdai_license_doc = COALESCE(?, irdai_license_doc),
                        company_registration_cert = COALESCE(?, company_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE
                    WHERE id = ? AND users_id = ?\`,
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

            await pool.query(\`INSERT INTO ambulance_drivers 
                (ambulance_id, users_id, driver_name, driver_photo, mobile_number, driving_license_number, license_expiry_date, driving_license_doc) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
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
            await pool.query(\`INSERT INTO pharmacies (users_id, pharmacy_name) VALUES (?, ?)\`, [req.session.user.id, req.body.pharmacy_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    // 5. Add Equipment Source Basic
    app.post('/api/vendor/add-equipment-source-basic', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            await pool.query(\`INSERT INTO equipment_sources (users_id, source_type, business_name) VALUES (?, ?, ?)\`, 
                [req.session.user.id, req.body.source_type, req.body.business_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

    // 6. Add Insurance Company Basic
    app.post('/api/vendor/add-insurance-company-basic', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false });
            await pool.query(\`INSERT INTO insurances (users_id, comp_name) VALUES (?, ?)\`, [req.session.user.id, req.body.company_name]);
            res.json({ success: true });
        } catch(e) { res.json({ success: false }); }
    });

};
`

fs.writeFileSync('routes_vendor_profile.js', fileContent, 'utf8');
