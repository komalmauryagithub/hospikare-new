import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # Find the variables
    js = js.replace('const isCompleted = Boolean(user.vendor_profile_completed);', 'const isCompleted = Number(user.vendor_profile_completed) === 1;')
    js = js.replace('const isEditAllowed = Boolean(user.edit_allowed);', 'const isEditAllowed = Number(user.edit_allowed) === 1;')
    js = js.replace('const isEditRequested = Boolean(user.edit_requested);', 'const isEditRequested = Number(user.edit_requested) === 1;')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Fixed bools in {filename}")

fix_file('js/mdeq.js')
fix_file('js/mdc.js')
fix_file('js/hsp.js')
fix_file('js/amb.js')
fix_file('js/lt.js')
fix_file('js/ins.js')
