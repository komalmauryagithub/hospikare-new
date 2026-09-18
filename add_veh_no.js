const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const targetRegex = /<select id="ambulance_type" class="top-search" style="border-radius: var\(--rounded-sm\);">\s*<option>Basic<\/option>\s*<option>ICU<\/option>\s*<option>Oxygen Supported<\/option>\s*<\/select>\s*<\/div>/;

const newHTML = `
                            <select id="ambulance_type" class="top-search" style="border-radius: var(--rounded-sm);">
                                <option>Basic</option>
                                <option>ICU</option>
                                <option>Oxygen Supported</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Vehicle Registration No.</label>
                            <input type="text" id="vehicle_number" class="top-search" style="border-radius: var(--rounded-sm);" placeholder="e.g. MH 01 AB 1234">
                        </div>`;

ambHtml = ambHtml.replace(targetRegex, newHTML);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Added vehicle_number to ambulanceForm');
