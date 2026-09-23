import re

js_path = r'd:\Office work\Hospikare_final\hospikare (2) (1)\hospikare\js\lt.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add hiding labDetailsSection to everywhere other sections are hidden
js = js.replace(
    'document.getElementById("labSection").style.display = "none";',
    'document.getElementById("labSection").style.display = "none";\n            if(document.getElementById("labDetailsSection")) document.getElementById("labDetailsSection").style.display = "none";'
)

# 2. Add click handler for Lab Details menu
menu_logic = """
            else if(text.includes("lab details")){
                if(document.getElementById("labDetailsSection")) document.getElementById("labDetailsSection").style.display = "block";
                loadLabDetails();
            }"""

js = js.replace(
    'else if(text.includes("bookings")){',
    menu_logic + '\n            else if(text.includes("bookings")){'
)

# 3. Remove loadLabDetails() from loadLabs() click area (since it's now separate)
js = js.replace(
    'loadLabs();\n                loadLabDetails();',
    'loadLabs();'
)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated JS.")
