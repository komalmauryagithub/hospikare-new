import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update loadProducts HTML to add Actions column
if '<th>Status</th>\n                            <th>Actions</th>' not in js:
    js = js.replace('<th>Status</th>\n                        </tr>', '<th>Status</th>\n                            <th>Actions</th>\n                        </tr>')
    
# 2. Update loadProducts row HTML to add Edit/Delete buttons
if '<button onclick="editProduct(${product.product_id})"' not in js:
    search_str = """<td>
                            <span class="status-badge ${isInStock ? 'active' : 'cancelled'}">
                                <i class="fa-solid ${isInStock ? 'fa-check' : 'fa-xmark'}"></i>
                                ${product.stock_status || (isInStock ? 'In Stock' : 'Out of Stock')}
                            </span>
                        </td>
                    </tr>"""
    
    replace_str = """<td>
                            <span class="status-badge ${isInStock ? 'active' : 'cancelled'}">
                                <i class="fa-solid ${isInStock ? 'fa-check' : 'fa-xmark'}"></i>
                                ${product.stock_status || (isInStock ? 'In Stock' : 'Out of Stock')}
                            </span>
                        </td>
                        <td style="padding:16px;">
                            <button onclick="editProduct(${product.product_id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Product"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteProduct(${product.product_id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Product"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>"""
    
    js = js.replace(search_str, replace_str)


# 3. Replace productForm submit listener
# Find the exact listener:
m = re.search(r'document\.getElementById\(\s*"productForm"\s*\)\s*\.addEventListener\(\s*"submit"[\s\S]*?(?=\}\n\);)', js)
if m:
    old_listener = m.group(0) + '}\n);'
    
    new_listener = """document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = document.getElementById("edit_product_id").value;
    
    const url = editId ? '/api/edit/equipment-product/' + editId : '/api/add/equipment-product';
    
    try {
        const res = await fetch(url, { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
            alert(editId ? "Product updated successfully!" : "Product added successfully!");
            document.getElementById("productModal").style.display = "none";
            loadProducts();
        } else {
            alert("Error saving product!");
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred");
    }
});"""
    
    js = js.replace(old_listener, new_listener)

# 4. Add window.openAddProductModal, editProduct, and deleteProduct
new_functions = """
window.openAddProductModal = function() {
    document.getElementById("productForm").reset();
    document.getElementById("edit_product_id").value = "";
    document.getElementById("productModal").style.display = "flex";
};

window.editProduct = async function(id) {
    try {
        const res = await fetch('/api/equipment-products');
        const data = await res.json();
        if(data.success) {
            const product = data.products.find(p => p.product_id === id);
            if(product) {
                const form = document.getElementById("productForm");
                form.reset();
                document.getElementById("edit_product_id").value = product.product_id;
                
                const fields = [
                    "product_name", "brand_name", "category", "sub_category", "model_number", 
                    "manufacturer", "country_of_origin", "product_description", "mrp", 
                    "selling_price", "stock_quantity", "stock_status", "warranty_period", 
                    "delivery_available", "delivery_charge", "supplier_id"
                ];
                
                fields.forEach(f => {
                    if (form.elements[f]) form.elements[f].value = product[f] || "";
                });
                
                document.getElementById("productModal").style.display = "flex";
            }
        }
    } catch(e) {
        console.error(e);
    }
};

window.deleteProduct = async function(id) {
    if(!confirm('Are you sure you want to delete this product?')) return;
    try {
        const res = await fetch('/api/delete/equipment-product/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch(e) {
        console.error(e);
    }
};
"""

if 'window.editProduct = async function(id)' not in js:
    js += '\n' + new_functions


# 5. Fix "addProductBtn" listeners to reset the form.
# Since we added window.openAddProductModal(), we should just update the click listeners to use it.
js = js.replace('document.getElementById("productModal").style.display = "flex";', 'window.openAddProductModal();')
js = js.replace('document.getElementById(\n            "productModal"\n        ).style.display =\n            "flex";', 'window.openAddProductModal();')


with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched js/mdeq.js successfully!")
