const fs = require('fs');
let fileContent = fs.readFileSync('js/mdc.js', 'utf8');

// Add window.medicinesData = result.medicines;
fileContent = fileContent.replace(
    'const result = await response.json();\n\n        tbody.innerHTML = "";',
    'const result = await response.json();\n\n        window.medicinesData = result.medicines;\n        tbody.innerHTML = "";'
);

// Replace action cells HTML
const oldActionHtml = `<td class="action-cells" style="white-space: nowrap;">
                    <button class="action-btn-sm edit-btn" title="Edit Stock" onclick="editMedicine(\${medicine.medicine_id || medicine.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn-sm delete-btn" title="Delete Stock" onclick="deleteMedicine(\${medicine.medicine_id || medicine.id})"><i class="fa-solid fa-trash-can"></i></button>
                </td>`;
const newActionHtml = `<td style="white-space: nowrap;">
                    <i class="fa-solid fa-pen-to-square" onclick="editMedicine(\${medicine.medicine_id || medicine.id})" title="Edit" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    <i class="fa-solid fa-trash" onclick="deleteMedicine(\${medicine.medicine_id || medicine.id})" title="Delete" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-left: 12px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                </td>`;

fileContent = fileContent.replace(oldActionHtml, newActionHtml);

fs.writeFileSync('js/mdc.js', fileContent);
console.log('Successfully fixed stock edit error and CSS in js/mdc.js');
