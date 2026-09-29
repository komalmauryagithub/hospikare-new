import re

with open('mdeq.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find supplierForm block
m = re.search(r'(<form id="supplierForm">[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    # We want to add name="X" to every input, select, textarea that has id="X"
    # Wait, some ids might be "edit_supplier_id" which is fine.
    # What about inputs that already have name? (There are none)
    
    def add_name(match):
        # match.group(0) is like <input type="text" id="shop_company_name" class="...">
        tag = match.group(0)
        id_match = re.search(r'id="([^"]+)"', tag)
        if id_match:
            id_val = id_match.group(1)
            # If name is not already in the tag
            if 'name="' not in tag:
                # insert name="id_val" right after id="id_val"
                tag = tag.replace(f'id="{id_val}"', f'id="{id_val}" name="{id_val}"')
        return tag

    new_form_html = re.sub(r'<(input|select|textarea)[^>]+>', add_name, form_html)
    
    html = html.replace(form_html, new_form_html)
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Patched names in mdeq.html supplierForm")
else:
    print("supplierForm not found")
