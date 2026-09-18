const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const oldFunc = /async function openEditAmbulance\(ambId\) \{[\s\S]*?document\.getElementById\('ambulanceModal'\)\.style\.display = 'flex';\s*\}/;

const newFunc = `async function openEditAmbulance(ambId) {
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
    
    // Update modal title and button
    const header = document.getElementById('ambulanceModalHeader');
    if(header) {
        const h2 = header.querySelector('h2');
        if(h2) h2.innerText = 'Edit Ambulance';
    }
    const saveBtn = document.getElementById('saveAmbulanceBtn');
    if (saveBtn) saveBtn.innerText = 'Update Ambulance';
    
    try {
        const res = await fetch('/api/ambulances');
        const result = await res.json();
        if(result.success && result.ambulances) {
            const amb = result.ambulances.find(a => String(a.id) === String(ambId));
            if(amb) {
                // Smart select for ambulance_type
                const typeSelect = document.getElementById('ambulance_type');
                if(typeSelect && amb.ambulance_type) {
                    let matched = false;
                    for(let i = 0; i < typeSelect.options.length; i++) {
                        const opt = typeSelect.options[i];
                        if(opt.value === amb.ambulance_type || opt.text === amb.ambulance_type) {
                            typeSelect.selectedIndex = i;
                            matched = true;
                            break;
                        }
                    }
                    if(!matched) {
                        const lowerVal = amb.ambulance_type.toLowerCase();
                        for(let i = 0; i < typeSelect.options.length; i++) {
                            const opt = typeSelect.options[i];
                            if(opt.value && (opt.value.toLowerCase().includes(lowerVal) || lowerVal.includes(opt.value.toLowerCase()))) {
                                typeSelect.selectedIndex = i;
                                matched = true;
                                break;
                            }
                        }
                    }
                    if(!matched) {
                        const newOpt = new Option(amb.ambulance_type, amb.ambulance_type, true, true);
                        typeSelect.add(newOpt);
                    }
                }

                if(document.getElementById('vehicle_number')) document.getElementById('vehicle_number').value = amb.vehicle_number || '';
                if(document.getElementById('base_chrge')) document.getElementById('base_chrge').value = amb.base_chrge || '';
                if(document.getElementById('min_chrge')) document.getElementById('min_chrge').value = amb.min_chrge || '';
                if(document.getElementById('night_chrg')) document.getElementById('night_chrg').value = amb.night_chrg || '';
                if(document.getElementById('wait_chrg')) document.getElementById('wait_chrg').value = amb.wait_chrg || '';
                if(document.getElementById('eta')) document.getElementById('eta').value = amb.eta || '';
                if(document.getElementById('book_time_slot')) document.getElementById('book_time_slot').value = amb.book_time_slot || '';
                if(document.getElementById('area')) document.getElementById('area').value = amb.area || '';
                if(document.getElementById('description')) document.getElementById('description').value = amb.description || '';

                // Smart select for status
                const statusSelect = document.getElementById('status');
                if(statusSelect && amb.status) {
                    for(let i = 0; i < statusSelect.options.length; i++) {
                        if(statusSelect.options[i].value.toLowerCase() === amb.status.toLowerCase() || statusSelect.options[i].text.toLowerCase() === amb.status.toLowerCase()) {
                            statusSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }
    } catch(e) { console.error(e); }
    
    document.getElementById('ambulanceModal').style.display = 'flex';
}`;

ambJs = ambJs.replace(oldFunc, newFunc);

// When Add Ambulance button clicked, reset button text to 'Save Ambulance'
ambJs = ambJs.replace("if(h2) h2.innerText = 'Add Ambulance';", "if(h2) h2.innerText = 'Add Ambulance';\n        const saveBtn = document.getElementById('saveAmbulanceBtn');\n        if(saveBtn) saveBtn.innerText = 'Save Ambulance';");

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Enhanced openEditAmbulance in amb.js');
