const fs = require('fs');
let content = fs.readFileSync('amb.html', 'utf8');

// Remove the old simple driverModalBox
const regex = /<div id="driverModalBox"[\s\S]*?<\/div>\s*<\/div>/g;
content = content.replace(regex, '');

// Remove the old script that triggers it
content = content.replace(/<script>document\.getElementById\('addDriverBtn'\)\?\.addEventListener[^<]*<\/script>/g, '');

const newDriverModal = `
    <!-- DRIVER MODAL -->
    <div id="driverModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;" id="driverModalTitle">Add New Driver</h3>
                <button type="button" class="close-modal" id="closeDriverModal" style="background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-muted);">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div style="padding: 24px; overflow-y: auto;">
                <form id="driverCrudForm">
                    <input type="hidden" id="driver_id">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Driver Name *</label>
                                <input type="text" id="driver_name" required class="top-search" style="border-radius: var(--rounded-sm);">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Driver ID / Emp ID</label>
                                <input type="text" id="driver_id_str" class="top-search" style="border-radius: var(--rounded-sm);">
                            </div>
                        </div>

                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Mobile Number *</label>
                                <input type="text" id="driver_mobile" required class="top-search" style="border-radius: var(--rounded-sm);">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Status</label>
                                <select id="driver_status" class="top-search" style="border-radius: var(--rounded-sm);">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address</label>
                            <input type="text" id="driver_address" class="top-search" style="border-radius: var(--rounded-sm);">
                        </div>
                        
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Number</label>
                                <input type="text" id="driver_dl_number" class="top-search" style="border-radius: var(--rounded-sm);">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Expiry</label>
                                <input type="date" id="driver_dl_expiry" class="top-search" style="border-radius: var(--rounded-sm);">
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Profile Photo</label>
                                <input type="file" id="driver_photo_upload" style="font-size: 13px;">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Document</label>
                                <input type="file" id="driver_dl_doc_upload" style="font-size: 13px;">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
                            <button type="button" class="btn-base" id="cancelDriverBtn" style="border: 1px solid var(--border-light); background: white; color: var(--text-dark); padding: 8px 16px; border-radius: 8px;">Cancel</button>
                            <button type="submit" class="btn-base" style="background: var(--primary); color: white; padding: 8px 16px; border-radius: 8px;">Save Driver</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
`;

content = content.replace('<!-- DRIVER MODAL -->', ''); // Just in case
content = content.replace('</body>', newDriverModal + '\n</body>');

// Inject "Assigned Driver" dropdown into the Add Ambulance modal
const driverDropdownHTML = `
                        <div style="display: flex; flex-direction: column; gap: 8px; grid-column: span 2;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Assigned Driver</label>
                            <select id="assigned_driver_id" class="top-search" style="border-radius: var(--rounded-sm);">
                                <option value="">No Driver Assigned</option>
                            </select>
                        </div>
`;

// Find where to insert it in ambulanceForm
content = content.replace('<div style="display: flex; flex-direction: column; gap: 8px;">\n                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Status</label>', driverDropdownHTML + '\n                        <div style="display: flex; flex-direction: column; gap: 8px;">\n                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Status</label>');

fs.writeFileSync('amb.html', content, 'utf8');
console.log('Updated driver modal in amb.html');
