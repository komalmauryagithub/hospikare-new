import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # Find the block we added earlier
    target = """            const triggerText = document.getElementById('profileTriggerText');
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
                triggerText.innerHTML = (isComplete ? '<i class="fa-solid fa-user-check"></i> ' : '<i class="fa-solid fa-user-pen"></i> ') + triggerText.innerText;
            }"""
    
    replacement = """            const triggerText = document.getElementById('profileTriggerText');
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
                const icon = triggerText.previousElementSibling;
                if (icon && icon.tagName === 'I') {
                    icon.className = isComplete ? "fa-solid fa-user-check" : "fa-solid fa-user-pen";
                }
            }"""
    
    js = js.replace(target, replacement)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Fixed double icon in {filename}")

fix_file('js/mdeq.js')
fix_file('js/mdc.js')
