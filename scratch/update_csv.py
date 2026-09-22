import re

with open('js/hsp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace headers logic
old_headers = """            const nameIdx = headers.indexOf('doctor_name');
            const qualIdx = headers.indexOf('qualification');
            const expIdx = headers.indexOf('experience');"""

new_headers = """            const nameIdx = headers.indexOf('doctor_name');
            const genderIdx = headers.indexOf('gender');
            const dobIdx = headers.indexOf('dob_age');
            const mobileIdx = headers.indexOf('mobile');
            const emailIdx = headers.indexOf('email');
            const specIdx = headers.indexOf('specialization');
            const qualIdx = headers.indexOf('qualification');
            const regNoIdx = headers.indexOf('medical_reg_no');
            const expIdx = headers.indexOf('experience');
            const deptIdx = headers.indexOf('department');
            const feeIdx = headers.indexOf('consultation_fee');
            const daysIdx = headers.indexOf('available_days');
            const timeIdx = headers.indexOf('available_time');
            const statusIdx = headers.indexOf('status');"""
content = content.replace(old_headers, new_headers)

old_box = """                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600;">Doctor Name</label>
                        <input type="text" class="top-search doctor_name" value="${cols[nameIdx] || ''}" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification</label>
                            <input type="text" class="top-search doctor_qualification" value="${qualIdx !== -1 ? cols[qualIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Experience</label>
                            <input type="text" class="top-search doctor_experience" value="${expIdx !== -1 ? cols[expIdx] : ''}" required>
                        </div>
                    </div>
                `;"""

new_box = """                const parseMulti = (val) => val ? val.split('|').map(s=>s.trim()) : [];
                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Name</label>
                            <input type="text" class="top-search doctor_name" value="${nameIdx !== -1 ? cols[nameIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Profile Photo</label>
                            <input type="file" class="top-search doctor_photo" accept="image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Gender</label>
                            <select class="top-search doctor_gender" required>
                                <option value="">Select...</option>
                                <option value="Male" ${(genderIdx!==-1 && cols[genderIdx]==='Male')?'selected':''}>Male</option>
                                <option value="Female" ${(genderIdx!==-1 && cols[genderIdx]==='Female')?'selected':''}>Female</option>
                                <option value="Other" ${(genderIdx!==-1 && cols[genderIdx]==='Other')?'selected':''}>Other</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Date of Birth / Age</label>
                            <input type="text" class="top-search doctor_dob_age" value="${dobIdx !== -1 ? cols[dobIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Mobile Number</label>
                            <input type="tel" class="top-search doctor_mobile" value="${mobileIdx !== -1 ? cols[mobileIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Email</label>
                            <input type="email" class="top-search doctor_email" value="${emailIdx !== -1 ? cols[emailIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization (Multi-select, separated by |)</label>
                            <select class="top-search doctor_specialization" multiple style="height: auto; min-height: 100px; padding:8px;" required>
                                ${['General Physician','Cardiologist','Neurologist','Neurosurgeon','Orthopedic','Gynecologist','Obstetrician','Pediatrician','Dermatologist','Ophthalmologist','ENT Specialist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Nephrologist','Urologist','Oncologist','Endocrinologist','General Surgeon','Anesthesiologist','Radiologist','Pathologist','Physiotherapist','Emergency Medicine Specialist'].map(spec => 
                                    `<option value="${spec}" ${(specIdx!==-1 && parseMulti(cols[specIdx]).includes(spec))?'selected':''}>${spec}</option>`
                                ).join('')}
                            </select>
                            <small style="color:var(--text-muted); font-size:10px;">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification</label>
                            <input type="text" class="top-search doctor_qualification" value="${qualIdx !== -1 ? cols[qualIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Number</label>
                            <input type="text" class="top-search doctor_reg_no" value="${regNoIdx !== -1 ? cols[regNoIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Years of Experience</label>
                            <input type="text" class="top-search doctor_experience" value="${expIdx !== -1 ? cols[expIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Department</label>
                            <input type="text" class="top-search doctor_department" value="${deptIdx !== -1 ? cols[deptIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Consultation Fee</label>
                            <input type="number" class="top-search doctor_fee" value="${feeIdx !== -1 ? cols[feeIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Days</label>
                            <input type="text" class="top-search doctor_days" value="${daysIdx !== -1 ? cols[daysIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Time / Shift</label>
                            <input type="text" class="top-search doctor_time" value="${timeIdx !== -1 ? cols[timeIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Status</label>
                            <select class="top-search doctor_status" required>
                                <option value="Active" ${(statusIdx!==-1 && cols[statusIdx]==='Active')?'selected':''}>Active</option>
                                <option value="Inactive" ${(statusIdx!==-1 && cols[statusIdx]==='Inactive')?'selected':''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top:12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Certificate ⭐⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_reg" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Degree Certificate ⭐⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_degree" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization Certificate ⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_spec" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Government ID Proof ⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_id" accept=".pdf,image/*">
                        </div>
                    </div>
                `;"""
content = content.replace(old_box, new_box)

with open('js/hsp.js', 'w', encoding='utf-8') as f:
    f.write(content)
