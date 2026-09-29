import re

with open('js/ins.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the existing submit handler to support edit mode
old_submit = """const response =
                    await fetch(
                        "/api/add/insurance",
                        {
                            method:"POST",
                            body:formData
                        }
                    );
                const result =
                    await response.json();
                if(result.success){
                    alert(
                        "Insurance Added Successfully"
                    );"""

new_submit = """const editId = document.getElementById('edit_insurance_id')?.value;
                const url = editId ? '/api/edit/insurance/' + editId : '/api/add/insurance';
                const method = editId ? 'PUT' : 'POST';
                const response =
                    await fetch(
                        url,
                        {
                            method: method,
                            body:formData
                        }
                    );
                const result =
                    await response.json();
                if(result.success){
                    alert(
                        editId ? "Insurance Plan Updated Successfully" : "Insurance Added Successfully"
                    );"""

js = js.replace(old_submit, new_submit)

# Also update openInsuranceModal to reset edit mode
old_open = 'function openInsuranceModal()'
if old_open in js:
    # Find and add reset logic after function declaration
    js = js.replace(old_open, old_open)  # no change needed, we'll add reset in the function body
    
# Add reset logic - find where openInsuranceModal sets display to flex
# Let's just add a line to reset edit_insurance_id when opening for add
old_add_click = """document.getElementById(
                "addPlanBtn"
            ).addEventListener(
                "click",
                openInsuranceModal
            );"""

new_add_click = """document.getElementById(
                "addPlanBtn"
            ).addEventListener(
                "click",
                function() {
                    const hiddenField = document.getElementById('edit_insurance_id');
                    if(hiddenField) hiddenField.value = '';
                    const modalHeader = document.querySelector('#insuranceModalHeader h2');
                    if(modalHeader) modalHeader.innerText = 'Add Insurance Plan';
                    document.getElementById('insuranceForm')?.reset();
                    openInsuranceModal();
                }
            );"""

js = js.replace(old_add_click, new_add_click)

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated insurance form submit to support edit mode!")
