const fs = require('fs');
let content = fs.readFileSync('js/amb.js', 'utf8');

// Update reloadCurrentAmbulancePanel
content = content.replace(
    'else if (activeId === "bookingsBtn") {\n        loadBookings();\n    }',
    'else if (activeId === "bookingsBtn") {\n        loadBookings();\n    } else if (activeId === "driversBtn") {\n        loadDrivers();\n    }'
);

const driverFunctions = `
// ================= DRIVER CRUD =================

async function loadDrivers() {
    try {
        const response = await fetch('/api/vendor/drivers');
        const result = await response.json();
        const tbody = document.getElementById("driversTableBody");
        if(tbody) tbody.innerHTML = "";
        
        if (result.success) {
            const drivers = result.data;
            let html = "";
            drivers.forEach(driver => {
                const photoSrc = driver.driver_photo ? '/uploads/' + driver.driver_photo : '/assets/default_avatar.png';
                const statusColor = driver.status === 'Active' ? '#18B981' : (driver.status === 'Inactive' ? '#EF4B5F' : '#F59E0B');
                
                html += \`
                    <tr>
                        <td><img src="\${photoSrc}" alt="Driver" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
                        <td>
                            <div style="font-weight: 600; color: var(--text-dark);">\${driver.driver_name}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">ID: \${driver.driver_id_str || 'N/A'}</div>
                        </td>
                        <td>\${driver.mobile_number}</td>
                        <td><span style="background: \${statusColor}20; color: \${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">\${driver.status || 'Active'}</span></td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-action edit-driver-btn" data-id="\${driver.id}" style="color: var(--primary);"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button class="btn-action delete-driver-btn" data-id="\${driver.id}" style="color: var(--error);"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                \`;
            });
            if(tbody) {
                tbody.innerHTML = html;
                document.querySelectorAll('.edit-driver-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => openDriverModal(e.currentTarget.getAttribute('data-id')));
                });
                document.querySelectorAll('.delete-driver-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteDriver(e.currentTarget.getAttribute('data-id')));
                });
            }
        }
    } catch(err) { console.error(err); }
}

async function loadDriverDropdown() {
    const select = document.getElementById('assigned_driver_id');
    if(!select) return;
    try {
        const response = await fetch('/api/vendor/drivers');
        const result = await response.json();
        select.innerHTML = '<option value="">No Driver Assigned</option>';
        if (result.success) {
            result.data.forEach(driver => {
                // if (driver.status === 'Active') { // Show all or just active? Prompt says "loads existing drivers"
                select.innerHTML += \`<option value="\${driver.id}">\${driver.driver_name} (\${driver.driver_id_str || 'N/A'})</option>\`;
            });
        }
    } catch(err) {}
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
                document.getElementById('driver_name').value = driver.driver_name;
                document.getElementById('driver_id_str').value = driver.driver_id_str || '';
                document.getElementById('driver_mobile').value = driver.mobile_number || '';
                document.getElementById('driver_status').value = driver.status || 'Active';
                document.getElementById('driver_address').value = driver.address || '';
                document.getElementById('driver_dl_number').value = driver.driving_license_number || '';
                if(driver.license_expiry_date) {
                    document.getElementById('driver_dl_expiry').value = driver.license_expiry_date.split('T')[0];
                }
            }
        } catch(e) {}
    }
    document.getElementById('driverModal').style.display = 'flex';
}

document.getElementById('driverCrudForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const driverId = document.getElementById('driver_id').value;
    
    formData.append('driver_name', document.getElementById('driver_name').value);
    formData.append('driver_id_str', document.getElementById('driver_id_str').value);
    formData.append('mobile_number', document.getElementById('driver_mobile').value);
    formData.append('status', document.getElementById('driver_status').value);
    formData.append('address', document.getElementById('driver_address').value);
    formData.append('driving_license_number', document.getElementById('driver_dl_number').value);
    formData.append('license_expiry_date', document.getElementById('driver_dl_expiry').value);
    
    const photo = document.getElementById('driver_photo_upload').files[0];
    if (photo) formData.append('driver_photo', photo);
    const doc = document.getElementById('driver_dl_doc_upload').files[0];
    if (doc) formData.append('driving_license_doc', doc);

    const url = driverId ? '/api/vendor/driver/update/' + driverId : '/api/vendor/driver/create';
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
            alert('Driver saved successfully!');
            document.getElementById('driverModal').style.display = 'none';
            loadDrivers();
            loadDriverDropdown(); // Refresh dropdown in Add Ambulance form
        } else {
            alert(result.message || 'Failed to save driver');
        }
    } catch(err) {
        alert('Server error');
    }
});

async function deleteDriver(driverId) {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
        const res = await fetch('/api/vendor/driver/delete/' + driverId, { method: 'POST' });
        const result = await res.json();
        if (result.success) {
            loadDrivers();
            loadDriverDropdown();
        } else {
            alert(result.message || 'Failed to delete driver');
        }
    } catch(err) { alert('Server error'); }
}
`;

content += '\n' + driverFunctions;

// Add loadDriverDropdown() call to the ambulanceModal opening logic
content = content.replace(
    'document.getElementById("ambulanceForm").reset();',
    'document.getElementById("ambulanceForm").reset();\n    loadDriverDropdown();'
);

fs.writeFileSync('js/amb.js', content, 'utf8');
console.log('Updated amb.js');
