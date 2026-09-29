const equipmentDashboardUi = window.createVendorDashboardUi
    ? window.createVendorDashboardUi({
        reload: () => reloadCurrentEquipmentPanel()
    })
    : null;

function setupEquipmentDashboardLinks(root = document) {
    if (equipmentDashboardUi) {
        equipmentDashboardUi.setupLinks(root);
    }
}

function filterEquipmentRecords(records, dateFields) {
    return equipmentDashboardUi
        ? equipmentDashboardUi.filterRecords(records, dateFields)
        : (Array.isArray(records) ? records : []);
}

function reapplyVendorSearch() {
    window.applyVendorTopSearch?.();
}

function reloadCurrentEquipmentPanel() {
    const activeText =
        document.querySelector(".menuItem.active")?.innerText
            ?.toLowerCase()
        || "dashboard";

    if (activeText.includes("products")) {
        loadProducts();
    }
    else if (activeText.includes("orders")) {
        loadEquipmentOrders();
    }
    else if (activeText.includes("customer")) {
        loadCustomers();
    }
    else if (activeText.includes("payments")) {
        loadVendorPayments();
    }
    else {
        loadDashboard();
    }
}

document.addEventListener("click", (e) => {

    if(e.target.closest("#addProductBtn")){

        document.getElementById(
            "productModal"
        ).style.display = "flex";

    }

});

async function fillProfileForm(profile, details = {}) {
    if (!profile) return;
    const nameField = document.getElementById("profileName");
    const emailField = document.getElementById("profileEmail");
    const userTypeField = document.getElementById("profileUserType");
    const bankField = document.getElementById("profileBank");
    const ifscField = document.getElementById("profileIfsc");

    if (nameField) nameField.value = profile.name || "";
    if (emailField) emailField.value = profile.emailorcontact || "";
    if (userTypeField && profile.users_type) userTypeField.value = profile.users_type;
    if (bankField) bankField.value = profile.bank_account || "";
    if (ifscField) ifscField.value = profile.ifsc || "";

    if (details) {
        for (const [key, value] of Object.entries(details)) {
            const input = document.querySelector('#vendorProfileForm [name="' + key + '"]');
            if (input && input.type !== 'file') {
                input.value = value || "";
            }
        }
    }
}




let currentVendorName = "Vendor";

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await response.json();
        if(result.success){
            const vendorName = result.user?.name || result.details?.vendor_name || result.details?.equipment_name || "Vendor";
            const profilePhotoUrl = result.user?.profile_photo ? `/uploads/${result.user.profile_photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(vendorName)}&background=0284c7&color=fff`;
            const avatarImg = document.getElementById('navbarProfileAvatar');
            if (avatarImg) avatarImg.src = profilePhotoUrl;
            
            currentVendorName = vendorName;
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = `Welcome ${vendorName}`;
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });
            fillProfileForm(result.user, result.details || {});
            const isComplete = Number(result.user?.vendor_profile_completed) === 1;
            const triggerText = document.getElementById('profileTriggerText');
            const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }
            if (triggerIcon) {
                triggerIcon.className = isComplete ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                triggerIcon.style.color = isComplete ? '#10b981' : '#3b82f6';
            }
            if(window.setProfileMode) {
                window.setProfileMode(isComplete ? 'view' : 'edit');
            }
        }
        else{
            window.location.href = "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const profileSectionTrigger = document.getElementById("profileSectionTrigger");
if (profileSectionTrigger) {
    profileSectionTrigger.addEventListener("click", (event) => {
        if (event.target.closest("#logoutBtn")) return;
        openProfileModal();
    });
}
document.getElementById("closeProfileModal")?.addEventListener("click", closeProfileModal);
document.getElementById("cancelProfileEdit")?.addEventListener("click", closeProfileModal);

loadUserProfile();
equipmentDashboardUi?.setupDateFilter();
window.setupVendorTopSearch?.();
loadDashboard();

const defaultNav = document.querySelector(".menuItem.active");

if(defaultNav){
    // Do nothing as the active class is already in HTML
}

const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn){
    logoutBtn.addEventListener("click", logout);
}

async function logout(event){
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try{
        const response = await fetch('/api/user/logout', { method:'POST', credentials: 'include' });
        const result = await response.json();
        if(result.success){
            window.location.href = "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const navItems = document.querySelectorAll(".menuItem");

navItems.forEach(item => {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });
        item.classList.add("active");

        const text = item.innerText.toLowerCase();

        if(text.includes("dashboard")){
            loadDashboard();
        }
        else if(text.includes("supplier")){
            loadSuppliers();
        }
        else if(text.includes("products")){
            loadProducts();
        }
        else if(text.includes("orders")){
            loadEquipmentOrders();
        }
        else if(text.includes("customer")){
            loadCustomers();
        }
        else if(text.includes("payments")){
            loadVendorPayments();
        }
    });

    item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            item.click();
        }
    });
});



document.getElementById(
    "addProductBtn"
).addEventListener(
    "click",
    () => {
        window.openAddProductModal();
    }
);

document.getElementById(
    "closeProductModal"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "productModal"
        ).style.display =
            "none";
    }
);

document.getElementById("productForm").addEventListener("submit", async (e) => {
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
});

async function loadProducts() {
    try {
        const response = await fetch('/api/equipment-products');
        const result = await response.json();

        let html = `
        <div id="productsSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Equipment Catalog</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage and monitor your medical devices, machinery, and inventory status</p>
                </div>

                <button id="addProductBtn" class="add-btn">
                    <i class="fa-solid fa-plus"></i>
                    Add Product
                </button>
            </div>

            <div class="table-wrapper">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (result.success) {
            const products = filterEquipmentRecords(
                result.products,
                ["created_at"]
            );

            if (products.length > 0) {
                products.forEach(product => {
                    const isInStock = (product.stock_status || '').toLowerCase().includes('in stock') || product.stock_quantity > 0;
                    html += `
                    <tr>
                        <td style="font-weight:600; color:var(--hk-primary-blue);">#${product.product_id}</td>

                        <td>
                            <img
                                src="/uploads/${product.thumbnail_image}"
                                class="productImage"
                                style="width:48px;height:48px;border-radius:10px;object-fit:cover;border:1px solid var(--hk-border);"
                                onerror="this.src='/assets/placeholder.png'"
                            >
                        </td>

                        <td style="font-weight:600; color:var(--hk-text-main);">
                            ${product.product_name}
                        </td>

                        <td><span style="font-weight:500; color:var(--hk-text-muted);">${product.category || '-'}</span></td>

                        <td>${product.brand_name || '-'}</td>

                        <td style="font-weight:700; color:var(--hk-text-main);">
                            ₹${Number(product.selling_price || 0).toLocaleString()}
                        </td>

                        <td style="font-weight:600;">${product.stock_quantity || 0} Units</td>

                        <td>
                            <span class="status-badge ${isInStock ? 'active' : 'cancelled'}">
                                <i class="fa-solid ${isInStock ? 'fa-check' : 'fa-xmark'}"></i>
                                ${product.stock_status || (isInStock ? 'In Stock' : 'Out of Stock')}
                            </span>
                        </td>
                        <td style="padding:16px;">
                            <button onclick="editProduct(${product.product_id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Product"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteProduct(${product.product_id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Product"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                    `;
                });
            } else {
                html += `
                <tr>
                    <td colspan="8" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-boxes-stacked"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Products Listed</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Click "Add Product" above to list your first medical device or equipment item.</p>
                        </div>
                    </td>
                </tr>
                `;
            }
        } else {
            html += `
            <tr>
                <td colspan="8" style="text-align:center; padding:56px 24px;">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                        <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </div>
                        <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Products Listed</h4>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Click "Add Product" above to list your first medical device or equipment item.</p>
                    </div>
                </td>
            </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;

        document.getElementById("mainContent").innerHTML = html;

        const addBtn = document.getElementById("addProductBtn");

        if (addBtn) {
            addBtn.addEventListener("click", () => {
                window.openAddProductModal();
            });
        }

        reapplyVendorSearch();

    } catch (error) {
        console.log(error);
    }
}

window.updateOrderStatus = async function(id, type, orderStatus, prescriptionStatus) {
    try {
        const body = { order_id: id, type: type };
        if (orderStatus) body.order_status = orderStatus;
        if (prescriptionStatus) body.prescription_status = prescriptionStatus;

        const response = await fetch('/api/vendor/order/status', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        const result = await response.json();
        if (result.success) {
            alert('Status updated successfully');
            if(typeof loadEquipmentOrders === 'function') loadEquipmentOrders();
        } else {
            alert('Failed to update status');
        }
    } catch(e) {
        console.error(e);
        alert('An error occurred');
    }
};

async function loadEquipmentOrders(){
    try{
        const response = await fetch('/api/equipment/orders');
        const result = await response.json();

        let html = `
        <div id="ordersSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Equipment Orders</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">View and manage medical equipment rentals and purchases</p>
                </div>
            </div>
            <div class="table-wrapper" style="overflow-x:auto;">
                <table id="ordersTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Products</th>
                            <th>Total</th>
                            <th>Order Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(result.success){
            const orders = result.orders;
            if(orders.length > 0){
                orders.forEach(order => {
                    let prodStr = '';
                    if(order.products && Array.isArray(order.products)) {
                        prodStr = order.products.map(p => `${p.name} (x${p.qty})`).join('<br>');
                    } else if (typeof order.products === 'string') {
                        try {
                            const pArr = JSON.parse(order.products);
                            prodStr = pArr.map(p => `${p.name} (x${p.qty})`).join('<br>');
                        } catch(e){}
                    }

                    const statuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'PACKED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'];
                    let statusSelect = `<select id="status_${order.id}" style="padding:4px; border-radius:4px; border:1px solid #ddd;">`;
                    statuses.forEach(s => {
                        const sel = ((order.order_status || "").toUpperCase() === s.toUpperCase()) ? 'selected' : '';
                        statusSelect += `<option value="${s}" ${sel}>${s}</option>`;
                    });
                    statusSelect += `</select>`;

                    let actionHtml = `<button onclick="updateOrderStatus(${order.id}, 'equipment', document.getElementById('status_${order.id}').value, null)" style="padding:5px 10px; border-radius:6px; background:var(--brand-primary); color:#fff; border:none; cursor:pointer;">Update Status</button>`;

                    html += `
                    <tr>
                        <td style="font-weight:600; color:var(--hk-primary-blue);">#${order.id}</td>
                        <td>
                            <div style="font-weight:600;">${order.full_name}</div>
                            <div style="font-size:12px; color:#666;">${order.phone}</div>
                            <div style="font-size:11px; color:#888;">${order.delivery_address}</div>
                        </td>
                        <td style="font-size:13px;">${prodStr}</td>
                        <td style="font-weight:700; color:var(--hk-text-main);">Rs. ${order.total_amount}</td>
                        <td>${statusSelect}</td>
                        <td><span class="status-badge ${order.payment_status==='paid'?'active':'cancelled'}">${order.payment_status}</span></td>
                        <td>${actionHtml}</td>
                    </tr>
                    `;
                });
            } else {
                html += `<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>`;
            }
        } else {
            html += `<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>
        </div>`;

document.getElementById("mainContent").style.display = "block"; document.getElementById("mainContent").innerHTML = html;
        
    } catch(err) {
        console.error(err);
    }
}

async function loadCustomers(){
    try{
        const response = await fetch('/api/equipment/customers');
        const result = await response.json();

        let html = `
        <div id="customersSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Registered Customers</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage buyer contacts, order history, and relationship logs</p>
                </div>
            </div>

            <div class="table-wrapper">
                <table id="customersTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Photo</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(result.success){
            const customers =
                filterEquipmentRecords(
                    result.customers,
                    ["last_order_at", "created_at"]
                );

            if(customers.length > 0){
                customers.forEach(customer => {
                html += `
                <tr>
                    <td style="font-weight:600; color:var(--hk-primary-blue);">#${customer.id}</td>
                    <td><img src="/uploads/${customer.profile_photo}" class="customerImage" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--hk-border);" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name || 'User')}&background=2864f0&color=fff'"></td>
                    <td style="font-weight:600; color:var(--hk-text-main);">${customer.full_name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.gender || '-'}</td>
                    <td>${customer.city || '-'}</td>
                    <td>${customer.state || '-'}</td>
                    <td><span class="status-badge active"><i class="fa-solid fa-bag-shopping"></i> ${customer.total_orders} Orders</span></td>
                    <td style="font-weight:700; color:var(--hk-text-main);">₹${Number(customer.total_spent || 0).toLocaleString()}</td>
                </tr>
                `;
                });
            }
            else{
                html += `
                <tr>
                    <td colspan="10" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-users"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Customers Found</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Customers who purchase or enquire about your products will appear here.</p>
                        </div>
                    </td>
                </tr>
                `;
            }
        }
        else{
            html += `
            <tr>
                <td colspan="10" style="text-align:center; padding:56px 24px;">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                        <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Customers Found</h4>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Customers who purchase or enquire about your products will appear here.</p>
                    </div>
                </td>
            </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;

        document.getElementById("mainContent").innerHTML = html;
        reapplyVendorSearch();
    }
    catch(error){
        console.log(error);
    }
}

async function loadVendorPayments(){
    try{
        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: var(--hk-text-main, #1e293b); font-weight: 700;">User Payments</h2>
                <p style="font-size: 13px; color: var(--hk-text-muted, #64748b); margin-top: 4px;">Payments received from users</p>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User Name</th>
                            <th>Total Amount</th>
                            <th>Paid Amount</th>
                            <th>Balance</th>
                            <th>Payment Status</th>
                        </tr>
                    </thead>
                    <tbody id="orderPaymentsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const orderRes = await fetch('/api/equipment/orders');
        const orderResult = await orderRes.json();
        const orderTbody = document.getElementById("orderPaymentsTableBody");

        if(orderResult.success && orderResult.orders && orderResult.orders.length > 0) {
            const orders = filterEquipmentRecords(orderResult.orders, ["created_at", "order_date"]);
            if(orders.length === 0){
                orderTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No User Payments Found</td></tr>`;
            } else {
                orders.forEach(order => {
                    const totalAmt = parseFloat(order.total_amount || order.total_price || 0);
                    const paidAmt = parseFloat(order.paid_amount || totalAmt);
                    const isPart = order.payment_type === 'Part';
                    const balance = isPart ? Math.max(0, totalAmt - paidAmt) : 0;
                    let paymentBadge = isPart
                        ? `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#fff7ed; color:#ea580c;">Part Payment</span>`
                        : `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#f0fdf4; color:#16a34a;">Full Payment</span>`;
                    orderTbody.innerHTML += `
                    <tr>
                        <td>${order.id}</td>
                        <td><span style="font-weight:600;">${order.customer_name || order.user_name || '-'}</span></td>
                        <td><span style="font-weight:600;">&#8377;${totalAmt}</span></td>
                        <td><span style="font-weight:600; color:#16a34a;">&#8377;${paidAmt}</span></td>
                        <td><span style="font-weight:600; color:#dc2626;">&#8377;${balance}</span></td>
                        <td>${paymentBadge}</td>
                    </tr>
                    `;
                });
            }
        } else {
            orderTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No User Payments Found</td></tr>`;
        }


    // --- Vendor Payouts Section ---
    let vendorPayoutsHtml = `
        <div style="margin-top: 40px; margin-bottom: 25px;">
            <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">Vendor Payouts</h2>
            <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Payouts received from admin</p>
        </div>
        <div class="table-container">
            <table class="adminTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Razorpay Payment ID</th>
                        <th>Status</th>
                        <th>Paid At</th>
                    </tr>
                </thead>
                <tbody id="vendorPayoutsTableBody">
                </tbody>
            </table>
        </div>
    `;
    mainContent.insertAdjacentHTML('beforeend', vendorPayoutsHtml);

    try {
        const payoutsRes = await fetch('/api/vendor/payments');
        const payoutsResult = await payoutsRes.json();
        const payoutsTbody = document.getElementById("vendorPayoutsTableBody");
        if (payoutsResult.success && payoutsResult.payments && payoutsResult.payments.length > 0) {
            const payouts = filterEquipmentRecords(payoutsResult.payments, ["paid_at", "created_at"]);
            if (payouts.length === 0) {
                payoutsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No Vendor Payouts Found</td></tr>`;
            } else {
                payouts.forEach(p => {
                    const statusColor = (p.payout_status || '').toLowerCase() === 'paid' ? '#16a34a' : '#ea580c';
                    const statusBg = (p.payout_status || '').toLowerCase() === 'paid' ? '#f0fdf4' : '#fff7ed';
                    payoutsTbody.innerHTML += `
                    <tr>
                        <td>#${p.id}</td>
                        <td style="font-weight:700;">&#8377;${Number(p.amount || 0).toLocaleString()}</td>
                        <td style="font-family:monospace; font-size:12px; color:#64748b;">${p.razorpay_payment_id || 'N/A'}</td>
                        <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:${statusBg}; color:${statusColor};">${p.payout_status || 'pending'}</span></td>
                        <td>${p.paid_at ? new Date(p.paid_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                    `;
                });
            }
        } else {
            payoutsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No Vendor Payouts Found</td></tr>`;
        }
    } catch(e) { console.log('Vendor payouts error:', e); }

        reapplyVendorSearch();
    }
    catch(error){
        console.log(error);
    }
}
async function loadDashboard(){
    try{
        const queryString =
            equipmentDashboardUi?.getQueryString() || "";
        const response =
            await fetch(`/api/vendor/mdeqdashboard${queryString}`);
        const result = await response.json();

        if(!result.success){
            return;
        }

        const data = result.dashboard;
        let recentOrders = '';

        if(data.recentOrders.length > 0){
            data.recentOrders.forEach(order=>{
                recentOrders += `
                <tr>
                    <td>#ORD${order.id}</td>
                    <td>₹${order.total_amount}</td>
                    <td><span class="status-badge status-active">${order.order_status}</span></td>
                </tr>
                `;
            });
        }
        else{
            recentOrders = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">No Orders</td>
            </tr>
            `;
        }

        let recentPayments = '';

        if(data.recentPayments.length > 0){
            data.recentPayments.forEach(payment=>{
                recentPayments += `
                <tr>
                    <td>₹${payment.amount}</td>
                    <td><span class="status-badge status-active">${payment.payment_status}</span></td>
                    <td>${new Date(payment.paid_at).toLocaleDateString()}</td>
                </tr>
                `;
            });
        }
        else {
            recentPayments = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);">No Payments</td>
            </tr>
            `;
        }

        const html = `
        <div id="dashboardSection">

            <!-- HEALTHCARE COMMAND CENTRE HERO BANNER -->
            <div class="hero-welcome-card">
                <div class="hero-text-content">
                    <h2>Welcome, <span class="vendor-display-name">${escapeHtml(currentVendorName)}</span> <i class="fa-solid fa-circle-check" style="color: #18B981; font-size: 18px;"></i></h2>
                    <p>Here’s what’s happening with your medical machinery orders and equipment rentals today.</p>
                </div>
                <div class="hero-quick-actions">
                    <button class="hero-btn" id="heroAddProductBtn" onclick="document.getElementById('productsBtn').click(); document.getElementById('addProductBtn')?.click();"><i class="fa-solid fa-plus"></i> Add Equipment</button>
                    <button class="hero-btn" id="heroOrdersBtn" onclick="document.getElementById('ordersBtn').click();"><i class="fa-solid fa-box"></i> View Orders</button>
                </div>
            </div>

            <!-- BENTO KPI METRIC GRID -->
            <div id="dashboardCards" class="grid-container" style="margin-bottom: 24px;">
                <div class="dashCard featured-card dashboard-link" data-dashboard-target="paymentsBtn">
                    <div class="card-icon icon-green"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Sales</h3>
                            <span class="trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +21.5%</span>
                        </div>
                        <h1>₹${Number(data.totalRevenue).toLocaleString()}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill green" style="width: 84%;"></div></div>
                            <div class="card-progress-info"><span>Monthly Target: ₹3,00,000</span><span class="target-val">84% Achieved</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="ordersBtn">
                    <div class="card-icon icon-purple"><i class="fa-solid fa-box"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Orders</h3>
                            <span class="trend positive"><i class="fa-solid fa-check"></i> Active</span>
                        </div>
                        <h1>${data.totalOrders}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill purple" style="width: 70%;"></div></div>
                            <div class="card-progress-info"><span>Target: 120 Orders</span><span class="target-val">70% Target</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="productsBtn">
                    <div class="card-icon icon-blue"><i class="fa-solid fa-boxes-stacked"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Products</h3>
                            <span class="trend positive">Catalog</span>
                        </div>
                        <h1>${data.totalProducts}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill" style="width: 88%;"></div></div>
                            <div class="card-progress-info"><span>Medical Devices</span><span class="target-val">Available</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="productsBtn">
                    <div class="card-icon icon-orange"><i class="fa-solid fa-cubes"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Stock</h3>
                            <span class="trend positive">Units Ready</span>
                        </div>
                        <h1>${data.totalStock}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill orange" style="width: 78%;"></div></div>
                            <div class="card-progress-info"><span>Warehouse Units</span><span class="target-val">In Stock</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CHARTS SECTION -->
            <div id="chartsGrid">
                <div class="chartWrapper dashboard-link dashboard-clickable-panel" data-dashboard-target="ordersBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Equipment Sales Trend</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Revenue across devices and surgical equipment</p>
                            </div>
                        </div>
                        <span class="status-badge" style="background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); font-size: 12px; font-weight: 700;">₹ Sales Stream</span>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%;">
                        <canvas id="salesLineChart"></canvas>
                    </div>
                </div>

                <div class="chartWrapper dashboard-link dashboard-clickable-panel" data-dashboard-target="productsBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(25, 191, 211, 0.1); color: var(--hk-cyan); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-pie"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Stock Distribution</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Apparatus & spares</p>
                            </div>
                        </div>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%; display: flex; align-items: center; justify-content: center;">
                        <canvas id="stockPieChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- RECENT ACTIVITY SECTION -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="table-wrapper dashboard-link dashboard-clickable-panel" data-dashboard-target="ordersBtn" style="margin: 0;">
                    <div class="table-header">
                        <h3>Recent Orders</h3>
                    </div>
                    <div class="table-container" style="border:none; box-shadow:none; margin:0;">
                        <table class="adminTable">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentOrders}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="table-wrapper dashboard-link dashboard-clickable-panel" data-dashboard-target="paymentsBtn" style="margin: 0;">
                    <div class="table-header">
                        <h3>Recent Payments</h3>
                    </div>
                    <div class="table-container" style="border:none; box-shadow:none; margin:0;">
                        <table class="adminTable">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentPayments}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.getElementById("mainContent").innerHTML = html;
        setupEquipmentDashboardLinks(
            document.getElementById("dashboardSection")
        );
        if (window.mdeqSalesChartInstance) {
            window.mdeqSalesChartInstance.destroy();
            window.mdeqSalesChartInstance = null;
        }
        if (window.mdeqStockChartInstance) {
            window.mdeqStockChartInstance.destroy();
            window.mdeqStockChartInstance = null;
        }

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#94A3B8" : "#64748B";
        const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";
        const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

        const ctxLine = document.getElementById('salesLineChart');
        if (ctxLine) {
            const chartCtx = ctxLine.getContext('2d');
            let grad = chartCtx.createLinearGradient(0, 0, 0, 260);
            grad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.18)');
            grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

            window.mdeqSalesChartInstance = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Sales (₹)',
                        data: [15000, 28000, 22000, 35000, 42000, data.totalRevenue || 38000],
                        borderColor: '#2563EB',
                        backgroundColor: grad,
                        borderWidth: 2.5,
                        tension: 0.38,
                        fill: true,
                        pointBackgroundColor: '#2563EB',
                        pointBorderColor: surfaceColor,
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 1100, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: isDark ? '#0F172A' : '#172033',
                            titleColor: '#FFFFFF',
                            bodyColor: '#E2E8F0',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10,
                            callbacks: {
                                label: ctx => ` Sales: ₹${Number(ctx.parsed.y).toLocaleString('en-IN')}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                font: { size: 11, weight: '600' },
                                callback: val => val >= 100000 ? '₹' + (val / 100000).toFixed(1) + 'L' : val >= 1000 ? '₹' + (val / 1000) + 'k' : '₹' + val
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { size: 12, weight: '600' } }
                        }
                    }
                }
            });
        }

        const ctxPie = document.getElementById('stockPieChart');
        if (ctxPie) {
            window.mdeqStockChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['Surgical & OT', 'Diagnostic Devices', 'Patient Monitoring', 'ICU Equipment'],
                    datasets: [{
                        data: [35, 25, 30, 10],
                        backgroundColor: ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B'],
                        borderWidth: 3,
                        borderColor: surfaceColor,
                        hoverBorderColor: surfaceColor,
                        hoverBorderWidth: 4,
                        hoverOffset: 8,
                        borderRadius: 6,
                        spacing: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1100,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                padding: 12,
                                color: textColor,
                                font: { size: 11, weight: '600' }
                            }
                        },
                        tooltip: {
                            backgroundColor: isDark ? '#0F172A' : '#172033',
                            titleColor: '#FFFFFF',
                            bodyColor: '#CBD5E1',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 10
                        }
                    }
                }
            });
        }
    }
    catch(error){
        console.log(error);
    }
}

// Re-render medical equipment charts on theme toggle
window.addEventListener("hk-theme-change", () => {
    const dashSec = document.getElementById("dashboardSection");
    if (dashSec && dashSec.style.display !== "none") {
        loadDashboard();
    }
});






// ====== NEW PROFILE FLOW LOGIC ======
async function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const form = document.getElementById('vendorProfileForm');
    const actionButtons = document.getElementById('profileModalActionButtons');
    if (!form) return;
    
    try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await res.json();
        if (result.success && result.user) {
            const user = result.user;
            
            // Populate fields if they exist
            if (form.elements['company_name']) form.elements['company_name'].value = user.company_name || '';
            if (form.elements['name']) form.elements['name'].value = user.name || '';
            if (form.elements['business_reg_number']) form.elements['business_reg_number'].value = user.business_reg_number || '';
            if (form.elements['contact_number']) form.elements['contact_number'].value = user.contact_number || user.emailorcontact || '';
            if (form.elements['email']) form.elements['email'].value = user.email || (user.emailorcontact && user.emailorcontact.includes('@') ? user.emailorcontact : '');
            if (form.elements['service_area']) form.elements['service_area'].value = user.service_area || '';
            if (form.elements['service_24x7']) form.elements['service_24x7'].value = user.service_24x7 || 'Yes';
            if (form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';
            
            const allInputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
            const isCompleted = Number(user.vendor_profile_completed) === 1;
            const isEditAllowed = Number(user.edit_allowed) === 1;
            const isEditRequested = Number(user.edit_requested) === 1;
            
            if (!isCompleted || isEditAllowed) {
                allInputs.forEach(inp => { inp.disabled = false; inp.style.backgroundColor = ''; });
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                        <button type="submit" id="saveProfileBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Profile</button>
                    `;
                }
            } else {
                allInputs.forEach(inp => { inp.disabled = true; inp.style.backgroundColor = '#f1f5f9'; });
                if (actionButtons) {
                    if (!isEditRequested) {
                        actionButtons.innerHTML = `
                            <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                            <button type="button" id="reqAdminBtn" style="padding:10px 18px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Request Admin Edit</button>
                        `;
                        document.getElementById('reqAdminBtn').onclick = async () => {
                            try {
                                // Request edit on user profile (vendor)
                                const r = await fetch('/api/vendor/request-profile-edit/user/' + user.id, {method:'POST'});
                                const rD = await r.json();
                                if(rD.success) {
                                    alert('Request sent to admin!');
                                    openProfileModal();
                                } else {
                                    alert(rD.message);
                                }
                            } catch(e) {}
                        };
                    } else {
                        actionButtons.innerHTML = `
                            <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                            <button type="button" disabled style="padding:10px 18px; border:none; background:#94a3b8; color:#fff; border-radius:10px; cursor:not-allowed; font-weight:600;">Edit Requested...</button>
                        `;
                    }
                }
            }
        }
    } catch(err) { console.error(err); }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}

document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    
    const formData = new FormData(form);
    
    const submitBtn = document.getElementById('saveProfileBtn');
    const origText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
        const response = await fetch('/api/user/profile', { 
            method: 'PUT', 
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            alert('Vendor Profile saved successfully!');
            closeProfileModal();
            await loadUserProfile();
        } else {
            alert(result.message || 'Profile save failed');
        }
    } catch (e) {
        alert('An error occurred while saving.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText || 'Save Profile';
        }
    }
});
// ===================================



// ==================== SUPPLIERS LOGIC ====================

window.openAddSupplierModal = function() {
    document.getElementById('supplierForm').reset();
    document.getElementById('edit_supplier_id').value = '';
    const modal = document.getElementById('addSupplierModal');
    if (modal) {
        const title = modal.querySelector('h2');
        if (title) title.innerText = 'Add Equipment Supplier';
        modal.style.display = 'flex';
    }
};

window.loadSuppliers = async function() {
    const html = `
        <div id="suppliersSection">
            <div class="topBar" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                <button onclick="openAddSupplierModal()" style="padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-plus"></i>
                    Add Supplier
                </button>
            </div>
            <div class="tableContainer" style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <table id="suppliersTable" style="width:100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                            <th style="padding: 16px; font-weight: 600; color: #475569;">ID</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Logo</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Company</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Supplier Name</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Type</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Contact</th>
                            <th style="padding: 16px; font-weight: 600; color: #475569;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="suppliersTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById("mainContent").innerHTML = html;
    
    try {
        const res = await fetch('/api/equipment-suppliers');
        const data = await res.json();
        if(data.success) {
            const tbody = document.getElementById('suppliersTableBody');
            tbody.innerHTML = '';
            
            // Also populate the supplier dropdown in the add product modal if it exists
            const supplierSelect = document.getElementById('supplier_id');
            if (supplierSelect) {
                supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
            }

            data.suppliers.forEach(sup => {
                if (supplierSelect) {
                    supplierSelect.innerHTML += `<option value="${sup.id}">${sup.shop_company_name || sup.supplier_name}</option>`;
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #e2e8f0';
                
                const logo = sup.supplier_logo ? `<img src="/uploads/${sup.supplier_logo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">` : `<div style="width:40px; height:40px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-building"></i></div>`;
                
                tr.innerHTML = `
                    <td style="padding:16px;">#${sup.id}</td>
                    <td style="padding:16px;">${logo}</td>
                    <td style="padding:16px; font-weight:600;">${sup.shop_company_name || '-'}</td>
                    <td style="padding:16px;">${sup.supplier_name || '-'}</td>
                    <td style="padding:16px;">${sup.supplier_type || '-'}</td>
                    <td style="padding:16px;">${sup.mobile_number || '-'}</td>
                    <td style="padding:16px;">
                        <button onclick="editSupplier(${sup.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteSupplier(${sup.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(e) {
        console.error(e);
    }
};

document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const editId = document.getElementById('edit_supplier_id').value;
    
    const url = editId ? '/api/edit/equipment-supplier/' + editId : '/api/add/equipment-supplier';
    
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const data = await res.json();
        if(data.success) {
            alert('Supplier saved successfully!');
            document.getElementById('addSupplierModal').style.display = 'none';
            if (window.loadSuppliers) window.loadSuppliers();
        } else {
            alert('Error saving supplier');
        }
    } catch(e) {
        console.error(e);
    }
});

window.deleteSupplier = async function(id) {
    if(!confirm('Delete this supplier?')) return;
    try {
        const res = await fetch('/api/delete/equipment-supplier/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            if (window.loadSuppliers) window.loadSuppliers();
        }
    } catch(e) {
        console.error(e);
    }
};

window.editSupplier = async function(id) {
    try {
        const res = await fetch('/api/equipment-suppliers');
        const data = await res.json();
        if(data.success) {
            const sup = data.suppliers.find(s => s.id === id);
            if(sup) {
                const form = document.getElementById('supplierForm');
                form.reset();
                
                document.getElementById('edit_supplier_id').value = sup.id;
                
                const fields = ['supplier_name', 'shop_company_name', 'supplier_type', 'owner_name', 'contact_person', 'mobile_number', 'alternate_mobile', 'email', 'full_address', 'city', 'state', 'pincode', 'google_maps_location', 'equipment_categories', 'brands_available', 'equipment_available', 'new_used_equipment', 'warranty_available', 'installation_service', 'after_sales_service'];
                
                fields.forEach(f => {
                    if (form.elements[f]) form.elements[f].value = sup[f] || '';
                });
                
                const modal = document.getElementById('addSupplierModal');
                if (modal) {
                    const title = modal.querySelector('h2');
                    if (title) title.innerText = 'Edit Equipment Supplier';
                    modal.style.display = 'flex';
                }
            }
        }
    } catch(e) {
        console.error(e);
    }
};
// ==================== END SUPPLIERS LOGIC ====================


window.openAddProductModal = function(isEdit = false) {
    if(!isEdit) {
        document.getElementById("productForm").reset();
        document.getElementById("edit_product_id").value = "";
        if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Add Product";
    } else {
        if(document.querySelector("#productModal h2")) document.querySelector("#productModal h2").innerText = "Edit Product";
    }
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
                
                window.openAddProductModal(true);
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


document.getElementById('closeSupplierModal')?.addEventListener('click', () => {
    const modal = document.getElementById('addSupplierModal');
    if (modal) modal.style.display = 'none';
});

document.getElementById('closeViewSupplierModal')?.addEventListener('click', () => {
    const modal = document.getElementById('viewSupplierModal');
    if (modal) modal.style.display = 'none';
});
