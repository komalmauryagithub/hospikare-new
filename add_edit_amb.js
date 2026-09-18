const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// 1. Add edit button next to delete in ambulance table row
ambJs = ambJs.replace(
    '<i class="fa-solid fa-trash delete-amb-btn" onclick="deleteAmbulance(${ambulance.id})" title="Delete Ambulance"></i>',
    '<i class="fa-solid fa-pen-to-square edit-amb-btn" onclick="openEditAmbulance(${ambulance.id})" title="Edit Ambulance" style="color: var(--primary); cursor: pointer; margin-right: 12px;"></i>\n                        <i class="fa-solid fa-trash delete-amb-btn" onclick="deleteAmbulance(${ambulance.id})" title="Delete Ambulance" style="color: var(--error); cursor: pointer;"></i>'
);

// 2. Add openEditAmbulance function that opens the modal with pre-filled data
// Also add a hidden input for edit ID and modify the form submit to handle both add/edit
const editFunc = `
async function openEditAmbulance(ambId) {
    const form = document.getElementById('ambulanceForm');
    if(!form) return;
    form.reset();
    
    // Set edit mode
    let hiddenId = document.getElementById('edit_ambulance_id');
    if(!hiddenId) {
        hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = 'edit_ambulance_id';
        form.prepend(hiddenId);
    }
    hiddenId.value = ambId;
    
    // Update modal title
    const header = document.getElementById('ambulanceModalHeader');
    if(header) {
        const h2 = header.querySelector('h2');
        if(h2) h2.innerText = 'Edit Ambulance';
    }
    
    try {
        const res = await fetch('/api/ambulances');
        const result = await res.json();
        if(result.success) {
            const amb = result.ambulances.find(a => a.id === ambId);
            if(amb) {
                if(document.getElementById('ambulance_type')) document.getElementById('ambulance_type').value = amb.ambulance_type || '';
                if(document.getElementById('vehicle_number')) document.getElementById('vehicle_number').value = amb.vehicle_number || '';
                if(document.getElementById('base_chrge')) document.getElementById('base_chrge').value = amb.base_chrge || '';
                if(document.getElementById('min_chrge')) document.getElementById('min_chrge').value = amb.min_chrge || '';
                if(document.getElementById('night_chrg')) document.getElementById('night_chrg').value = amb.night_chrg || '';
                if(document.getElementById('wait_chrg')) document.getElementById('wait_chrg').value = amb.wait_chrg || '';
                if(document.getElementById('status')) document.getElementById('status').value = amb.status || 'Available';
                if(document.getElementById('eta')) document.getElementById('eta').value = amb.eta || '';
                if(document.getElementById('book_time_slot')) document.getElementById('book_time_slot').value = amb.book_time_slot || '';
                if(document.getElementById('area')) document.getElementById('area').value = amb.area || '';
                if(document.getElementById('description')) document.getElementById('description').value = amb.description || '';
            }
        }
    } catch(e) { console.error(e); }
    
    document.getElementById('ambulanceModal').style.display = 'flex';
}

`;

// Insert before deleteAmbulance function
ambJs = ambJs.replace(
    'async function deleteAmbulance(id) {',
    editFunc + 'async function deleteAmbulance(id) {'
);

// 3. Modify ambulanceForm submit to handle edit mode
// Find the ambulanceForm submit handler and update the URL logic
ambJs = ambJs.replace(
    "const response = await fetch('/api/add/ambulance',",
    "const editId = document.getElementById('edit_ambulance_id');\n        const isEdit = editId && editId.value;\n        const url = isEdit ? '/api/update/ambulance/' + editId.value : '/api/add/ambulance';\n        const response = await fetch(url,"
);

// 4. Reset edit mode when Add Ambulance button is clicked
ambJs = ambJs.replace(
    "document.getElementById('ambulanceForm').reset();",
    "document.getElementById('ambulanceForm').reset();\n        const editId = document.getElementById('edit_ambulance_id');\n        if(editId) editId.value = '';\n        const h2 = document.getElementById('ambulanceModalHeader')?.querySelector('h2');\n        if(h2) h2.innerText = 'Add Ambulance';"
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Added edit ambulance functionality');
