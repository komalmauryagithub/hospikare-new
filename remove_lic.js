const fs = require('fs');
let content = fs.readFileSync('amb.html', 'utf8');

const licDiv = `<div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Driving License</label>
                            <input type="file" id="lic" style="font-size: 13px;">
                        </div>`;

content = content.replace(licDiv, '');
fs.writeFileSync('amb.html', content, 'utf8');

let jsContent = fs.readFileSync('js/amb.js', 'utf8');
jsContent = jsContent.replace(/formData\.append\(\s*"lic",\s*document\.getElementById\(\s*"lic"\s*\)\.files\[0\]\s*\);\s*/g, '');
fs.writeFileSync('js/amb.js', jsContent, 'utf8');
console.log('Removed Driving License from ambulanceForm');
