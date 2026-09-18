const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const optionsHTML = `
                                <option value="">Select Ambulance Type...</option>
                                <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                                <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                                <option value="ICU Ambulance">ICU Ambulance</option>
                                <option value="Patient Transport Ambulance">Patient Transport Ambulance</option>
                                <option value="Neonatal Ambulance">Neonatal Ambulance</option>
                                <option value="Mortuary Ambulance">Mortuary Ambulance</option>
                                <option value="Other">Other</option>
`;

// Replace in Add Ambulance form
const targetRegex1 = /<select id="ambulance_type" class="top-search" style="border-radius: var\(--rounded-sm\);">\s*<option>Basic<\/option>\s*<option>ICU<\/option>\s*<option>Oxygen Supported<\/option>\s*<\/select>/;
ambHtml = ambHtml.replace(targetRegex1, '<select id="ambulance_type" class="top-search" style="border-radius: var(--rounded-sm);" required>' + optionsHTML + '</select>');

// Replace in Complete Profile form
const targetRegex2 = /<input type="text" name="ambulance_type" style="padding:10px 12px; border:1px solid var\(--hk-border, #cbd5e1\); border-radius:10px; background:var\(--hk-surface, #fff\); color:var\(--hk-text-main, #101828\);" required>/;
ambHtml = ambHtml.replace(targetRegex2, '<select name="ambulance_type" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>' + optionsHTML + '</select>');

fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Updated Ambulance Type dropdowns');
