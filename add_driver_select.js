const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const regex = /<input type="text" id="vehicle_number" class="top-search" style="border-radius: var\(--rounded-sm\);" placeholder="e\.g\. MH 01 AB 1234">\s*<\/div>/;

const replacement = `<input type="text" id="vehicle_number" class="top-search" style="border-radius: var(--rounded-sm);" placeholder="e.g. MH 01 AB 1234">
                          </div>
                          
                          <div style="display: flex; flex-direction: column; gap: 8px;">
                              <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Assigned Driver</label>
                              <select id="assigned_driver_id" class="top-search" style="border-radius: var(--rounded-sm);">
                                  <option value="">No Driver Assigned</option>
                              </select>
                          </div>`;

ambHtml = ambHtml.replace(regex, replacement);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Added assigned_driver_id to ambulanceForm');
