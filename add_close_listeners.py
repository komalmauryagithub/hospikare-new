import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

close_listeners = """
document.getElementById('closeSupplierModal')?.addEventListener('click', () => {
    const modal = document.getElementById('addSupplierModal');
    if (modal) modal.style.display = 'none';
});

document.getElementById('closeViewSupplierModal')?.addEventListener('click', () => {
    const modal = document.getElementById('viewSupplierModal');
    if (modal) modal.style.display = 'none';
});
"""

if "document.getElementById('closeSupplierModal')" not in js:
    js += '\n' + close_listeners

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Added close listeners for supplier modals in mdeq.js")
