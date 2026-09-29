import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    important_fields = ['product_name', 'category', 'mrp', 'selling_price', 'stock_quantity', 'stock_status']
    
    # 1. Ensure labels have asterisks
    for field in important_fields:
        # Match label block associated with the field. 
        # This is a bit tricky, let's just find the label that precedes the input
        pattern = r'(<label[^>]*>)(.*?)(</label>)([\s\S]*?)(<(?:input|select|textarea)[^>]*id="' + field + '"[^>]*>)'
        match = re.search(pattern, form_html)
        if match:
            l_open = match.group(1)
            l_text = match.group(2)
            l_close = match.group(3)
            middle = match.group(4)
            input_tag = match.group(5)
            
            if '<span style="color:red;">*</span>' not in l_text:
                l_text += ' <span style="color:red;">*</span>'
            
            if 'required' not in input_tag:
                input_tag = input_tag.replace('>', ' required>')
            
            new_block = l_open + l_text + l_close + middle + input_tag
            form_html = form_html.replace(match.group(0), new_block)
            
    html = html.replace(m.group(1), form_html)
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Added required and asterisk to important product fields correctly!")
else:
    print("productForm not found")
