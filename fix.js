const fs = require('fs');

let content = fs.readFileSync('routes_vendor_profile.js', 'utf8');

content = content.replace(/await pool\.query\(\s*UPDATE hospitals SET/g, 'await pool.query(`UPDATE hospitals SET');
content = content.replace(/WHERE id = \? AND users_id = \?,/g, 'WHERE id = ? AND users_id = ?`,');

content = content.replace(/await pool\.query\(\s*UPDATE ambulances SET/g, 'await pool.query(`UPDATE ambulances SET');
content = content.replace(/await pool\.query\(\s*UPDATE labs SET/g, 'await pool.query(`UPDATE labs SET');
content = content.replace(/await pool\.query\(\s*UPDATE pharmacies SET/g, 'await pool.query(`UPDATE pharmacies SET');
content = content.replace(/await pool\.query\(\s*UPDATE equipment_sources SET/g, 'await pool.query(`UPDATE equipment_sources SET');
content = content.replace(/await pool\.query\(\s*UPDATE insurances SET/g, 'await pool.query(`UPDATE insurances SET');

fs.writeFileSync('routes_vendor_profile.js', content, 'utf8');
