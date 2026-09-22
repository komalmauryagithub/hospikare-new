import re

with open('js/hsp.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the addDoctorBtn click handler block
start_idx = content.find("addDoctorBtn.addEventListener('click'")
if start_idx != -1:
    end_idx = content.find("doctorBox.querySelector('.removeDoctorBtn')", start_idx)
    if end_idx != -1:
        block = content[start_idx:end_idx]
        
        # Replace the CSV variables with empty strings or default values in this block
        block = re.sub(r'\$\{nameIdx !== -1 \? cols\[nameIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{\(genderIdx!== -1 && cols\[genderIdx\]===\'Male\'\)\?\'selected\':\'\'\}', '', block)
        block = re.sub(r'\$\{\(genderIdx!== -1 && cols\[genderIdx\]===\'Female\'\)\?\'selected\':\'\'\}', '', block)
        block = re.sub(r'\$\{\(genderIdx!== -1 && cols\[genderIdx\]===\'Other\'\)\?\'selected\':\'\'\}', '', block)
        block = re.sub(r'\$\{dobIdx !== -1 \? cols\[dobIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{mobileIdx !== -1 \? cols\[mobileIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{emailIdx !== -1 \? cols\[emailIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{\(specIdx!== -1 && parseMulti\(cols\[specIdx\]\)\.includes\(spec\)\)\?\'selected\':\'\'\}', '', block)
        block = re.sub(r'\$\{qualIdx !== -1 \? cols\[qualIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{regNoIdx !== -1 \? cols\[regNoIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{expIdx !== -1 \? cols\[expIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{deptIdx !== -1 \? cols\[deptIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{feeIdx !== -1 \? cols\[feeIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{daysIdx !== -1 \? cols\[daysIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{timeIdx !== -1 \? cols\[timeIdx\] : \'\'\}', '', block)
        block = re.sub(r'\$\{\(statusIdx!== -1 && cols\[statusIdx\]===\'Active\'\)\?\'selected\':\'\'\}', '', block)
        block = re.sub(r'\$\{\(statusIdx!== -1 && cols\[statusIdx\]===\'Inactive\'\)\?\'selected\':\'\'\}', '', block)
        
        # In case I missed some with spacing variations
        block = re.sub(r'\$\{[^}]*Idx[^}]*\}', '', block)

        content = content[:start_idx] + block + content[end_idx:]

with open('js/hsp.js', 'w', encoding='utf-8') as f:
    f.write(content)
