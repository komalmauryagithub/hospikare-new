const fs = require('fs');

function getBaseForm(entityType, fields, docs, typeName) {
    let html = `<form id="vendorProfileForm" enctype="multipart/form-data" style="padding:24px 26px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; overflow-y:auto; max-height:calc(90vh - 92px);">
        <input type="hidden" id="profileEntityType" value="${typeName}">
        <div style="grid-column:1/-1; display:flex; flex-direction:column; gap:8px;">
            <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Select ${entityType} to Complete Profile</label>
            <select id="entitySelect" name="entity_id" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
                <option value="">Select ${entityType}...</option>
            </select>
        </div>`;

    fields.forEach(f => {
        let name = f.name;
        let type = f.type || 'text';
        html += `<div style="display:flex; flex-direction:column; gap:8px;"><label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">${f.label}</label><input type="${type}" name="${name}" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" ${f.required !== false ? 'required' : ''}></div>`;
    });

    html += `<div style="grid-column:1/-1; margin-top:10px;"><h4 style="margin:0; font-size:15px; color:var(--hk-text-main, #101828);">Documents (Upload)</h4></div>`;

    docs.forEach(d => {
        let name = d.name;
        html += `<div style="display:flex; flex-direction:column; gap:8px;"><label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">${d.label}</label><input type="file" name="${name}" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required></div>`;
    });

    html += `<div style="grid-column:1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:8px;" id="profileModalActionButtons">
        <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;" onclick="document.getElementById('profileModalBox').style.display='none'">Close</button>
        <button type="submit" id="saveProfileBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Profile</button>
    </div>
    </form>`;
    return html;
}

const configs = {
    'hsp.html': {
        type: 'Hospital',
        typeName: 'hospital',
        fields: [
            { label: 'Hospital Registration Number', name: 'hospital_registration_number' },
            { label: 'Hospital Type', name: 'hospital_type' },
            { label: 'Address', name: 'address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Number of Beds', name: 'number_of_beds', type: 'number' },
            { label: 'Available Services/Departments', name: 'facilities' }
        ],
        docs: [
            { label: 'Hospital Registration Certificate', name: 'hospital_reg_certificate' },
            { label: 'PAN Card', name: 'pan_card' },
            { label: 'GST Certificate (if applicable)', name: 'gst_certificate' },
            { label: 'Authorized Person ID Proof', name: 'authorized_person_id_proof' }
        ]
    },
    'amb.html': {
        type: 'Ambulance',
        typeName: 'ambulance',
        fields: [
            { label: 'Registration Number', name: 'registration_number' },
            { label: 'Address', name: 'address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Ambulance Type', name: 'ambulance_type' },
            { label: 'Vehicle Number', name: 'vehicle_number' },
            { label: 'Service Area', name: 'service_area' }
        ],
        docs: [
            { label: 'Ambulance Registration/RC', name: 'ambulance_registration_rc' },
            { label: 'Vehicle Fitness Certificate', name: 'vehicle_fitness_certificate' },
            { label: 'Vehicle Insurance', name: 'vehicle_insurance' },
            { label: 'Driver License', name: 'driver_license' },
            { label: 'Business/Service Registration Proof', name: 'business_registration_proof' }
        ]
    },
    'lt.html': {
        type: 'Lab Test / Diagnostic Center',
        typeName: 'lab',
        fields: [
            { label: 'Lab Registration Number', name: 'lab_registration_number' },
            { label: 'Address', name: 'address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Available Tests', name: 'test' },
            { label: 'Home Sample Collection — Yes/No', name: 'home_coll' }
        ],
        docs: [
            { label: 'Lab Registration Certificate', name: 'hospital_reg_certificate' },
            { label: 'NABL Certificate (if applicable)', name: 'nabl_certificate' },
            { label: 'PAN Card', name: 'pan_card' },
            { label: 'Authorized Person ID Proof', name: 'authorized_person_id_proof' }
        ]
    },
    'mdc.html': {
        type: 'Pharmacy',
        typeName: 'pharmacy',
        fields: [
            { label: 'Drug License Number', name: 'drug_license_number' },
            { label: 'Address', name: 'address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Pharmacist Name', name: 'pharmacist_name' },
            { label: 'Home Delivery — Yes/No', name: 'home_delivery' }
        ],
        docs: [
            { label: 'Drug License', name: 'drug_license_doc' },
            { label: 'Pharmacist Registration Certificate', name: 'pharmacist_registration_cert' },
            { label: 'PAN Card', name: 'pan_card' },
            { label: 'Authorized Person ID Proof', name: 'authorized_person_id_proof' }
        ]
    },
    'mdeq.html': {
        type: 'Medical Equipment Source',
        typeName: 'equipment_source',
        fields: [
            { label: 'Business Registration Number', name: 'business_registration_number' },
            { label: 'Address', name: 'address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Equipment Category', name: 'equipment_category' },
            { label: 'Sale / Rental', name: 'sale_rental' }
        ],
        docs: [
            { label: 'Business Registration Certificate', name: 'business_registration_proof' },
            { label: 'GST Certificate (if applicable)', name: 'gst_certificate' },
            { label: 'PAN Card', name: 'pan_card' },
            { label: 'Authorized Person ID Proof', name: 'authorized_person_id_proof' },
            { label: 'Manufacturer/Distributor Authorization (if applicable)', name: 'manufacturer_authorization' }
        ]
    },
    'ins.html': {
        type: 'Insurance Company',
        typeName: 'insurance',
        fields: [
            { label: 'IRDAI Registration Number', name: 'irdai_registration_number' },
            { label: 'Registered Office Address', name: 'registered_office_address' },
            { label: 'Contact Number', name: 'contact_number' },
            { label: 'Insurance Plans/Types', name: 'insurance_plans' },
            { label: 'Website', name: 'website' }
        ],
        docs: [
            { label: 'IRDAI Registration/License', name: 'irdai_license_doc' },
            { label: 'Company Registration Certificate', name: 'company_registration_cert' },
            { label: 'PAN Card', name: 'pan_card' },
            { label: 'Authorized Person ID Proof', name: 'authorized_person_id_proof' }
        ]
    }
};

for (const file in configs) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        const config = configs[file];
        const newForm = getBaseForm(config.type, config.fields, config.docs, config.typeName);
        
        // Regex to replace from <form id="vendorProfileForm" to </form>
        const regex = /<form id="vendorProfileForm"[\s\S]*?<\/form>/;
        content = content.replace(regex, newForm);
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated form in ${file}`);
    } catch(e) {
        console.error(`Failed to update ${file}: ${e.message}`);
    }
}
