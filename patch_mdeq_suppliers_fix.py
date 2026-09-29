import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

suppliers_js = """
// ==================== SUPPLIERS LOGIC ====================

window.openAddSupplierModal = function() {
    document.getElementById('supplierForm').reset();
    document.getElementById('edit_supplier_id').value = '';
    const modal = document.getElementById('addSupplierModal');
    if (modal) {
        const title = modal.querySelector('h2');
        if (title) title.innerText = 'Add Equipment Supplier';
        modal.style.display = 'flex';
    }
};

window.loadSuppliers = async function() {
    const html = `
        <div id="suppliersSection">
            <div class="topBar" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                <button onclick="openAddSupplierModal()" style="padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-plus"></i>
                    Add Supplier
                </button>
            </div>
            <div class="tableContainer" style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <table id="suppliersTable" style="width:100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                            <th style="padding: 16px; font-weight: 600; color: #475569;">ID</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Logo</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Company</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Supplier Name</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Type</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Contact</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="suppliersTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById("mainContent").innerHTML = html;
    
    try {
        const res = await fetch('/api/equipment-suppliers');
        const data = await res.json();
        if(data.success) {
            const tbody = document.getElementById('suppliersTableBody');
            tbody.innerHTML = '';
            
            // Also populate the supplier dropdown in the add product modal if it exists
            const supplierSelect = document.getElementById('supplier_id');
            if (supplierSelect) {
                supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
            }

            data.suppliers.forEach(sup => {
                if (supplierSelect) {
                    supplierSelect.innerHTML += `<option value="${sup.id}">${sup.shop_company_name || sup.supplier_name}</option>`;
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #e2e8f0';
                
                const logo = sup.supplier_logo ? `<img src="/uploads/${sup.supplier_logo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<div style="width:40px; height:40px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-building"></i></div>`;
                
                tr.innerHTML = `
                    <td style="padding:16px;">#${sup.id}</td>
                    <td style="padding:16px;">${logo}</td>
                    <td style="padding:16px; font-weight:600;">${sup.shop_company_name || '-'}</td>
                    <td style="padding:16px;">${sup.supplier_name || '-'}</td>
                    <td style="padding:16px;">${sup.supplier_type || '-'}</td>
                    <td style="padding:16px;">${sup.mobile_number || '-'}</td>
                    <td style="padding:16px;">
                        <button onclick="editSupplier(${sup.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteSupplier(${sup.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(e) {
        console.error(e);
    }
};

document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = document.getElementById('edit_supplier_id').value;
    
    const url = editId ? '/api/edit/equipment-supplier/' + editId : '/api/add/equipment-supplier';
    
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const data = await res.json();
        if(data.success) {
            alert('Supplier saved successfully!');
            document.getElementById('addSupplierModal').style.display = 'none';
            if (window.loadSuppliers) window.loadSuppliers();
        } else {
            alert('Error saving supplier');
        }
    } catch(e) {
        console.error(e);
    }
});

window.deleteSupplier = async function(id) {
    if(!confirm('Delete this supplier?')) return;
    try {
        const res = await fetch('/api/delete/equipment-supplier/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            if (window.loadSuppliers) window.loadSuppliers();
        }
    } catch(e) {
        console.error(e);
    }
};

window.editSupplier = async function(id) {
    try {
        const res = await fetch('/api/equipment-suppliers');
        const data = await res.json();
        if(data.success) {
            const sup = data.suppliers.find(s => s.id === id);
            if(sup) {
                const form = document.getElementById('supplierForm');
                form.reset();
                
                document.getElementById('edit_supplier_id').value = sup.id;
                
                const fields = ['supplier_name', 'shop_company_name', 'supplier_type', 'owner_name', 'contact_person', 'mobile_number', 'alternate_mobile', 'email', 'full_address', 'city', 'state', 'pincode', 'google_maps_location', 'equipment_categories', 'brands_available', 'equipment_available', 'new_used_equipment', 'warranty_available', 'installation_service', 'after_sales_service'];
                
                fields.forEach(f => {
                    if (form.elements[f]) form.elements[f].value = sup[f] || '';
                });
                
                const modal = document.getElementById('addSupplierModal');
                if (modal) {
                    const title = modal.querySelector('h2');
                    if (title) title.innerText = 'Edit Equipment Supplier';
                    modal.style.display = 'flex';
                }
            }
        }
    } catch(e) {
        console.error(e);
    }
};
// ==================== END SUPPLIERS LOGIC ====================
"""

if 'window.loadSuppliers = async function()' not in js:
    js += '\n' + suppliers_js

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched js/mdeq.js with missing loadSuppliers function")
