import re

with open('hsp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hospital_name label and input
content = content.replace(
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Name</label>',
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Name <span style="color:red;">*</span></label>'
)
content = content.replace(
    '<input type="text" id="hospital_name" placeholder="Enter hospital name" class="top-search" style="border-radius: var(--rounded-sm);">',
    '<input type="text" id="hospital_name" placeholder="Enter hospital name" class="top-search" style="border-radius: var(--rounded-sm);" required>'
)

# Hospital Type and Ownership already have required, let's add * to label
content = content.replace(
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Type</label>',
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Type <span style="color:red;">*</span></label>'
)
content = content.replace(
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Ownership</label>',
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Hospital Ownership <span style="color:red;">*</span></label>'
)

# Address
content = content.replace(
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address</label>',
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Address <span style="color:red;">*</span></label>'
)
content = content.replace(
    '<input type="text" id="hospital_address" placeholder="Enter full address" class="top-search" style="border-radius: var(--rounded-sm);">',
    '<input type="text" id="hospital_address" placeholder="Enter full address" class="top-search" style="border-radius: var(--rounded-sm);" required>'
)

# Facilities
content = content.replace(
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Facilities</label>',
    '<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Facilities <span style="color:red;">*</span></label>'
)
content = content.replace(
    '<input type="text" id="hospital_facilities" placeholder="e.g. 24x7 Pharmacy, ICU, ER" class="top-search" style="border-radius: var(--rounded-sm);">',
    '<input type="text" id="hospital_facilities" placeholder="e.g. 24x7 Pharmacy, ICU, ER" class="top-search" style="border-radius: var(--rounded-sm);" required>'
)

with open('hsp.html', 'w', encoding='utf-8') as f:
    f.write(content)
