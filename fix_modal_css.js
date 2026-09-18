const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

// Replace the old driverModal with a new one that matches ambulanceModal exactly
const newDriverModal = `
    <!-- DRIVER MODAL -->
    <div id="driverModal" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 24px; backdrop-filter: blur(4px);">
        <div style="background: var(--card-bg); border-radius: var(--rounded-lg); width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
            <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; font-family: var(--font-heading); color: var(--text-main);" id="driverModalTitle">Add New Driver</h3>
                <button type="button" class="close-modal" id="closeDriverModal" style="background: transparent; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer;">
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
                                <input type="text" id="driver_name" required class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Driver ID / Emp ID</label>
                                <input type="text" id="driver_id_str" class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                            </div>
                        </div>

                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Mobile Number *</label>
                                <input type="text" id="driver_mobile" required class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Status</label>
                                <select id="driver_status" class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address</label>
                            <input type="text" id="driver_address" class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                        </div>
                        
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Number</label>
                                <input type="text" id="driver_dl_number" class="top-search" style="border-radius: var(--rounded-sm); width: 100%;">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Expiry</label>
                                <input type="date" id="driver_dl_expiry" class="top-search" style="border-radius: var(--rounded-sm); width: 100%; color: var(--text-main);">
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Profile Photo</label>
                                <input type="file" id="driver_photo_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Document</label>
                                <input type="file" id="driver_dl_doc_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
                            <button type="button" class="btn-base" id="cancelDriverBtn" style="border: 1px solid var(--border-color); background: transparent; color: var(--text-main); padding: 8px 16px; border-radius: 8px;">Cancel</button>
                            <button type="submit" class="btn-base" style="background: var(--primary); color: white; padding: 8px 16px; border-radius: 8px; border: none;">Save Driver</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
`;

// Replace the old driverModal
ambHtml = ambHtml.replace(/<!-- DRIVER MODAL -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*<\/div>/, newDriverModal);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Fixed CSS for driver modal');
