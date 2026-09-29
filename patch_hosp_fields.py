import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add age and gender fields to the modal
old_html = '''                        <div class="form-group">
                            <label>Patient Full Name</label>
                            <input type="text" id="bookingName" required placeholder="Enter full name">
                        </div>'''

new_html = '''                        <div class="form-group">
                            <label>Patient Full Name</label>
                            <input type="text" id="bookingName" required placeholder="Enter full name">
                        </div>
                        
                        <div style="display:flex; gap:16px;">
                            <div class="form-group" style="flex:1;">
                                <label>Age</label>
                                <input type="number" id="bookingAge" required placeholder="Years" min="0" max="120">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Gender</label>
                                <select id="bookingGender" required style="font-weight:600; background:#f8fafc;">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>'''

content = content.replace(old_html, new_html)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added Age and Gender fields to the modal!")
