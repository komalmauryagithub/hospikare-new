const fs = require('fs');

// 1. Update amb.html driver table headers
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const oldThead = /<table class="data-table">\s*<thead>\s*<tr>\s*<th>Photo<\/th>\s*<th>Name & ID<\/th>\s*<th>Contact<\/th>\s*<th>Status<\/th>\s*<th>Action<\/th>\s*<\/tr>\s*<\/thead>/;

const newThead = `<table class="adminTable">
                        <thead>
                            <tr>
                                <th style="width: 60px;">Photo</th>
                                <th>Name & ID</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Assigned Ambulance</th>
                                <th style="text-align: center; width: 100px;">Action</th>
                            </tr>
                        </thead>`;

ambHtml = ambHtml.replace(oldThead, newThead);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Fixed driver table headers in amb.html');

// 2. Update amb.js driver row rendering
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const oldRowRegex = /html \+=\s*`\s*<tr>\s*<td><img src="\${photoSrc}"[\s\S]*?<\/tr>\s*`;/;

const newRow = `const assignedHtml = driver.ambulance_type 
                    ? '<div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;"><span style="font-size: 13px; font-weight: 600; color: var(--text-dark);">' + driver.ambulance_type + '</span> <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.35); padding: 2px 7px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700;">' + (driver.vehicle_number || '-') + '</span></div>'
                    : '<span style="color: #ef4444; font-size: 12px; font-weight: 600; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 4px;">Unassigned</span>';

                html += \`
                    <tr>
                        <td style="text-align: center;"><img src="\${photoSrc}" alt="Driver" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"></td>
                        <td>
                            <div style="font-weight: 700; color: var(--text-dark); font-size: 14px;">\${driver.driver_name}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">ID: \${driver.driver_id_str || 'N/A'}</div>
                        </td>
                        <td style="font-weight: 500; font-size: 13px; color: var(--text-dark);">\${driver.mobile_number}</td>
                        <td><span style="background: \${statusColor}20; color: \${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid \${statusColor}40;">\${driver.status || 'Active'}</span></td>
                        <td>\${assignedHtml}</td>
                        <td style="text-align: center;">
                            <div style="display: inline-flex; align-items: center; gap: 12px;">
                                <i class="fa-solid fa-pen-to-square edit-driver-btn" data-id="\${driver.id}" title="Edit Driver" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></i>
                                <i class="fa-solid fa-trash delete-driver-btn" data-id="\${driver.id}" title="Delete Driver" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></i>
                            </div>
                        </td>
                    </tr>
                \`;`;

ambJs = ambJs.replace(oldRowRegex, newRow);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed driver table row styling in amb.js');
