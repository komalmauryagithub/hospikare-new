import re

def extract_chunk(filepath, pattern, lines_after=40):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()
    match = re.search(pattern, js, re.DOTALL)
    if not match:
        return None
    # We will try to extract the whole function by matching brackets, but regex is hard.
    # Instead, we will use a more precise regex.
    pass

with open('js/hsp.js', 'r', encoding='utf-8') as f:
    hsp_js = f.read()

# Extract openProfileModal from hsp.js
match_open = re.search(r'(async function openProfileModal\(\) \{.*?\}\s*\n\})', hsp_js, re.DOTALL)
if not match_open:
    # Alternative format if it didn't match perfectly
    match_open = re.search(r'(async function openProfileModal\(\) \{.*?(?:catch\(err\)\s*\{\s*console\.error\(err\);\s*\}\s*\}|catch\(err\)\s*\{[^\}]*\}\s*\n\}|catch\(err\) \{ console\.error\(err\); \}\n\})', hsp_js, re.DOTALL)

open_profile_logic = match_open.group(1) if match_open else ""

# Extract vendorProfileForm submit from hsp.js
match_submit = re.search(r"(document\.getElementById\('vendorProfileForm'\)\?\.addEventListener\('submit', async \(event\) => \{.*?\n\}\);)", hsp_js, re.DOTALL)
submit_logic = match_submit.group(1) if match_submit else ""

if not open_profile_logic or not submit_logic:
    print("FAILED TO EXTRACT CHUNKS")
    exit(1)

for filename in ['js/mdc.js', 'js/mdeq.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Remove existing openProfileModal (which might be async or not)
    js = re.sub(r'(?:async\s+)?function\s+openProfileModal\(\)\s*\{.*?catch[^\}]+\}\s*\}', '', js, flags=re.DOTALL)
    js = re.sub(r'(?:async\s+)?function\s+openProfileModal\(\)\s*\{.*?(?=\n(?:function|document|const|let|var|//))', '', js, flags=re.DOTALL)
    
    # Remove existing vendorProfileForm submit
    js = re.sub(r"document\.getElementById\(['\"]vendorProfileForm['\"]\)\?\.addEventListener\(['\"]submit['\"], async \(event\) => \{.*?\n\}\);", '', js, flags=re.DOTALL)
    
    # Also remove any extra instances of it
    js = re.sub(r"document\.getElementById\(['\"]vendorProfileForm['\"]\)\?\.addEventListener\(['\"]submit['\"], async \(event\) => \{.*?\n\}\);", '', js, flags=re.DOTALL)
    
    # Append the new logic at the end
    js += "\n\n" + open_profile_logic + "\n\n" + submit_logic + "\n"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Updated {filename} with hsp.js logic")
