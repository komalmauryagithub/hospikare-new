import re

with open('js/hsp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new HTML block for normal "Add Doctor"
new_box_normal = r"""                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer; font-size:16px;" title="Remove Doctor"><i class="fa-solid fa-trash"></i></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Name <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_name" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Profile Photo</label>
                            <input type="file" class="doctor_photo" accept="image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Gender <span style="color:red;">*</span></label>
                            <select class="doctor_gender" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Date of Birth / Age</label>
                            <input type="text" class="doctor_dob_age" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Mobile Number <span style="color:red;">*</span></label>
                            <input type="tel" class="doctor_mobile" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Email</label>
                            <input type="email" class="doctor_email" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization (Multi-select) <span style="color:red;">*</span></label>
                            <select class="doctor_specialization" multiple style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff; min-height: 120px;" required>
                                ${['General Physician','Cardiologist','Neurologist','Neurosurgeon','Orthopedic','Gynecologist','Obstetrician','Pediatrician','Dermatologist','Ophthalmologist','ENT Specialist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Nephrologist','Urologist','Oncologist','Endocrinologist','General Surgeon','Anesthesiologist','Radiologist','Pathologist','Physiotherapist','Emergency Medicine Specialist'].map(spec => 
                                    `<option value="${spec}">${spec}</option>`
                                ).join('')}
                            </select>
                            <small style="color:var(--text-muted); font-size:11px; margin-top:-2px;">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_qualification" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Number <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_reg_no" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Years of Experience <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_experience" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Department</label>
                            <input type="text" class="doctor_department" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Consultation Fee</label>
                            <input type="number" class="doctor_fee" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Days</label>
                            <input type="text" class="doctor_days" placeholder="e.g. Mon-Fri" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Time / Shift</label>
                            <input type="text" class="doctor_time" placeholder="e.g. 10 AM - 4 PM" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Status <span style="color:red;">*</span></label>
                            <select class="doctor_status" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top:16px; margin-top:8px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_reg" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Degree Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_degree" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization Certificate</label>
                            <input type="file" class="doctor_doc_spec" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Government ID Proof <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_id" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                    </div>
                `;"""

new_box_csv = r"""                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer; font-size:16px;" title="Remove Doctor"><i class="fa-solid fa-trash"></i></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Name <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_name" value="${nameIdx !== -1 ? cols[nameIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Profile Photo</label>
                            <input type="file" class="doctor_photo" accept="image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Gender <span style="color:red;">*</span></label>
                            <select class="doctor_gender" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="">Select...</option>
                                <option value="Male" ${(genderIdx!==-1 && cols[genderIdx]==='Male')?'selected':''}>Male</option>
                                <option value="Female" ${(genderIdx!==-1 && cols[genderIdx]==='Female')?'selected':''}>Female</option>
                                <option value="Other" ${(genderIdx!==-1 && cols[genderIdx]==='Other')?'selected':''}>Other</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Date of Birth / Age</label>
                            <input type="text" class="doctor_dob_age" value="${dobIdx !== -1 ? cols[dobIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Mobile Number <span style="color:red;">*</span></label>
                            <input type="tel" class="doctor_mobile" value="${mobileIdx !== -1 ? cols[mobileIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Email</label>
                            <input type="email" class="doctor_email" value="${emailIdx !== -1 ? cols[emailIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization (Multi-select) <span style="color:red;">*</span></label>
                            <select class="doctor_specialization" multiple style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff; min-height: 120px;" required>
                                ${['General Physician','Cardiologist','Neurologist','Neurosurgeon','Orthopedic','Gynecologist','Obstetrician','Pediatrician','Dermatologist','Ophthalmologist','ENT Specialist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Nephrologist','Urologist','Oncologist','Endocrinologist','General Surgeon','Anesthesiologist','Radiologist','Pathologist','Physiotherapist','Emergency Medicine Specialist'].map(spec => 
                                    `<option value="${spec}" ${(specIdx!==-1 && parseMulti(cols[specIdx]).includes(spec))?'selected':''}>${spec}</option>`
                                ).join('')}
                            </select>
                            <small style="color:var(--text-muted); font-size:11px; margin-top:-2px;">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_qualification" value="${qualIdx !== -1 ? cols[qualIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Number <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_reg_no" value="${regNoIdx !== -1 ? cols[regNoIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Years of Experience <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_experience" value="${expIdx !== -1 ? cols[expIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Department</label>
                            <input type="text" class="doctor_department" value="${deptIdx !== -1 ? cols[deptIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Consultation Fee</label>
                            <input type="number" class="doctor_fee" value="${feeIdx !== -1 ? cols[feeIdx] : ''}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Days</label>
                            <input type="text" class="doctor_days" value="${daysIdx !== -1 ? cols[daysIdx] : ''}" placeholder="e.g. Mon-Fri" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Time / Shift</label>
                            <input type="text" class="doctor_time" value="${timeIdx !== -1 ? cols[timeIdx] : ''}" placeholder="e.g. 10 AM - 4 PM" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Status <span style="color:red;">*</span></label>
                            <select class="doctor_status" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="Active" ${(statusIdx!==-1 && cols[statusIdx]==='Active')?'selected':''}>Active</option>
                                <option value="Inactive" ${(statusIdx!==-1 && cols[statusIdx]==='Inactive')?'selected':''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top:16px; margin-top:8px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_reg" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Degree Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_degree" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization Certificate</label>
                            <input type="file" class="doctor_doc_spec" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Government ID Proof <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_id" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                    </div>
                `;"""


# 1. Replace first occurrence (Add Doctor Button)
# Find the block starting with doctorBox.innerHTML = ` and ending with `;\n                container.appendChild(doctorBox);
pattern_normal = r'doctorBox\.innerHTML = `.*?`;\s*container\.appendChild\(doctorBox\);'
match1 = re.search(pattern_normal, content, re.DOTALL)
if match1:
    content = content[:match1.start()] + new_box_normal + "\n                container.appendChild(doctorBox);" + content[match1.end():]

# 2. Replace second occurrence (CSV Import)
# Find the next block starting with doctorBox.innerHTML = ` and ending with `;\n                doctorBox.querySelector('.removeDoctorBtn')
pattern_csv = r'doctorBox\.innerHTML = `.*?`;\s*doctorBox\.querySelector\(\'\.removeDoctorBtn\'\)'
match2 = re.search(pattern_csv, content, re.DOTALL)
if match2:
    content = content[:match2.start()] + new_box_csv + "\n                doctorBox.querySelector('.removeDoctorBtn')" + content[match2.end():]

with open('js/hsp.js', 'w', encoding='utf-8') as f:
    f.write(content)
