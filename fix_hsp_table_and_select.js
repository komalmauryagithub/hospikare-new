const fs = require('fs');
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

// 1. Fix loadHospitals table headers and rows
const oldLoadHspTableRegex = /<table class="adminTable">\s*<thead>\s*<tr>\s*<th>ID<\/th>[\s\S]*?<\/tbody>\s*<\/table>/;

const newLoadHspTable = `<table class="adminTable">
                    <thead>
                        <tr>
                            <th style="width:60px;">ID</th>
                            <th>Hospital Name</th>
                            <th>Type</th>
                            <th>Ownership</th>
                            <th>Address</th>
                            <th>Rooms</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="hospitalsTableBody">
                    </tbody>
                </table>`;

hspJs = hspJs.replace(oldLoadHspTableRegex, newLoadHspTable);

const oldRowRenderRegex = /tbody\.innerHTML \+=\s*`\s*<tr>\s*<td>\${hospital\.id}<\/td>\s*<td><span style="font-weight:600; color:var\(--text-main, #1e293b\);">\${hospital\.hospital_name \|\| ''}<\/span><\/td>\s*<td>\${hospital\.city \|\| '-'}<\/td>\s*<td>\${hospital\.address \|\| '-'}<\/td>\s*<td>\${roomCount} rooms<\/td>\s*<td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#16a34a;">\${hospital\.status \|\| 'Active'}<\/span><\/td>\s*<\/tr>\s*`;/;

const newRowRender = `tbody.innerHTML += \`
            <tr>
                <td>\${hospital.id}</td>
                <td><span style="font-weight:700; color:var(--text-main, #1e293b); font-size:14px;">\${hospital.hospital_name || ''}</span></td>
                <td><span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">\${hospital.hospital_type || 'General Hospital'}</span></td>
                <td><span style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">\${hospital.hospital_ownership || 'Private'}</span></td>
                <td>\${hospital.address || '-'}</td>
                <td>\${roomCount} rooms</td>
                <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#16a34a;">\${hospital.status || 'Active'}</span></td>
            </tr>
            \`;`;

hspJs = hspJs.replace(oldRowRenderRegex, newRowRender);

// 2. Ensure all hospitals are listed in the Complete Profile dropdown (not hidden when profile_completed is true)
const oldSelectFill = `                        data.data.forEach(ent => {
                            if (!ent.profile_completed) {
                                select.innerHTML += '<option value="' + ent.id + '">' + ent.name + '</option>';
                            }
                        });`;

const newSelectFill = `                        data.data.forEach(ent => {
                            select.innerHTML += '<option value="' + ent.id + '">' + ent.name + (ent.profile_completed ? ' (Profile Completed)' : '') + '</option>';
                        });`;

hspJs = hspJs.replace(oldSelectFill, newSelectFill);

fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Fixed hospital table columns and profile dropdown in js/hsp.js');
