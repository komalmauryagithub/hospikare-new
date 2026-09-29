import os
import re

files = ['js/hsp.js', 'js/mdc.js', 'js/mdeq.js', 'js/amb.js', 'js/lt.js', 'js/ins.js']

# The logic we want to insert is:
# const triggerText = document.getElementById('profileTriggerText');
# const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
# if (triggerText) { triggerText.innerText = isCompleted ? 'Show Profile' : 'Complete Profile'; }
# if (triggerIcon) { triggerIcon.className = isCompleted ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen'; triggerIcon.style.color = isCompleted ? '#10b981' : '#3b82f6'; }

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            js = f.read()
        
        # Check if the logic already exists
        if "'fa-solid fa-id-card'" in js:
            print(f"Skipping {file}, logic already present.")
            continue
            
        # We need to find where the profile trigger text is updated
        # Usually looks like: triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
        # OR triggerText.innerText = isCompleted ? 'Show Profile' : 'Complete Profile';
        
        # Let's search for triggerText and replace the whole block
        pattern = r"const\s+triggerText\s*=\s*document\.getElementById\(['\"]profileTriggerText['\"]\);\s*if\s*\(triggerText\)\s*\{\s*triggerText\.innerText\s*=\s*(isComplete|isCompleted)\s*\?\s*'Show Profile'\s*:\s*'Complete Profile';\s*\}"
        
        def replacer(match):
            is_var = match.group(1)
            return f"""const triggerText = document.getElementById('profileTriggerText');
            const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
            if (triggerText) {{
                triggerText.innerText = {is_var} ? 'Show Profile' : 'Complete Profile';
            }}
            if (triggerIcon) {{
                triggerIcon.className = {is_var} ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                triggerIcon.style.color = {is_var} ? '#10b981' : '#3b82f6';
            }}"""
            
        new_js = re.sub(pattern, replacer, js)
        
        if new_js != js:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_js)
            print(f"Patched {file}")
        else:
            print(f"Could not find pattern in {file}")
