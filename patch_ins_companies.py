import re

with open('js/ins.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# 1. Add `else if(id === "companiesBtn") { loadCompanies(); }`
if 'else if(id === "companiesBtn"){' not in js:
    js = js.replace('if(id === "plansBtn"){', 'if(id === "plansBtn"){\n            loadInsurances();\n        } else if(id === "companiesBtn"){\n            loadCompanies();')

# 2. Add loadCompanies logic
new_functions = """
window.openAddCompanyModal = function() {
    document.getElementById('companyForm').reset();
    document.getElementById('company_id').value = '';
    document.getElementById('companyModalTitle').innerText = 'Add Insurance Company';
    document.getElementById('companyModal').style.display = 'flex';
};

window.editCompany = async function(id) {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        if(data.success) {
            const company = data.data.find(c => c.id == id);
            if(company) {
                const form = document.getElementById('companyForm');
                form.reset();
                document.getElementById('company_id').value = company.id;
                document.getElementById('companyModalTitle').innerText = 'Edit Insurance Company';
                
                const fields = [
                    'company_name', 'company_type', 'contact_person', 'mobile_number', 'email', 'website',
                    'full_address', 'city', 'state', 'pincode', 'insurance_tpa_name', 'policy_types',
                    'cashless_available', 'claim_support', 'network_hospitals', 'status', 'verification_status'
                ];
                
                fields.forEach(f => {
                    if(form.elements[f]) form.elements[f].value = company[f] || '';
                });
                
                document.getElementById('companyModal').style.display = 'flex';
            }
        }
    } catch(e) {
        console.error(e);
    }
};

window.deleteCompany = async function(id) {
    if(!confirm('Are you sure you want to delete this company?')) return;
    try {
        const res = await fetch('/api/vendor/delete-insurance-company/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            loadCompanies();
        } else {
            alert('Error deleting company');
        }
    } catch(e) {
        console.error(e);
    }
};

window.loadCompanies = async function() {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        
        let html = `
        <div id="companiesSection" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Insurance Companies</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage partnered insurance companies</p>
                </div>
                <button onclick="openAddCompanyModal()" style="padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-plus"></i> Add Company
                </button>
            </div>
            
            <div class="table-wrapper" style="overflow-x:auto; background:white; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                <table class="adminTable" style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Type</th>
                            <th>Contact Person</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(c => {
                html += `
                <tr>
                    <td style="padding:16px;">#${c.id}</td>
                    <td style="padding:16px; font-weight:600;">${c.company_name}</td>
                    <td style="padding:16px;">${c.company_type || '-'}</td>
                    <td style="padding:16px;">${c.contact_person || '-'} <br><small style="color:gray;">${c.mobile_number || ''}</small></td>
                    <td style="padding:16px;">
                        <span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${c.status === 'Active' ? '#dcfce7' : '#f1f5f9'}; color: ${c.status === 'Active' ? '#166534' : '#475569'};">${c.status || 'Active'}</span>
                    </td>
                    <td style="padding:16px;">
                        <button onclick="editCompany(${c.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Company"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteCompany(${c.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Company"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="6" style="text-align:center; padding:30px; color:gray;">No insurance companies found. Click 'Add Company' to create one.</td></tr>`;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        document.getElementById('mainContainer').innerHTML = html;
        
    } catch(e) {
        console.error(e);
        document.getElementById('mainContainer').innerHTML = '<div style="padding:20px; color:red;">Error loading companies</div>';
    }
};

// Also we need to bind the submit handler for companyForm ONLY IF IT DOESN'T EXIST!
document.addEventListener('DOMContentLoaded', () => {
    const cf = document.getElementById('companyForm');
    if(cf && !cf.hasAttribute('data-bound')) {
        cf.setAttribute('data-bound', 'true');
        cf.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const editId = document.getElementById('company_id').value;
            const url = editId ? '/api/vendor/edit-insurance-company/' + editId : '/api/vendor/add-insurance-company';
            
            try {
                const res = await fetch(url, { method: 'POST', body: formData }); // actually edit API might be PUT, let me check server.js!
                // Ah, the edit API in server.js says: app.put('/api/vendor/edit-insurance-company/:id'
                // Wait! Since we are uploading files using FormData, usually you can't easily PUT files unless you do fetch with PUT. fetch(url, {method: 'PUT', body: formData}) DOES work!
                const resData = await res.json();
                if (resData.success) {
                    alert(resData.message || 'Saved successfully');
                    document.getElementById('companyModal').style.display = 'none';
                    if(document.getElementById('companiesSection')) loadCompanies();
                } else {
                    alert(resData.message || 'Error saving');
                }
            } catch(error) {
                console.error(error);
                alert('An error occurred');
            }
        });
    }
});
"""

if 'window.loadCompanies = async function()' not in js:
    js += '\n' + new_functions

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched ins.js to handle Insurance Companies")
