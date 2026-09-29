import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add title reset to openAddProductModal
js = js.replace(
    'document.getElementById("productModal").style.display = "flex";',
    'if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Add Product";\n    document.getElementById("productModal").style.display = "flex";',
    1 # only replace the first occurrence which is in window.openAddProductModal
)

# Add title set to editProduct
js = js.replace(
    'document.getElementById("productModal").style.display = "flex";',
    'if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Edit Product";\n                document.getElementById("productModal").style.display = "flex";',
    1 # next occurrence is in window.editProduct
)

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched modal titles")
