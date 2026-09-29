import re
import os

files = ['js/hsp.js', 'js/mdc.js', 'js/mdeq.js', 'js/amb.js', 'js/lt.js', 'js/ins.js']

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            js = f.read()
            
        pattern1 = r"const (isComplete|isCompleted) = Boolean\(result\.user\?\.vendor_profile_completed \|\| \(result\.user\?\.bank_account && result\.user\?\.ifsc\)\);"
        
        def rep1(m):
            return f"const {m.group(1)} = Number(result.user?.vendor_profile_completed) === 1;"
            
        js = re.sub(pattern1, rep1, js)
        
        pattern2 = r"const (isComplete|isCompleted) = Boolean\(result\.user\?\.vendor_profile_completed\);"
        
        def rep2(m):
            return f"const {m.group(1)} = Number(result.user?.vendor_profile_completed) === 1;"
            
        js = re.sub(pattern2, rep2, js)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(js)
            
        print(f"Patched boolean logic in {file}")
