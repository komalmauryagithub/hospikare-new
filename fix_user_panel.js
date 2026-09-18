const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Add hospital_type and hospital_ownership to /api/featured-hospitals query
content = content.replace(
    /hospitals\.hospital_images,\s*hospitals\.rooms/g,
    'hospitals.hospital_images,\n            hospitals.rooms,\n            hospitals.hospital_type,\n            hospitals.hospital_ownership'
);
fs.writeFileSync('server.js', content, 'utf8');

let usersJs = fs.readFileSync('js/users.js', 'utf8');
// Add to featuredHospitalCard UI
usersJs = usersJs.replace(
    '<div class="facilityTags">',
    `<div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                                    \${hospital.hospital_type ? '<span style="background: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_type) + '</span>' : ''}
                                    \${hospital.hospital_ownership ? '<span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_ownership) + '</span>' : ''}
                                </div>
                                <div class="facilityTags">`
);
fs.writeFileSync('js/users.js', usersJs, 'utf8');
console.log('Updated user panel to show hospital type and ownership');
