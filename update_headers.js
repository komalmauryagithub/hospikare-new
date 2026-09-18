const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

// 1. Rename Drivers section title
ambHtml = ambHtml.replace(
    '<h2 style="font-size: 20px; font-weight: 700; color: var(--text-dark);">Drivers</h2>',
    '<h2 style="font-size: 20px; font-weight: 700; color: var(--text-dark);">Manage Drivers</h2>'
);

// 2. Add "Assigned Ambulance" header to drivers table
ambHtml = ambHtml.replace(
    '<th>Status</th>\n                                  <th>Action</th>\n                              </tr>\n                          </thead>\n                          <tbody id="driversTableBody">',
    '<th>Status</th>\n                                  <th>Assigned Ambulance</th>\n                                  <th>Action</th>\n                              </tr>\n                          </thead>\n                          <tbody id="driversTableBody">'
);

// 3. Remove "Assigned Driver" header from ambulance table
ambHtml = ambHtml.replace(
    '<th>Assigned Driver</th>\n                              <th>Base Charge</th>',
    '<th>Base Charge</th>'
);

// 4. Rename "Emergency Ambulances Fleet" to "Manage Ambulances"
ambHtml = ambHtml.replace(
    'Emergency Ambulances Fleet',
    'Manage Ambulances'
);
ambHtml = ambHtml.replace(
    'Manage your active ambulance fleet vehicles, emergency tiers, and regional base locations',
    'Manage your ambulance fleet - add, edit and track all vehicles'
);

fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Updated section names and table headers');
