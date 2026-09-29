import re

with open('js/ins.js', 'r', encoding='utf-8') as f:
    js = f.read()

pattern = r"const isComplete = Number\(result\.user\?\.vendor_profile_completed\) === 1;\s*if \(triggerText\) \{\s*triggerText\.innerText = isComplete \? 'Show Profile' : 'Complete Profile';\s*\}"

replacement = """const isComplete = Number(result.user?.vendor_profile_completed) === 1;
            const triggerText = document.getElementById('profileTriggerText');
            const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }
            if (triggerIcon) {
                triggerIcon.className = isComplete ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                triggerIcon.style.color = isComplete ? '#10b981' : '#3b82f6';
            }"""
            
js = re.sub(pattern, replacement, js)

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
