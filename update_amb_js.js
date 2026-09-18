const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// 1. Replace loadDriverDropdown with loadAmbulanceDropdown
const oldDropdown = `async function loadDriverDropdown() {
    const select = document.getElementById('assigned_driver_id');
    if(!select) return;
    try {
        const response = await fetch('/api/vendor/drivers');
        const result = await response.json();
        select.innerHTML = '<option value="">No Driver Assigned</option>';
        if (result.success) {
            result.data.forEach(driver => {
                // if (driver.status === 'Active') { // Show all or just active? Prompt says "loads existing drivers"
                select.innerHTML += \x60<option value="\${driver.id}">\${driver.driver_name} (\${driver.driver_id_str || 'N/A'})</option>\x60;
            });
        }
    } catch(err) {}
}`;

const newDropdown = `async function loadAmbulanceDropdown() {
    const select = document.getElementById('assigned_ambulance_id');
    if(!select) return;
    try {
        const response = await fetch('/api/ambulances');
        const result = await response.json();
        select.innerHTML = '<option value="">No Ambulance Assigned</option>';
        if (result.success) {
            result.ambulances.forEach(amb => {
                const label = (amb.ambulance_type || 'Ambulance') + ' - ' + (amb.vehicle_number || 'No Reg');
                select.innerHTML += '<option value="' + amb.id + '">' + label + '</option>';
            });
        }
    } catch(err) {}
}`;

ambJs = ambJs.replace(oldDropdown, newDropdown);

// 2. Add assigned_ambulance_id to formData + load ambulance dropdown on open
ambJs = ambJs.replace(
    "formData.append('license_expiry_date', document.getElementById('driver_dl_expiry').value);",
    "formData.append('license_expiry_date', document.getElementById('driver_dl_expiry').value);\n    formData.append('assigned_ambulance_id', document.getElementById('assigned_ambulance_id') ? document.getElementById('assigned_ambulance_id').value : '');"
);

// 3. Set assigned_ambulance_id on edit in openDriverModal
ambJs = ambJs.replace(
    "if(driver.license_expiry_date) {\n                    document.getElementById('driver_dl_expiry').value = driver.license_expiry_date.split('T')[0];\n                }",
    "if(driver.license_expiry_date) {\n                    document.getElementById('driver_dl_expiry').value = driver.license_expiry_date.split('T')[0];\n                }\n                if(driver.assigned_ambulance_id && document.getElementById('assigned_ambulance_id')) {\n                    document.getElementById('assigned_ambulance_id').value = driver.assigned_ambulance_id;\n                }"
);

// 4. Load ambulance dropdown when opening modal
ambJs = ambJs.replace(
    "document.getElementById('driverModal').style.display = 'flex';\n}",
    "await loadAmbulanceDropdown();\n    document.getElementById('driverModal').style.display = 'flex';\n}"
);

// 5. Replace loadDriverDropdown calls with loadAmbulanceDropdown
ambJs = ambJs.replace(/loadDriverDropdown\(\)/g, 'loadAmbulanceDropdown()');

// 6. Remove assigned_driver_id from ambulance FormData
ambJs = ambJs.replace(
    /formData\.append\(\s*"assigned_driver_id",\s*document\.getElementById\("assigned_driver_id"\) \? document\.getElementById\("assigned_driver_id"\)\.value : ""\s*\);/,
    ''
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Updated amb.js for driver-ambulance assignment logic');
