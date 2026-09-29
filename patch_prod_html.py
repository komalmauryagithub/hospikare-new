import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Find productForm block
m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    # 1. Add hidden edit_product_id
    if '<input type="hidden" id="edit_product_id" name="edit_product_id">' not in form_html:
        form_html = form_html.replace('<form id="productForm">', '<form id="productForm">\n<input type="hidden" id="edit_product_id" name="edit_product_id">')
    
    # 2. Add name attributes to all inputs inside it
    def add_name(match):
        tag = match.group(0)
        id_match = re.search(r'id="([^"]+)"', tag)
        if id_match:
            id_val = id_match.group(1)
            # ignore buttons or anything we don't want to submit, though it doesn't hurt much
            if 'name="' not in tag:
                tag = tag.replace(f'id="{id_val}"', f'id="{id_val}" name="{id_val}"')
        return tag

    new_form_html = re.sub(r'<(input|select|textarea)[^>]+>', add_name, form_html)
    
    html = html.replace(m.group(1), new_form_html)
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Patched names in mdeq.html productForm")
else:
    print("productForm not found")
