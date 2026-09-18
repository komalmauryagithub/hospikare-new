const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const oldBlockRegex = /async function loadAmbulanceDropdown\(selectedId = null\) \{[\s\S]*?async function openDriverModal\(driverId\) \{[\s\S]*?document\.getElementById\('driverModal'\)\.style\.display = 'flex';\s*\}/;

const newBlock = `async function loadAmbulanceDropdown(selectedId = null, currentDriverId = null) {
    const select = document.getElementById('assigned_ambulance_id');
    if(!select) return;
    try {
        const response = await fetch('/api/ambulances');
        const result = await response.json();
        select.innerHTML = '<option value="">No Ambulance Assigned</option>';
        if (result.success && result.ambulances) {
            result.ambulances.forEach(amb => {
                const ambType = amb.ambulance_type || 'Ambulance';
                const regNo = amb.vehicle_number || 'No Reg';
                const isCurrentDriverAmb = selectedId && (String(amb.id) === String(selectedId) || (currentDriverId && String(amb.assigned_driver_id) === String(currentDriverId)));
                const isAssignedToOther = amb.assigned_driver_id && !isCurrentDriverAmb;
                
                let label = ambType + ' - ' + regNo;
                let disabledAttr = '';
                let selectedAttr = '';
                
                if (isCurrentDriverAmb) {
                    selectedAttr = 'selected';
                    label += ' (Current Assigned)';
                } else if (isAssignedToOther) {
                    disabledAttr = 'disabled style="color: #94a3b8; background: rgba(0,0,0,0.05);"';
                    label += ' (Already Assigned: ' + (amb.driver_name || 'Another Driver') + ')';
                }
                
                select.innerHTML += \`<option value="\${amb.id}" \${selectedAttr} \${disabledAttr}>\${label}</option>\`;
            });
            if (selectedId) {
                select.value = String(selectedId);
            }
        }
    } catch(err) { console.error(err); }
}

document.getElementById('addDriverSectionBtn')?.addEventListener('click', () => openDriverModal(null));
document.getElementById('closeDriverModal')?.addEventListener('click', () => document.getElementById('driverModal').style.display = 'none');
document.getElementById('cancelDriverBtn')?.addEventListener('click', () => document.getElementById('driverModal').style.display = 'none');

async function openDriverModal(driverId) {
    document.getElementById('driverCrudForm').reset();
    document.getElementById('driver_id').value = '';
    document.getElementById('driverModalTitle').innerText = 'Add New Driver';
    
    if (driverId) {
        document.getElementById('driverModalTitle').innerText = 'Edit Driver';
        try {
            const res = await fetch('/api/vendor/driver/' + driverId);
            const result = await res.json();
            if (result.success && result.data) {
                const driver = result.data;
                document.getElementById('driver_id').value = driver.id;
                document.getElementById('driver_name').value = driver.driver_name || '';
                document.getElementById('driver_id_str').value = driver.driver_id_str || '';
                document.getElementById('driver_mobile').value = driver.mobile_number || '';
                document.getElementById('driver_status').value = driver.status || 'Active';
                document.getElementById('driver_address').value = driver.address || '';
                document.getElementById('driver_dl_number').value = driver.driving_license_number || '';
                if(driver.license_expiry_date) {
                    document.getElementById('driver_dl_expiry').value = driver.license_expiry_date.split('T')[0];
                }
                await loadAmbulanceDropdown(driver.assigned_ambulance_id, driver.id);
            }
        } catch(e) { 
            console.error(e); 
            await loadAmbulanceDropdown(null, null);
        }
    } else {
        await loadAmbulanceDropdown(null, null);
    }
    document.getElementById('driverModal').style.display = 'flex';
}`;

ambJs = ambJs.replace(oldBlockRegex, newBlock);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated loadAmbulanceDropdown and openDriverModal in amb.js');
