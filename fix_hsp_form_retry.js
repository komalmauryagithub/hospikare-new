const fs = require('fs');
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

// Find where <input type="text" id="hospital_address" is
const targetRegex = /<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label style="font-size: 13px; font-weight: 600; color: var\(--text-muted\);">Address<\/label>/;
hspHtml = hspHtml.replace(targetRegex, match => typeAndOwnershipHTML + '\n' + match);
fs.writeFileSync('hsp.html', hspHtml, 'utf8');
console.log('Fixed hsp.html again using regex');
