import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    
    # We want to find the label text and whether the input has 'required'
    # It's easier to just print the whole div blocks
    blocks = re.findall(r'(<div[^>]*>[\s]*<label[^>]*>.*?</label>[\s\S]*?<(?:input|select|textarea)[^>]*>)', form_html)
    for b in blocks:
        is_required = 'required' in b
        label_match = re.search(r'<label[^>]*>(.*?)</label>', b)
        label = label_match.group(1) if label_match else 'Unknown'
        print(f"{label}: {'REQUIRED' if is_required else 'OPTIONAL'}")
