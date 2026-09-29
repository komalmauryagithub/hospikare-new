import re
import os

files = ['js/hsp.js', 'js/mdc.js', 'js/mdeq.js', 'js/amb.js', 'js/lt.js', 'js/ins.js']

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            js = f.read()
            
        # Replace Boolean(...) logic with Number(...) === 1 logic for dropdown icon
        pattern1 = r"const isComplete = Boolean\(result\.user\?\.vendor_profile_completed \|\| \(result\.user\?\.bank_account && result\.user\?\.ifsc\)\);"
        replacement1 = r"const isComplete = Number(result.user?.vendor_profile_completed) === 1;"
        js = re.sub(pattern1, replacement1, js)
        
        pattern2 = r"const isCompleted = Boolean\(result\.user\?\.vendor_profile_completed\);"
        replacement2 = r"const isComplete = Number(result.user?.vendor_profile_completed) === 1;"
        js = re.sub(pattern2, replacement2, js)
        
        # In files where it was `isCompleted`, the icon logic used `isCompleted`. Since I renamed it to `isComplete` in replacement2, I need to make sure the icon logic uses `isComplete` OR just name it `isCompleted` if that's what's used.
        # Actually, let's just replace `isCompleted` with `isComplete` in the icon logic if it was using `isCompleted`.
        # The icon logic uses `isComplete` or `isCompleted` based on the previous variable name.
        # Let's just fix the variable declaration based on what is used.
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(js)
            
        print(f"Patched boolean logic in {file}")
