import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

m = re.search(r'(<form id="supplierForm">[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    def add_name(match):
        tag = match.group(0)
        id_match = re.search(r'id="([^"]+)"', tag)
        if id_match:
            id_val = id_match.group(1)
            if 'name="' not in tag:
                tag = tag.replace(f'id="{id_val}"', f'id="{id_val}" name="{id_val}"')
        return tag

    new_form_html = re.sub(r'<(input|select|textarea)[^>]+>', add_name, form_html)
    
    html = html.replace(form_html, new_form_html)
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Patched names in mdeq.html supplierForm")
else:
    print("supplierForm not found")
