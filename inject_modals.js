const fs = require('fs');

function injectButtonAndModal(file, targetBtnId, btnHtml, modalHtml) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Inject button next to target button
        const regexBtn = new RegExp(`(<button id="${targetBtnId}"[^>]*>[^<]*</button>)`);
        content = content.replace(regexBtn, `$1\n${btnHtml}`);
        
        // Inject modal before closing body
        content = content.replace(/<\/body>/, `${modalHtml}\n</body>`);
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Injected into ${file}`);
    } catch(e) {
        console.log(`Error in ${file}: ${e.message}`);
    }
}

// 1. amb.html (Add Driver)
injectButtonAndModal('amb.html', 'addAmbulanceBtn', 
    `<button id="addDriverBtn" class="add-btn" style="margin-left:10px; background:var(--hk-primary-blue);"><i class="fa-solid fa-user-plus"></i> Add Driver</button>`,
    `<div id="driverModalBox" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
        <div style="background:var(--hk-surface, white); padding:24px; border-radius:12px; width:400px; max-width:90%; color:var(--hk-text-main, black);">
            <h3 style="margin-top:0;">Add Driver</h3>
            <form id="driverForm" onsubmit="event.preventDefault(); fetch('/api/vendor/add-driver', {method:'POST', body:new FormData(this)}).then(()=>location.reload())">
                <input type="text" name="ambulance_id" placeholder="Ambulance ID (Temporary)" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <input type="text" name="driver_name" placeholder="Driver Name" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <input type="text" name="mobile_number" placeholder="Mobile Number" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <input type="text" name="driving_license_number" placeholder="DL Number" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <input type="date" name="license_expiry_date" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <label>Driver Photo</label><input type="file" name="driver_photo" style="width:100%; margin-bottom:10px; padding:8px;">
                <label>DL Document</label><input type="file" name="driving_license_doc" style="width:100%; margin-bottom:10px; padding:8px;">
                <button type="submit" style="padding:10px; width:100%; background:#2563eb; color:white; border:none; border-radius:8px;">Save Driver</button>
                <button type="button" onclick="document.getElementById('driverModalBox').style.display='none'" style="padding:10px; width:100%; margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>
    <script>document.getElementById('addDriverBtn')?.addEventListener('click', () => document.getElementById('driverModalBox').style.display='flex');</script>`
);

// 2. mdc.html (Add Pharmacy Basic)
injectButtonAndModal('mdc.html', 'addMedicineBtn', 
    `<button id="addPharmacyBtn" class="add-btn" style="margin-left:10px; background:var(--hk-primary-blue);"><i class="fa-solid fa-store"></i> Add Pharmacy</button>`,
    `<div id="pharmacyModalBox" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
        <div style="background:var(--hk-surface, white); padding:24px; border-radius:12px; width:400px; max-width:90%; color:var(--hk-text-main, black);">
            <h3 style="margin-top:0;">Add Pharmacy</h3>
            <form id="pharmacyForm" onsubmit="event.preventDefault(); fetch('/api/vendor/add-pharmacy-basic', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({pharmacy_name:this.pharmacy_name.value})}).then(()=>location.reload())">
                <input type="text" name="pharmacy_name" placeholder="Pharmacy Name" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <button type="submit" style="padding:10px; width:100%; background:#2563eb; color:white; border:none; border-radius:8px;">Add</button>
                <button type="button" onclick="document.getElementById('pharmacyModalBox').style.display='none'" style="padding:10px; width:100%; margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>
    <script>document.getElementById('addPharmacyBtn')?.addEventListener('click', () => document.getElementById('pharmacyModalBox').style.display='flex');</script>`
);

// 3. mdeq.html (Add Equipment Source Basic)
injectButtonAndModal('mdeq.html', 'addEquipmentBtn', 
    `<button id="addSourceBtn" class="add-btn" style="margin-left:10px; background:var(--hk-primary-blue);"><i class="fa-solid fa-industry"></i> Add Source</button>`,
    `<div id="sourceModalBox" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
        <div style="background:var(--hk-surface, white); padding:24px; border-radius:12px; width:400px; max-width:90%; color:var(--hk-text-main, black);">
            <h3 style="margin-top:0;">Add Equipment Source</h3>
            <form id="sourceForm" onsubmit="event.preventDefault(); fetch('/api/vendor/add-equipment-source-basic', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({business_name:this.business_name.value, source_type:this.source_type.value})}).then(()=>location.reload())">
                <input type="text" name="business_name" placeholder="Business Name" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <select name="source_type" style="width:100%; margin-bottom:10px; padding:8px;" required>
                    <option value="">Select Type</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Hospital">Hospital/Clinic</option>
                    <option value="Government">Government Agency</option>
                    <option value="Dealer">Dealer</option>
                </select>
                <button type="submit" style="padding:10px; width:100%; background:#2563eb; color:white; border:none; border-radius:8px;">Add</button>
                <button type="button" onclick="document.getElementById('sourceModalBox').style.display='none'" style="padding:10px; width:100%; margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>
    <script>document.getElementById('addSourceBtn')?.addEventListener('click', () => document.getElementById('sourceModalBox').style.display='flex');</script>`
);

// 4. ins.html (Add Insurance Company Basic)
injectButtonAndModal('ins.html', 'addInsuranceBtn', 
    `<button id="addInsCompBtn" class="add-btn" style="margin-left:10px; background:var(--hk-primary-blue);"><i class="fa-solid fa-building-shield"></i> Add Company</button>`,
    `<div id="insCompModalBox" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
        <div style="background:var(--hk-surface, white); padding:24px; border-radius:12px; width:400px; max-width:90%; color:var(--hk-text-main, black);">
            <h3 style="margin-top:0;">Add Insurance Company</h3>
            <form id="insCompForm" onsubmit="event.preventDefault(); fetch('/api/vendor/add-insurance-company-basic', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({company_name:this.company_name.value})}).then(()=>location.reload())">
                <input type="text" name="company_name" placeholder="Company Name" style="width:100%; margin-bottom:10px; padding:8px;" required>
                <button type="submit" style="padding:10px; width:100%; background:#2563eb; color:white; border:none; border-radius:8px;">Add</button>
                <button type="button" onclick="document.getElementById('insCompModalBox').style.display='none'" style="padding:10px; width:100%; margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>
    <script>document.getElementById('addInsCompBtn')?.addEventListener('click', () => document.getElementById('insCompModalBox').style.display='flex');</script>`
);
