const fs = require('fs');

// hsp.html
let hsp = fs.readFileSync('hsp.html', 'utf8');
hsp = hsp.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Hospital Registration<\/label>\s*<input type="file" id="hospital_reg_certificate"[^>]*>\s*<\/div>/g, '');
hsp = hsp.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Shop License<\/label>\s*<input type="file" id="shop_license"[^>]*>\s*<\/div>/g, '');
hsp = hsp.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Medical Council Registration<\/label>\s*<input type="file" id="medical_council_registration"[^>]*>\s*<\/div>/g, '');
hsp = hsp.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Electricity Bill<\/label>\s*<input type="file" id="electricity_bill"[^>]*>\s*<\/div>/g, '');
fs.writeFileSync('hsp.html', hsp);
console.log('Cleaned hsp.html');

// amb.html
let amb = fs.readFileSync('amb.html', 'utf8');
amb = amb.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>License<\/label>\s*<input type="file" id="lic"[^>]*>\s*<\/div>/g, '');
amb = amb.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>RC<\/label>\s*<input type="file" id="rc"[^>]*>\s*<\/div>/g, '');
amb = amb.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Driver Experience<\/label>\s*<input type="text" id="driver_exp"[^>]*>\s*<\/div>/g, '');
amb = amb.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Vehicle Insurance<\/label>\s*<input type="file" id="veh_ins"[^>]*>\s*<\/div>/g, '');
fs.writeFileSync('amb.html', amb);
console.log('Cleaned amb.html');

// lt.html
let lt = fs.readFileSync('lt.html', 'utf8');
lt = lt.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Lab Registration<\/label>\s*<input type="file" id="lab_reg"[^>]*>\s*<\/div>/g, '');
lt = lt.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>NABL<\/label>\s*<input type="file" id="nabl"[^>]*>\s*<\/div>/g, '');
lt = lt.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Pathology Qualification Certificate<\/label>\s*<input type="file" id="path_qual_cer"[^>]*>\s*<\/div>/g, '');
lt = lt.replace(/<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label[^>]*>Pathologist<\/label>\s*<input type="text" id="pathologist"[^>]*>\s*<\/div>/g, '');
fs.writeFileSync('lt.html', lt);
console.log('Cleaned lt.html');
