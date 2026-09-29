import re

with open('routes_vendor_profile.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace all occurrences of equipment_source: 'equipment_sources' with equipment_source: 'equipment_suppliers'
js = re.sub(r"equipment_source:\s*'equipment_sources'", r"equipment_source: 'equipment_suppliers'", js)

with open('routes_vendor_profile.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("routes_vendor_profile.js updated tableMap for equipment_source.")
