import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the infinite recursion
bad_function = """window.openAddProductModal = function() {
    document.getElementById("productForm").reset();
    document.getElementById("edit_product_id").value = "";
    window.openAddProductModal();
};"""

good_function = """window.openAddProductModal = function(isEdit = false) {
    if(!isEdit) {
        document.getElementById("productForm").reset();
        document.getElementById("edit_product_id").value = "";
        if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Add Product";
    } else {
        if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Edit Product";
    }
    document.getElementById("productModal").style.display = "flex";
};"""

js = js.replace(bad_function, good_function)

# Also editProduct was calling window.openAddProductModal() which would reset the form and clear the edit_product_id if we didn't pass isEdit!
# Wait, inside editProduct, we populate the form and THEN call openAddProductModal!
# So we need to pass `true` to `window.openAddProductModal(true)`
js = js.replace('window.openAddProductModal();\n            }\n        }\n    } catch(e) {', 'window.openAddProductModal(true);\n            }\n        }\n    } catch(e) {')

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed infinite recursion in mdeq.js")
