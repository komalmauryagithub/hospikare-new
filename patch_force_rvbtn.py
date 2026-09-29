import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# First, let's fix .rvbtn block that I tried to replace in patch_prof.py.
# Actually, I should just explicitly define it at the bottom of the file to override everything else!
content += '''
/* --- FINAL RVBTN CLEAN OVERRIDE --- */
.hospitalBottom .rvbtn {
    width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
    padding: 0 !important;
    flex: 0 0 42px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    color: #475569 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease-in-out !important;
    box-shadow: none !important;
}

.hospitalBottom .rvbtn:hover {
    background: #f8fafc !important;
    color: #1d4ed8 !important;
    border-color: #cbd5e1 !important;
    transform: translateY(0) !important;
}
'''

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Forced rvbtn styles!")
