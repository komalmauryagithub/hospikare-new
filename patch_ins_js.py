import re

with open('js/ins.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update navigation to handle companiesBtn and companiesSection
target_nav = """const navItems = [
      { btn: "dashboardBtn", section: "dashboardSection" },
      { btn: "plansBtn", section: "plansSection" },
      { btn: "bookingsBtn", section: "bookingsSection" },
      { btn: "customersBtn", section: "customersSection" },
      { btn: "claimsBtn", section: "claimsSection" },
      { btn: "paymentsBtn", section: "paymentsSection" },
  ];"""
replacement_nav = """const navItems = [
      { btn: "dashboardBtn", section: "dashboardSection" },
      { btn: "companiesBtn", section: "companiesSection" },
      { btn: "plansBtn", section: "plansSection" },
      { btn: "bookingsBtn", section: "bookingsSection" },
      { btn: "customersBtn", section: "customersSection" },
      { btn: "claimsBtn", section: "claimsSection" },
      { btn: "paymentsBtn", section: "paymentsSection" },
  ];"""
js = js.replace(target_nav, replacement_nav)

# 2. Add Insurance Company JS Logic
company_js = """
// --- INSURANCE COMPANY LOGIC ---
document.getElementById('companiesBtn')?.addEventListener('click', loadCompanies);
document.getElementById('addCompanyBtn')?.addEventListener('click', () => {
    document.getElementById('companyForm').reset();
    document.getElementById('company_id').value = '';
    document.getElementById('companyModalTitle').innerText = 'Add Insurance Company';
    document.getElementById('companyModal').style.display = 'flex';
});

async function loadCompanies() {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        const tbody = document.getElementById('companiesTableBody');
        if (!tbody) return;
        
        if (data.success && data.data.length > 0) {
            tbody.innerHTML = data.data.map(c => `
                <tr>
                    <td>${c.company_name}</td>
                    <td>${c.company_type || '-'}</td>
                    <td>${c.contact_person || '-'}</td>
                    <td>${c.mobile_number || '-'}</td>
                    <td><span class="status-badge status-${(c.status||'Active').toLowerCase()}">${c.status||'Active'}</span></td>
                    <td>
                        <button onclick='editCompany(${JSON.stringify(c).replace(/'/g, "&#39;")})' style="background:none; border:none; color:var(--primary); cursor:pointer; margin-right:8px;"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick='deleteCompany(${c.id})' style="background:none; border:none; color:var(--trend-down); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No insurance companies found.</td></tr>';
        }
    } catch(e) { console.error(e); }
}

window.editCompany = function(c) {
    const form = document.getElementById('companyForm');
    form.reset();
    document.getElementById('company_id').value = c.id;
    document.getElementById('companyModalTitle').innerText = 'Edit Insurance Company';
    
    for (const key in c) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && input.type !== 'file') input.value = c[key] || '';
    }
    document.getElementById('companyModal').style.display = 'flex';
};

window.deleteCompany = async function(id) {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
        const res = await fetch('/api/vendor/delete-insurance-company/' + id, {method:'DELETE'});
        const data = await res.json();
        if(data.success) loadCompanies();
        else alert(data.message);
    } catch(e) { console.error(e); }
};

document.getElementById('companyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = document.getElementById('company_id').value;
    const url = id ? `/api/vendor/edit-insurance-company/${id}` : '/api/vendor/add-insurance-company';
    const method = id ? 'PUT' : 'POST';
    
    try {
        const res = await fetch(url, { method: method, body: formData });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            document.getElementById('companyModal').style.display = 'none';
            loadCompanies();
        } else alert(data.message);
    } catch(err) { console.error(err); }
});

// Update the openAddInsuranceModal to fetch companies
const origOpenAddInsurance = window.openAddInsuranceModal;
window.openAddInsuranceModal = async function() {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        const select = document.getElementById('planCompanySelect');
        if (select && data.success) {
            select.innerHTML = '<option value="">-- Select Company --</option>' + 
                data.data.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');
        }
    } catch(e) {}
    
    const modal = document.getElementById('insuranceModal');
    if (modal) modal.style.display = 'flex';
};
// --- END INSURANCE COMPANY LOGIC ---
"""
js += "\n\n" + company_js

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("js/ins.js updated with Insurance Company logic.")
