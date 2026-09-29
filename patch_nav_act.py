import re

with open('users.html', 'r', encoding='utf-8') as f:
    users_content = f.read()

# Extract the <nav class="navbar" id="navbar">...</nav> from users.html
nav_pattern = r'<nav class="navbar" id="navbar">[\s\S]*?</nav>'
nav_match = re.search(nav_pattern, users_content)

if nav_match:
    nav_html = nav_match.group(0)
    
    # Prefix anchor links with users.html
    nav_html = nav_html.replace('href="#heroSection"', 'href="users.html#heroSection"')
    nav_html = nav_html.replace('href="#featuredHospitalSection"', 'href="users.html#featuredHospitalSection"')
    nav_html = nav_html.replace('href="#ambulanceSection"', 'href="users.html#ambulanceSection"')
    nav_html = nav_html.replace('href="#medicineSection"', 'href="users.html#medicineSection"')
    nav_html = nav_html.replace('href="#insuranceSection"', 'href="users.html#insuranceSection"')
    nav_html = nav_html.replace('href="#insuranceClaimsSection"', 'href="users.html#insuranceClaimsSection"')
    nav_html = nav_html.replace('href="#labsSection"', 'href="users.html#labsSection"')
    nav_html = nav_html.replace('href="#equipmentSection"', 'href="users.html#equipmentSection"')
    
    # Remove the style override on My Orders if it exists inline
    nav_html = re.sub(r'<a href="act\.html"[^>]*>My Orders</a>', '<a href="act.html">My Orders</a>', nav_html)
    
    # Replace in users.html
    users_content = re.sub(nav_pattern, nav_html, users_content)
    with open('users.html', 'w', encoding='utf-8') as f:
        f.write(users_content)
        
    # Now replace act.html navbar
    with open('act.html', 'r', encoding='utf-8') as f:
        act_content = f.read()
        
    act_nav_pattern = r'<nav class="act-navbar" id="navbar">[\s\S]*?</nav>'
    act_content = re.sub(act_nav_pattern, nav_html, act_content)
    
    with open('act.html', 'w', encoding='utf-8') as f:
        f.write(act_content)
        
    print("Navbar replaced in both files!")
else:
    print("Could not find navbar in users.html")
