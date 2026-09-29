import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

labels_to_asterisk = ['Delivery Available', 'Delivery Charge', 'Thumbnail Image']

for label in labels_to_asterisk:
    search_str = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label}</label>'
    replace_str = f'<label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">{label} <span style="color:red;">*</span></label>'
    html = html.replace(search_str, replace_str)

# Also add 'required' to their respective inputs
m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    important_fields = ['delivery_available', 'delivery_charge', 'thumbnail_image']
    
    for field in important_fields:
        # Find the input/select for this field and add required
        pattern = r'(<(?:input|select)[^>]*id="' + field + '"[^>]*>)'
        match = re.search(pattern, form_html)
        if match:
            input_tag = match.group(1)
            if 'required' not in input_tag:
                new_input_tag = input_tag.replace('>', ' required>')
                form_html = form_html.replace(input_tag, new_input_tag)
                
    html = html.replace(m.group(1), form_html)

with open('mdeq.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Added missing asterisks and required to Delivery and Image")
