import re

with open('js/ins.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# 1. Add Actions column header in loadInsurances table
old_header = """<th>Email</th>
                              </tr>"""
new_header = """<th>Email</th>
                                  <th>Actions</th>
                              </tr>"""
js = js.replace(old_header, new_header)

# 2. Add Edit/Delete buttons in each row
old_row = """<td>\${escapeHtml(item.email_sup || "N/A")}</td>
                      </tr>"""
new_row = """<td>\${escapeHtml(item.email_sup || "N/A")}</td>
                          <td>
                              <button onclick="editInsurancePlan(\${item.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Plan"><i class="fa-solid fa-pen"></i></button>
                              <button onclick="deleteInsurancePlan(\${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Plan"><i class="fa-solid fa-trash"></i></button>
                          </td>
                      </tr>"""
js = js.replace(old_row, new_row)

# 3. Fix the colspan for empty state
js = js.replace('colspan="9" class="noInsuranceData"', 'colspan="10" class="noInsuranceData"')

# 4. Add hidden field and edit/delete functions
new_functions = """

// ====== INSURANCE PLAN EDIT/DELETE ======
window.editInsurancePlan = async function(id) {
    try {
        const res = await fetch('/api/user/insurances');
        const data = await res.json();
        if(data.success) {
            const plan = data.insurances.find(p => p.id == id);
            if(plan) {
                const form = document.getElementById('insuranceForm');
                form.reset();
                
                // Set hidden edit id
                let hiddenField = document.getElementById('edit_insurance_id');
                if(!hiddenField) {
                    hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.id = 'edit_insurance_id';
                    hiddenField.name = 'edit_insurance_id';
                    form.prepend(hiddenField);
                }
                hiddenField.value = plan.id;
                
                // Map DB fields to form field names
                const fieldMap = {
                    'comp_name': 'comp_name',
                    'comp_type': 'comp_type',
                    'description': 'ins_description',
                    'irdai': 'irdai_number',
                    'comp_pan': 'comp_pan',
                    'gst': 'gst_number',
                    'offc_add': 'ins_address',
                    'claim_type': 'claim_type',
                    'doc_req': 'required_docs',
                    'claim_time': 'claim_approval_time',
                    'cust_sup_num': 'contact_number',
                    'email_sup': 'ins_email',
                    'company_id': 'company_id'
                };
                
                Object.keys(fieldMap).forEach(dbField => {
                    const formField = fieldMap[dbField];
                    if(form.elements[formField]) {
                        form.elements[formField].value = plan[dbField] || '';
                    }
                });
                
                // Update modal title
                const modalHeader = document.querySelector('#insuranceModalHeader h2');
                if(modalHeader) modalHeader.innerText = 'Edit Insurance Plan';
                
                // Show modal
                document.getElementById('insuranceModal').style.display = 'flex';
            }
        }
    } catch(e) {
        console.error(e);
    }
};

window.deleteInsurancePlan = async function(id) {
    if(!confirm('Are you sure you want to delete this insurance plan?')) return;
    try {
        const res = await fetch('/api/delete/insurance/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            alert('Plan deleted successfully!');
            loadInsurances();
        } else {
            alert(data.message || 'Error deleting plan');
        }
    } catch(e) {
        console.error(e);
    }
};
"""

if 'window.editInsurancePlan' not in js:
    js += new_functions

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Added edit/delete buttons and functions to insurance plans table!")
