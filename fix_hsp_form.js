const fs = require('fs');

// 1. Add fields to hospitalForm in hsp.html
let hspHtml = fs.readFileSync('hsp.html', 'utf8');

const typeAndOwnershipHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Type</label>
                    <select id="add_hospital_type" class="top-search" style="border-radius: var(--rounded-sm);" required>
                        <option value="">Select Hospital Type...</option>
                        <option value="General Hospital">General Hospital</option>
                        <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
                        <option value="Super-Specialty Hospital">Super-Specialty Hospital</option>
                        <option value="Specialty Hospital">Specialty Hospital</option>
                        <option value="Teaching Hospital">Teaching Hospital</option>
                        <option value="Psychiatric Hospital">Psychiatric Hospital</option>
                        <option value="Maternity Hospital">Maternity Hospital</option>
                        <option value="Children's Hospital">Children's Hospital</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Ownership</label>
                    <select id="add_hospital_ownership" class="top-search" style="border-radius: var(--rounded-sm);" required>
                        <option value="">Select Ownership...</option>
                        <option value="Government">Government</option>
                        <option value="Private">Private</option>
                        <option value="Trust / NGO">Trust / NGO</option>
                        <option value="Public-Private Partnership (PPP)">Public-Private Partnership (PPP)</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
`;

hspHtml = hspHtml.replace(
    '<div style="display: flex; flex-direction: column; gap: 8px;">\n                    <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address</label>',
    typeAndOwnershipHTML + '\n                <div style="display: flex; flex-direction: column; gap: 8px;">\n                    <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address</label>'
);
fs.writeFileSync('hsp.html', hspHtml, 'utf8');

// 2. Append to FormData in hsp.js
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

const jsAppends = `
        formData.append("hospital_type", document.getElementById("add_hospital_type") ? document.getElementById("add_hospital_type").value : "");
        formData.append("hospital_ownership", document.getElementById("add_hospital_ownership") ? document.getElementById("add_hospital_ownership").value : "");
`;
hspJs = hspJs.replace(
    'formData.append(\n            "hospital_name",\n            document.getElementById(\n                "hospital_name"\n            ).value\n        );',
    'formData.append(\n            "hospital_name",\n            document.getElementById(\n                "hospital_name"\n            ).value\n        );\n' + jsAppends
);

// 3. Update Table in hsp.js
hspJs = hspJs.replace('<th>ID</th>', '<th>ID</th>\n                              <th>Type</th>\n                              <th>Ownership</th>');
hspJs = hspJs.replace('<td>\n                        ${hospital.id}\n                    </td>', '<td>\n                        ${hospital.id}\n                    </td>\n                    <td>${hospital.hospital_type || "-"}</td>\n                    <td>${hospital.hospital_ownership || "-"}</td>');

fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Modified hsp.html and js/hsp.js to add type and ownership to Add form and table');
