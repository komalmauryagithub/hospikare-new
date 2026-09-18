const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

// 1. Rename sidebar links
ambHtml = ambHtml.replace('<i class="fa-solid fa-truck-medical"></i> Ambulances', '<i class="fa-solid fa-truck-medical"></i> Manage Ambulances');
ambHtml = ambHtml.replace('<i class="fa-solid fa-id-card"></i> Drivers', '<i class="fa-solid fa-id-card"></i> Manage Drivers');

// 2. Remove assigned_driver_id from ambulanceForm
const driverSelectRegex = /<div style="display: flex; flex-direction: column; gap: 8px;">\s*<label style="font-size: 13px; font-weight: 600; color: var\(--text-muted\);">Assigned Driver<\/label>\s*<select id="assigned_driver_id" class="top-search" style="border-radius: var\(--rounded-sm\);">\s*<option value="">No Driver Assigned<\/option>\s*<\/select>\s*<\/div>/;
ambHtml = ambHtml.replace(driverSelectRegex, '');

// 3. Add assigned_ambulance_id to driverCrudForm
const driverStatusRegex = /<div style="display: flex; gap: 16px;">\s*<div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">\s*<label style="font-size: 13px; font-weight: 600; color: var\(--text-muted\);">DL Number<\/label>/;

const newDriverFields = `<div style="display: flex; flex-direction: column; gap: 8px;">
                              <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Assign Ambulance (Type & Reg No.)</label>
                              <select id="assigned_ambulance_id" class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                                  <option value="">No Ambulance Assigned</option>
                              </select>
                          </div>
                          
                          <div style="display: flex; gap: 16px;">
                              <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                  <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Number</label>`;

ambHtml = ambHtml.replace(driverStatusRegex, newDriverFields);

fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Modified UI for Manage Drivers and Ambulances');
