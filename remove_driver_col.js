const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// Remove the driver_name column from the ambulance table row
const driverCol = "                    <td>\n                        ${ambulance.driver_name ? '<span style=\"display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;\"><i class=\"fa-solid fa-user-tie\" style=\"color: #3b82f6;\"></i> ' + ambulance.driver_name + '</span>' : '<span style=\"color: #ef4444; font-size: 12px; font-weight: 600;\">Unassigned</span>'}\n                    </td>";

ambJs = ambJs.replace(driverCol, '');

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Removed driver column from ambulance table');
