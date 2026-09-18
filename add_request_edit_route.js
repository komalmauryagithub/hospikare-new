const fs = require('fs');
let routes = fs.readFileSync('routes_vendor_profile.js', 'utf8');

// 1. Add request-profile-edit endpoint
const requestEndpoint = `
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
                insurance: 'insurances' 
            };
            const tbl = tableMap[type];
            if (!tbl) return res.json({ success: false, message: 'Invalid entity type' });
            
            await pool.query(\`UPDATE \\\`\${tbl}\\\` SET edit_requested = 1, edit_allowed = 0 WHERE id = ? AND users_id = ?\`, [entityId, userId]);
            res.json({ success: true, message: 'Edit request sent to Admin. Once approved, you can update details.' });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: 'Server error' });
        }
    });

`;

routes = routes.replace('// 2. Complete Profile endpoints', requestEndpoint + '// 2. Complete Profile endpoints');

// 2. Reset edit_allowed & edit_requested upon saving complete-profile
routes = routes.replace(
    'profile_completed = TRUE\n                    WHERE id = ? AND users_id = ?`,',
    'profile_completed = TRUE, edit_allowed = 0, edit_requested = 0\n                    WHERE id = ? AND users_id = ?`,'
);

fs.writeFileSync('routes_vendor_profile.js', routes, 'utf8');
console.log('Updated routes_vendor_profile.js with request-profile-edit endpoint');
