import re

def get_hsp_logic():
    with open('js/hsp.js', 'r', encoding='utf-8') as f:
        hsp = f.read()
    
    # Extract openProfileModal from hsp.js
    match_open = re.search(r'(async function openProfileModal\(\) \{.*?\}\s*\n\})', hsp, re.DOTALL)
    if not match_open:
        match_open = re.search(r'(async function openProfileModal\(\) \{.*?(?:catch\(err\)\s*\{\s*console\.error\(err\);\s*\}\s*\}|catch\(err\)\s*\{[^\}]*\}\s*\n\}|catch\(err\) \{ console\.error\(err\); \}\n\})', hsp, re.DOTALL)

    open_profile_logic = match_open.group(1) if match_open else ""

    # Extract vendorProfileForm submit from hsp.js
    match_submit = re.search(r"(document\.getElementById\('vendorProfileForm'\)\?\.addEventListener\('submit', async \(event\) => \{.*?\n\}\);)", hsp, re.DOTALL)
    submit_logic = match_submit.group(1) if match_submit else ""
    
    return open_profile_logic, submit_logic

open_profile, submit_logic = get_hsp_logic()

if not open_profile or not submit_logic:
    print("FAILED TO EXTRACT CHUNKS FROM HSP")
    exit(1)

new_logic = f"""
// ====== NEW PROFILE FLOW LOGIC ======
{open_profile}

function closeProfileModal() {{
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}}

{submit_logic}
// ===================================
"""

for filename in ['js/mdc.js', 'js/mdeq.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # Check if // =================================== exists
    if '// ===================================' in js:
        # Replace the block
        js = re.sub(
            r'// ====== NEW PROFILE FLOW LOGIC ======.*?// ===================================',
            new_logic,
            js,
            flags=re.DOTALL
        )
    else:
        # Just replace from NEW PROFILE FLOW LOGIC to EOF
        js = re.sub(
            r'// ====== NEW PROFILE FLOW LOGIC ======.*',
            new_logic,
            js,
            flags=re.DOTALL
        )
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Updated {filename}")
