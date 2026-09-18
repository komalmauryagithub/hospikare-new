const fs = require('fs');

// Add a new route in routes_vendor_profile.js to fetch entity details
let content = fs.readFileSync('routes_vendor_profile.js', 'utf8');

const newRoute = `
    // 1.5 Fetch Entity Details
    app.get('/api/vendor/entity-details/:type/:id', async (req, res) => {
        try {
            if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
            const type = req.params.type;
            const entityId = req.params.id;
            let query = '';
            
            if (type === 'hospital') { query = 'SELECT address, contact_number, facilities, hospital_type, hospital_ownership FROM hospitals WHERE id = ?'; }
            else if (type === 'ambulance') { query = 'SELECT address, contact_number, vehicle_number, service_area, ambulance_type FROM ambulances WHERE id = ?'; }
            else if (type === 'lab') { query = 'SELECT address, contact_number, test, home_coll FROM labs WHERE id = ?'; }
            else if (type === 'pharmacy') { query = 'SELECT address, contact_number, pharmacist_name, home_delivery FROM pharmacies WHERE id = ?'; }
            else if (type === 'equipment_source') { query = 'SELECT address, contact_number, equipment_category, sale_rental FROM equipment_sources WHERE id = ?'; }
            else if (type === 'insurance') { query = 'SELECT offc_add as address, contact_number, insurance_plans, website FROM insurances WHERE id = ?'; }
            
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

    // 2. Complete Profile endpoints
`;

content = content.replace('// 2. Complete Profile endpoints', newRoute);
fs.writeFileSync('routes_vendor_profile.js', content, 'utf8');
console.log('Added entity-details route');
