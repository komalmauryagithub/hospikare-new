const fs = require('fs');
let routes = fs.readFileSync('routes_vendor_profile.js', 'utf8');

const oldDetailsRegex = /\/\/ 1\.5 Fetch Entity Details[\s\S]*?const \[rows\] = await pool\.query\(query, \[entityId\]\);/;

const newDetails = `// 1.5 Fetch Entity Details
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
            
            const [rows] = await pool.query(query, [entityId]);`;

routes = routes.replace(oldDetailsRegex, newDetails);
fs.writeFileSync('routes_vendor_profile.js', routes, 'utf8');
console.log('Updated routes_vendor_profile.js entity-details to return all columns');
