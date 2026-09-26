const fs = require('fs');
let fileContent = fs.readFileSync('js/mdc.js', 'utf8');

// Replace table headers
fileContent = fileContent.replace(
    /<th>Inventory Status<\/th>\s*<\/tr>\s*<\/thead>/g,
    '<th>Inventory Status</th>\n                            <th>Actions</th>\n                        </tr>\n                    </thead>'
);

// Replace colspans
fileContent = fileContent.replace(/colspan="7"/g, 'colspan="8"');

// Replace row HTML
fileContent = fileContent.replace(
    /<td><span class="status-badge \$\{statusClass\}"><i class="fa-solid \$\{statusIcon\}"><\/i> \$\{status\}<\/span><\/td>\s*<\/tr>\s*`;/g,
    '<td><span class="status-badge ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${status}</span></td>\n                <td class="action-cells" style="white-space: nowrap;">\n                    <button class="action-btn-sm edit-btn" title="Edit Stock" onclick="editMedicine(${medicine.medicine_id || medicine.id})"><i class="fa-solid fa-pen-to-square"></i></button>\n                    <button class="action-btn-sm delete-btn" title="Delete Stock" onclick="deleteMedicine(${medicine.medicine_id || medicine.id})"><i class="fa-solid fa-trash-can"></i></button>\n                </td>\n            </tr>\n            `;'
);

fs.writeFileSync('js/mdc.js', fileContent);
console.log('Successfully updated js/mdc.js');
