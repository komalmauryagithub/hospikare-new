const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const oldUploadDivs = `<div style="display: flex; gap: 16px;">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Profile Photo</label>
                                <input type="file" id="driver_photo_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Document</label>
                                <input type="file" id="driver_dl_doc_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                        </div>`;

const newUploadDivs = `<div style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Profile Photo</label>
                                <input type="file" id="driver_photo_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">DL Document</label>
                                <input type="file" id="driver_dl_doc_upload" style="font-size: 13px; color: var(--text-main);">
                            </div>
                        </div>`;

ambHtml = ambHtml.replace(oldUploadDivs, newUploadDivs);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Fixed driver modal upload fields layout');
