const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// Update driver table row to show assigned ambulance
const oldDriverRow = '<td><span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${driver.status || \'Active\'}</span></td>';

const newDriverRow = '<td><span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${driver.status || \'Active\'}</span></td>\n                        <td>${driver.ambulance_type ? \'<span style="font-size: 13px; font-weight: 500;">\' + driver.ambulance_type + \' <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px;">\' + (driver.vehicle_number || \'-\') + \'</span></span>\' : \'<span style="color: #ef4444; font-size: 12px; font-weight: 600;">Not Assigned</span>\'}</td>';

ambJs = ambJs.replace(oldDriverRow, newDriverRow);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated driver table to show assigned ambulance');
