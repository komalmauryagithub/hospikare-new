import re

with open('server.js', 'r', encoding='utf-8') as f:
    js = f.read()

new_routes = """
// --- INSURANCE COMPANIES ROUTES ---
app.get('/api/vendor/insurance-companies', async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const [rows] = await pool.query('SELECT * FROM insurance_companies WHERE users_id = ?', [req.session.user.id]);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error' });
    }
});

app.post('/api/vendor/add-insurance-company', upload.fields([
    { name: 'company_registration_cert', maxCount: 1 },
    { name: 'irdai_registration', maxCount: 1 },
    { name: 'authorization_doc', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const b = req.body;
        const cert1 = req.files && req.files.company_registration_cert ? req.files.company_registration_cert[0].filename : null;
        const cert2 = req.files && req.files.irdai_registration ? req.files.irdai_registration[0].filename : null;
        const cert3 = req.files && req.files.authorization_doc ? req.files.authorization_doc[0].filename : null;

        await pool.query(`INSERT INTO insurance_companies (
            users_id, company_name, company_type, contact_person, mobile_number, email, website,
            full_address, city, state, pincode, insurance_tpa_name, policy_types, cashless_available,
            claim_support, network_hospitals, status, verification_status,
            company_registration_cert, irdai_registration, authorization_doc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            req.session.user.id, b.company_name, b.company_type, b.contact_person, b.mobile_number, b.email, b.website,
            b.full_address, b.city, b.state, b.pincode, b.insurance_tpa_name, b.policy_types, b.cashless_available,
            b.claim_support, b.network_hospitals, b.status || 'Active', b.verification_status || 'Pending',
            cert1, cert2, cert3
        ]);
        res.json({ success: true, message: 'Insurance Company added successfully!' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error' });
    }
});

app.put('/api/vendor/edit-insurance-company/:id', upload.fields([
    { name: 'company_registration_cert', maxCount: 1 },
    { name: 'irdai_registration', maxCount: 1 },
    { name: 'authorization_doc', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const b = req.body;
        const cert1 = req.files && req.files.company_registration_cert ? req.files.company_registration_cert[0].filename : null;
        const cert2 = req.files && req.files.irdai_registration ? req.files.irdai_registration[0].filename : null;
        const cert3 = req.files && req.files.authorization_doc ? req.files.authorization_doc[0].filename : null;

        await pool.query(`UPDATE insurance_companies SET 
            company_name = ?, company_type = ?, contact_person = ?, mobile_number = ?, email = ?, website = ?,
            full_address = ?, city = ?, state = ?, pincode = ?, insurance_tpa_name = ?, policy_types = ?, 
            cashless_available = ?, claim_support = ?, network_hospitals = ?, status = ?, verification_status = ?,
            company_registration_cert = COALESCE(?, company_registration_cert),
            irdai_registration = COALESCE(?, irdai_registration),
            authorization_doc = COALESCE(?, authorization_doc)
            WHERE id = ? AND users_id = ?`, [
            b.company_name, b.company_type, b.contact_person, b.mobile_number, b.email, b.website,
            b.full_address, b.city, b.state, b.pincode, b.insurance_tpa_name, b.policy_types, 
            b.cashless_available, b.claim_support, b.network_hospitals, b.status, b.verification_status,
            cert1, cert2, cert3, req.params.id, req.session.user.id
        ]);
        res.json({ success: true, message: 'Insurance Company updated successfully!' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/vendor/delete-insurance-company/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false });
        await pool.query('DELETE FROM insurance_companies WHERE id = ? AND users_id = ?', [req.params.id, req.session.user.id]);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error' });
    }
});
// --- END INSURANCE COMPANIES ROUTES ---

"""

# Insert right before the last closing brace / listen call, or somewhere safe
# Let's insert it before `app.listen`
js = re.sub(r'(app\.listen\()', new_routes + r'\1', js)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("server.js updated with insurance company routes.")
