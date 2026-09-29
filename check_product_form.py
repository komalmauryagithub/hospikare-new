import re
html = open('mdeq.html', encoding='utf-8', errors='ignore').read()
m = re.search(r'(<form[^>]*id="productForm"[^>]*>[\s\S]*?</form>)', html)
if m:
    form_html = m.group(1)
    print("Ids:", re.findall(r'id="([^"]+)"', form_html))
    print("Names:", re.findall(r'name="([^"]+)"', form_html))
else:
    print("productForm not found")
