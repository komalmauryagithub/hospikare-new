import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    # Find all divs containing a label and an input/select
    blocks = re.findall(r'<div[^>]*>[\s]*<label[^>]*>(.*?)</label>[\s\S]*?<(?:input|select|textarea)[^>]*>', form_html)
    for b in blocks:
        print(b)
