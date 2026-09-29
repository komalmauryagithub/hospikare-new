import re

for filename in ['js/mdeq.js', 'js/ins.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # mdeq.js specific pattern
    pattern1 = r"const triggerText = document\.getElementById\('profileTriggerText'\);\s*if \(triggerText\) \{\s*triggerText\.innerText = (isComplete|isCompleted) \? 'Show Profile' : 'Complete Profile';\s*const icon = triggerText\.previousElementSibling;\s*if \(icon && icon\.tagName === 'I'\) \{\s*icon\.className = \1 \? \"fa-solid fa-user-check\" : \"fa-solid fa-user-pen\";\s*\}\s*\}"
    
    # ins.js specific pattern? let's see if ins.js has something similar
    pattern2 = r"const triggerText = document\.getElementById\([\"']profileTriggerText[\"']\);\s*if\s*\(triggerText\)\s*\{\s*triggerText\.innerText\s*=\s*(isComplete|isCompleted)\s*\?\s*'Show Profile'\s*:\s*'Complete Profile';\s*\}"

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

    js = re.sub(pattern1, replacer, js)
    js = re.sub(pattern2, replacer, js)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Patched {filename}")
