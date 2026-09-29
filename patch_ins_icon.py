import re

with open('js/ins.js', 'r', encoding='utf-8') as f:
    js = f.read()

pattern = r"const pTriggerText = document\.getElementById\('profileTriggerText'\);\s*if \(pTriggerText\) \{\s*pTriggerText\.innerText = isComplete \? 'Show Profile' : 'Complete Profile';\s*\}"

replacement = """const pTriggerText = document.getElementById('profileTriggerText');
            const pTriggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
            if (pTriggerText) {
                pTriggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }
            if (pTriggerIcon) {
                pTriggerIcon.className = isComplete ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                pTriggerIcon.style.color = isComplete ? '#10b981' : '#3b82f6';
            }"""

js = re.sub(pattern, replacement, js)

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched ins.js")
