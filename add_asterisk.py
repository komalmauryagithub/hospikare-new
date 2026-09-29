import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    important_fields = ['product_name', 'category', 'mrp', 'selling_price', 'stock_quantity']
    
    # We will iterate through each important field's id and modify its block
    for field in important_fields:
        # Find the div containing the label and input for this field
        # We can look for <label ...>Label</label> followed by <input id="field" ...> or <select id="field" ...>
        block_pattern = r'(<div[^>]*>[\s]*<label[^>]*>)(.*?)(</label>[\s\S]*?<(?:input|select)[^>]*id="' + field + r'"[^>]*>)'
        match = re.search(block_pattern, form_html)
        if match:
            start_label = match.group(1)
            label_text = match.group(2)
            rest_of_block = match.group(3)
            
            # Add asterisk if not there
            if '<span style="color:red;">*</span>' not in label_text:
                label_text += ' <span style="color:red;">*</span>'
            
            # Add required to input if not there
            if 'required' not in rest_of_block:
                # insert required before >
                rest_of_block = rest_of_block.replace('>', ' required>', 1)
                
            new_block = start_label + label_text + rest_of_block
            form_html = form_html.replace(match.group(0), new_block)
            
    html = html.replace(m.group(1), form_html)
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Added required and asterisk to important product fields!")
else:
    print("productForm not found")
