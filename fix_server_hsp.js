const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Add hospital_type and hospital_ownership to INSERT INTO hospitals
content = content.replace(
    /INSERT INTO hospitals\s*\([\s\S]*?hospital_name,\s*address/g,
    `INSERT INTO hospitals
                (
                    users_id,
                    hospital_images,
                    hospital_name,
                    hospital_type,
                    hospital_ownership,
                    address`
);

content = content.replace(
    /VALUES\s*\(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)/g,
    `VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

content = content.replace(
    /req\.session\.user\.id,\n\s*JSON\.stringify\(hospitalImages\),\n\s*body\.hospital_name,\n\s*body\.address/g,
    `req.session.user.id,
          JSON.stringify(hospitalImages),
          body.hospital_name,
          body.hospital_type || null,
          body.hospital_ownership || null,
          body.address`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Updated server.js to insert hospital_type and hospital_ownership on creation');
