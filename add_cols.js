const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const regex = /<td>\s*\$\{ambulance\.ambulance_type\}\s*<\/td>/;
const replacement = '<td>\n                        ${ambulance.ambulance_type}\n                    </td>\n                    <td>\n                        <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 600; font-family: monospace; color: #1e293b;">${ambulance.vehicle_number || "-"}</span>\n                    </td>\n                    <td>\n                        ${ambulance.driver_name ? \'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;"><i class="fa-solid fa-user-tie" style="color: #3b82f6;"></i> \' + ambulance.driver_name + \'</span>\' : \'<span style="color: #ef4444; font-size: 12px; font-weight: 600;">Unassigned</span>\'}\n                    </td>';

ambJs = ambJs.replace(regex, replacement);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Added vehicle_number and driver_name columns to ambulance list table');
