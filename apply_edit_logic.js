const fs = require('fs');

// UPDATE MDC.HTML
let mdcHtml = fs.readFileSync('mdc.html', 'utf8');

// Pharmacy Form Logic
mdcHtml = mdcHtml.replace(/const response = await fetch\('\/api\/vendor\/add-pharmacy', \{/g, 
`
            const editId = document.getElementById('edit_pharmacy_id').value;
            const url = editId ? '/api/update/vendor/pharmacy/' + editId : '/api/vendor/add-pharmacy';
            const method = editId ? 'PUT' : 'POST';
            
            // Convert FormData to JSON since backend PUT expects JSON, or we can just send JSON.
            // Wait, add-pharmacy might use FormData for files. Let's send FormData for both if PUT supports it.
            // But PUT endpoint uses req.body. Let's send JSON for PUT.
            let requestOptions = {};
            if (editId) {
                const jsonBody = {};
                formData.forEach((value, key) => { jsonBody[key] = value; });
                requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonBody)
                };
            } else {
                requestOptions = {
                    method: 'POST',
                    body: formData
                };
            }
            
            const response = await fetch(url, requestOptions);
`);

// Pharmacist Form Logic
mdcHtml = mdcHtml.replace(/const response = await fetch\('\/api\/vendor\/add-pharmacist', \{/g, 
`
            const editId = document.getElementById('edit_pharmacist_id').value;
            const url = editId ? '/api/update/vendor/pharmacist/' + editId : '/api/vendor/add-pharmacist';
            
            let requestOptions = {};
            if (editId) {
                const jsonBody = {};
                formData.forEach((value, key) => { jsonBody[key] = value; });
                requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonBody)
                };
            } else {
                requestOptions = {
                    method: 'POST',
                    body: formData
                };
            }
            
            const response = await fetch(url, requestOptions);
`);
mdcHtml = mdcHtml.replace(/method: 'POST',\s*body: formData\s*}\);/g, '');


// Make Add buttons clear the hidden edit ids
mdcHtml = mdcHtml.replace(/onclick="document.getElementById\('addPharmacyModalBox'\).style.display='flex'"/g, `onclick="document.getElementById('addPharmacyModalBox').style.display='flex'; document.getElementById('addPharmacyForm').reset(); document.getElementById('edit_pharmacy_id').value=''; document.getElementById('pharmacyModalTitle').innerText='Add Pharmacy';"`);
mdcHtml = mdcHtml.replace(/onclick="document.getElementById\('addPharmacistModalBox'\).style.display='flex'"/g, `onclick="document.getElementById('addPharmacistModalBox').style.display='flex'; document.getElementById('addPharmacistForm').reset(); document.getElementById('edit_pharmacist_id').value=''; document.getElementById('pharmacistModalTitle').innerText='Add Pharmacist';"`);


fs.writeFileSync('mdc.html', mdcHtml);


// UPDATE JS/MDC.JS
let mdcJs = fs.readFileSync('js/mdc.js', 'utf8');

// Cache data in window
mdcJs = mdcJs.replace(/const medicines = filterMedicineRecords/g, `window.medicinesData = result.medicines;\n        const medicines = filterMedicineRecords`);
mdcJs = mdcJs.replace(/const pharmacies = result.pharmacies/g, `window.pharmaciesData = result.pharmacies;\n        const pharmacies = result.pharmacies`);
mdcJs = mdcJs.replace(/const pharmacists = result.pharmacists/g, `window.pharmacistsData = result.pharmacists;\n        const pharmacists = result.pharmacists`);

// Medicine Add Form Update
let medFormSubmitMatch = `const response=await fetch('/api/add/medicine',{
            method:'POST',
            body:formData
        });`;

let medFormSubmitReplacement = `
        const editId = document.getElementById('edit_medicine_id').value;
        const url = editId ? '/api/update/medicine/' + editId : '/api/add/medicine';
        
        let requestOptions = {};
        if (editId) {
            const jsonBody = {};
            formData.forEach((value, key) => { jsonBody[key] = value; });
            requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonBody)
            };
        } else {
            requestOptions = {
                method: 'POST',
                body: formData
            };
        }
        
        const response = await fetch(url, requestOptions);
`;

mdcJs = mdcJs.replace(medFormSubmitMatch, medFormSubmitReplacement);

// Medicine Add Button Reset
mdcJs = mdcJs.replace(/document.getElementById\("medicineModal"\).style.display="flex";/g, `document.getElementById('medicineForm').reset(); document.getElementById('edit_medicine_id').value = ''; document.getElementById('medicineModalTitle').innerText = 'Add Medicine'; document.getElementById("medicineModal").style.display="flex";`);

// Add Edit Functions
mdcJs += `
window.editMedicine = function(id) {
    const med = window.medicinesData.find(m => m.medicine_id == id || m.id == id);
    if (!med) return;
    
    document.getElementById('medicineForm').reset();
    document.getElementById('edit_medicine_id').value = med.medicine_id || med.id;
    document.getElementById('medicineModalTitle').innerText = 'Edit Medicine';
    
    // Populate fields
    const fields = ['shop_name', 'medicine_name', 'generic_name', 'brand_name', 'medicine_type', 'category', 'manufacturer', 'composition', 'mrp', 'selling_price', 'gst_percentage', 'discount_percentage', 'stock_quantity', 'minimum_stock_alert', 'batch_number', 'manufacturing_date', 'expiry_date', 'prescription_required', 'schedule_type', 'uses_info', 'dosage_instructions', 'side_effects', 'warnings', 'storage_instructions', 'delivery_available', 'delivery_charge', 'barcode_number', 'medicine_status', 'featured_medicine'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && med[field] !== undefined && med[field] !== null) {
            el.value = med[field];
        }
    });
    
    document.getElementById('medicineModal').style.display = 'flex';
};

window.editPharmacy = function(id) {
    const pharm = window.pharmaciesData.find(p => p.id == id);
    if (!pharm) return;
    
    document.getElementById('addPharmacyForm').reset();
    document.getElementById('edit_pharmacy_id').value = pharm.id;
    document.getElementById('pharmacyModalTitle').innerText = 'Edit Pharmacy';
    
    // Populate fields
    const form = document.getElementById('addPharmacyForm');
    const fields = ['pharmacy_name', 'owner_name', 'pharmacy_type', 'contact_number', 'email', 'alternate_contact', 'address', 'city', 'state', 'pincode', 'location', 'opening_time', 'closing_time', 'available_24_7', 'home_delivery', 'delivery_radius', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            el.value = pharm[field];
        }
    });
    
    document.getElementById('addPharmacyModalBox').style.display = 'flex';
};

window.editPharmacist = function(id) {
    const pharm = window.pharmacistsData.find(p => p.id == id);
    if (!pharm) return;
    
    document.getElementById('addPharmacistForm').reset();
    document.getElementById('edit_pharmacist_id').value = pharm.id;
    document.getElementById('pharmacistModalTitle').innerText = 'Edit Pharmacist';
    
    // Populate fields
    const form = document.getElementById('addPharmacistForm');
    const fields = ['pharmacist_name', 'pharmacy_name', 'registration_number', 'qualification', 'contact_number', 'email', 'experience_years', 'shift_timing', 'availability', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            el.value = pharm[field];
        }
    });
    
    document.getElementById('addPharmacistModalBox').style.display = 'flex';
};

// Remove old global Edit placeholder logic if it exists
`;

// Remove the old editMedicine, editPharmacy, editPharmacist placeholders
mdcJs = mdcJs.replace(/window\.editMedicine\s*=\s*function\(id\)\s*{\s*alert\("Edit functionality coming soon for ID: "\s*\+\s*id\);\s*};/g, "");
mdcJs = mdcJs.replace(/window\.editPharmacy\s*=\s*function\(id\)\s*{\s*alert\("Edit functionality coming soon for ID: "\s*\+\s*id\);\s*};/g, "");
mdcJs = mdcJs.replace(/window\.editPharmacist\s*=\s*function\(id\)\s*{\s*alert\("Edit functionality coming soon for ID: "\s*\+\s*id\);\s*};/g, "");

fs.writeFileSync('js/mdc.js', mdcJs);
console.log('Update Complete.');
