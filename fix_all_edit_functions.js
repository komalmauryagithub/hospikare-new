const fs = require('fs');

// ============================
// FIX mdc.js
// ============================
let mdc = fs.readFileSync('js/mdc.js', 'utf8');

// Replace the editMedicine function completely
const oldEditMedicine = `window.editMedicine = function(id) {
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
            if (field === 'manufacturing_date' || field === 'expiry_date') {
                el.value = new Date(med[field]).toISOString().split('T')[0];
            } else {
                el.value = med[field];
            }
        }
    });
    
    document.getElementById('medicineModal').style.display = 'flex';
};`;

const newEditMedicine = `window.editMedicine = async function(id) {
    // Always fetch fresh data if medicinesData is not available
    if (!window.medicinesData || !Array.isArray(window.medicinesData)) {
        try {
            const resp = await fetch('/api/medicines');
            const data = await resp.json();
            if (data.success) window.medicinesData = data.medicines;
        } catch(e) { console.error('Failed to fetch medicines:', e); }
    }
    if (!window.medicinesData) { alert('Could not load medicines data.'); return; }
    
    const med = window.medicinesData.find(m => m.medicine_id == id || m.id == id);
    if (!med) { alert('Medicine not found.'); return; }
    
    document.getElementById('medicineForm').reset();
    document.getElementById('edit_medicine_id').value = med.medicine_id || med.id;
    const titleEl = document.getElementById('medicineModalTitle') || document.querySelector('#medicineModalHeader h2');
    if (titleEl) titleEl.innerText = 'Edit Medicine';
    
    // Populate all text/select fields
    const fields = ['shop_name', 'medicine_name', 'generic_name', 'brand_name', 'medicine_type', 'category', 'manufacturer', 'composition', 'mrp', 'selling_price', 'gst_percentage', 'discount_percentage', 'stock_quantity', 'minimum_stock_alert', 'batch_number', 'manufacturing_date', 'expiry_date', 'prescription_required', 'schedule_type', 'uses_info', 'dosage_instructions', 'side_effects', 'warnings', 'storage_instructions', 'delivery_available', 'delivery_charge', 'barcode_number', 'medicine_status', 'featured_medicine'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && med[field] !== undefined && med[field] !== null) {
            if (field === 'manufacturing_date' || field === 'expiry_date') {
                try { el.value = new Date(med[field]).toISOString().split('T')[0]; } catch(e) { el.value = ''; }
            } else {
                el.value = med[field];
            }
        }
    });
    
    // Show previously uploaded file info
    const fileFields = [
        { inputId: 'medicine_image', dbField: 'medicine_image', label: 'Medicine Image' },
        { inputId: 'medicine_excel_file', dbField: 'medicine_excel_file', label: 'Excel/CSV File' }
    ];
    fileFields.forEach(ff => {
        const inputEl = document.getElementById(ff.inputId);
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        // Remove old file preview if exists
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (med[ff.dbField]) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Previously uploaded: <strong>' + med[ff.dbField] + '</strong> (select new file only to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('medicineModal').style.display = 'flex';
};`;

mdc = mdc.replace(oldEditMedicine, newEditMedicine);

// Replace the editPharmacy function
const oldEditPharmacy = `window.editPharmacy = function(id) {
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
};`;

const newEditPharmacy = `window.editPharmacy = async function(id) {
    if (!window.pharmaciesData || !Array.isArray(window.pharmaciesData)) {
        try {
            const resp = await fetch('/api/vendor/pharmacies');
            const data = await resp.json();
            if (data.success) window.pharmaciesData = data.pharmacies;
        } catch(e) { console.error('Failed to fetch pharmacies:', e); }
    }
    if (!window.pharmaciesData) { alert('Could not load pharmacies data.'); return; }
    
    const pharm = window.pharmaciesData.find(p => p.id == id);
    if (!pharm) { alert('Pharmacy not found.'); return; }
    
    const form = document.getElementById('addPharmacyForm');
    form.reset();
    document.getElementById('edit_pharmacy_id').value = pharm.id;
    document.getElementById('pharmacyModalTitle').innerText = 'Edit Pharmacy';
    
    // Populate all text/select fields
    const fields = ['pharmacy_name', 'owner_name', 'pharmacy_type', 'contact_number', 'email', 'alternate_contact', 'address', 'city', 'state', 'pincode', 'location', 'opening_time', 'closing_time', 'available_24_7', 'home_delivery', 'delivery_radius', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            if (field === 'available_24_7') {
                el.value = pharm[field] == 1 ? 'Yes' : (pharm[field] === 'Yes' ? 'Yes' : 'No');
            } else if (field === 'home_delivery') {
                el.value = pharm[field] == 1 ? 'Yes' : (pharm[field] === 'Yes' ? 'Yes' : 'No');
            } else {
                el.value = pharm[field];
            }
        }
    });
    
    // Show previously uploaded file info for pharmacy docs
    const pharmacyFileFields = ['pharmacy_logo', 'drug_licence', 'pharmacist_registration_certificate', 'pharmacist_qualification_certificate', 'shop_proof', 'owner_kyc'];
    pharmacyFileFields.forEach(fieldName => {
        const inputEl = form.querySelector('[name="'+fieldName+'"]');
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (pharm[fieldName]) {
            inputEl.removeAttribute('required');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Uploaded: <strong>' + pharm[fieldName] + '</strong> (select new to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('addPharmacyModalBox').style.display = 'flex';
};`;

mdc = mdc.replace(oldEditPharmacy, newEditPharmacy);

// Replace the editPharmacist function
const oldEditPharmacist = `window.editPharmacist = function(id) {
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
};`;

const newEditPharmacist = `window.editPharmacist = async function(id) {
    if (!window.pharmacistsData || !Array.isArray(window.pharmacistsData)) {
        try {
            const resp = await fetch('/api/vendor/pharmacists');
            const data = await resp.json();
            if (data.success) window.pharmacistsData = data.pharmacists;
        } catch(e) { console.error('Failed to fetch pharmacists:', e); }
    }
    if (!window.pharmacistsData) { alert('Could not load pharmacists data.'); return; }
    
    const pharm = window.pharmacistsData.find(p => p.id == id);
    if (!pharm) { alert('Pharmacist not found.'); return; }
    
    const form = document.getElementById('addPharmacistForm');
    form.reset();
    document.getElementById('edit_pharmacist_id').value = pharm.id;
    document.getElementById('pharmacistModalTitle').innerText = 'Edit Pharmacist';
    
    // Populate all text/select fields
    const fields = ['pharmacist_name', 'pharmacy_name', 'registration_number', 'qualification', 'state_pharmacy_council', 'contact_number', 'email', 'experience_years', 'shift_timing', 'availability', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            el.value = pharm[field];
        }
    });
    
    // Show previously uploaded file info for pharmacist docs
    const pharmacistFileFields = ['registration_certificate_doc', 'pharmacist_certificate_doc', 'employment_proof'];
    pharmacistFileFields.forEach(fieldName => {
        const inputEl = form.querySelector('[name="'+fieldName+'"]');
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (pharm[fieldName]) {
            inputEl.removeAttribute('required');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Uploaded: <strong>' + pharm[fieldName] + '</strong> (select new to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('addPharmacistModalBox').style.display = 'flex';
};`;

mdc = mdc.replace(oldEditPharmacist, newEditPharmacist);

// Also remove the duplicate stub editMedicine at line ~1548
const stubEditMedicine = `window.editMedicine = function(id) {
    alert("Edit Medicine functionality coming soon for ID: " + id);
};`;
mdc = mdc.replace(stubEditMedicine, '// editMedicine is defined below with full implementation');

const stubEditPharmacy = `window.editPharmacy = function(id) {
    alert("Edit Pharmacy functionality coming soon for ID: " + id);
};`;
mdc = mdc.replace(stubEditPharmacy, '// editPharmacy is defined below with full implementation');

const stubEditPharmacist = `window.editPharmacist = function(id) {
    alert("Edit Pharmacist functionality coming soon for ID: " + id);
};`;
mdc = mdc.replace(stubEditPharmacist, '// editPharmacist is defined below with full implementation');

fs.writeFileSync('js/mdc.js', mdc);

// ============================
// Update cache buster in mdc.html
// ============================
let html = fs.readFileSync('mdc.html', 'utf8');
html = html.replace(/\?v=\d+/g, '?v=' + Date.now());
fs.writeFileSync('mdc.html', html);

console.log('All edit functions updated with proper data fetching and file preview!');
console.log('Cache buster updated in mdc.html!');
