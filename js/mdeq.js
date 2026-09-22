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
            currentVendorName = vendorName;
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = `Welcome ${vendorName}`;
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });
            fillProfileForm(result.user, result.details || {});
            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
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
document.getElementById("vendorProfileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const password = document.getElementById("profilePassword")?.value || "";
    const confirmPassword = document.getElementById("profileConfirmPassword")?.value || "";
    if (password && password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    const formData = new FormData(form);
    if (!password) formData.delete("password");
    const response = await fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: formData });
    const result = await response.json();
    if (result.success) {
        alert("Profile updated successfully");
        closeProfileModal();
        await loadUserProfile();
    } else {
        alert(result.message || "Profile update failed");
    }
});
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
        document.getElementById(
            "productModal"
        ).style.display =
            "flex";
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

document.getElementById(
    "productForm"
)
.addEventListener(
    "submit",
    async(e) => {
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "product_name",
            document.getElementById(
                "product_name"
            ).value
        );
        formData.append(
            "brand_name",
            document.getElementById(
                "brand_name"
            ).value
        );
        formData.append(
            "category",
            document.getElementById(
                "category"
            ).value
        );
        formData.append(
            "sub_category",
            document.getElementById(
                "sub_category"
            ).value
        );
        formData.append(
            "model_number",
            document.getElementById(
                "model_number"
            ).value
        );
        formData.append(
            "manufacturer",
            document.getElementById(
                "manufacturer"
            ).value
        );
        formData.append(
            "country_of_origin",
            document.getElementById(
                "country_of_origin"
            ).value
        );
        formData.append(
            "product_description",
            document.getElementById(
                "product_description"
            ).value
        );
        formData.append(
            "mrp",
            document.getElementById(
                "mrp"
            ).value
        );
        formData.append(
            "selling_price",
            document.getElementById(
                "selling_price"
            ).value
        );
        formData.append(
            "stock_quantity",
            document.getElementById(
                "stock_quantity"
            ).value
        );
        formData.append(
            "stock_status",
            document.getElementById(
                "stock_status"
            ).value
        );
        formData.append(
            "warranty_period",
            document.getElementById(
                "warranty_period"
            ).value
        );
        formData.append(
            "delivery_available",
            document.getElementById(
                "delivery_available"
            ).value
        );
        formData.append(
            "delivery_charge",
            document.getElementById(
                "delivery_charge"
            ).value
        );
        formData.append(
            "thumbnail_image",
            document.getElementById(
                "thumbnail_image"
            ).files[0]
        );
        formData.append(
            "product_manual",
            document.getElementById(
                "product_manual"
            ).files[0]
        );
        formData.append(
            "product_video",
            document.getElementById(
                "product_video"
            ).files[0]
        );
        try{
            const response = await fetch('/api/add/equipment-product',{
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            if(result.success){
                alert(
                    "Product Added"
                );
                document.getElementById(
                    "productModal"
                ).style.display =
                    "none";
                loadProducts();
            }
        }
        catch(error){
            console.log(error);
        }
    }
);

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
                document.getElementById("productModal").style.display = "flex";
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
                            <th>Customer</th>
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
        const response = await fetch('/api/vendor/payments');
        const result = await response.json();

        let html = `
        <div id="paymentsSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Vendor Settlements & Payments</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Track payout disbursements, payment transaction IDs, and settlement cycles</p>
                </div>
            </div>

            <div class="table-wrapper">
                <table id="paymentsTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Settlement Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(result.success){
            const payments =
                filterEquipmentRecords(
                    result.payments,
                    ["paid_at", "created_at"]
                );

            if(payments.length > 0){
                payments.forEach(payment => {
                    const isSuccess = (payment.payment_status || '').toLowerCase() === 'success';
                html += `
                <tr>
                    <td style="font-weight:600; color:var(--hk-primary-blue);">#${payment.id}</td>
                    <td style="font-weight:700; color:var(--hk-text-main);">₹${Number(payment.amount || 0).toLocaleString()}</td>
                    <td>${payment.payment_method || 'Direct Bank'}</td>
                    <td><span class="status-badge ${isSuccess ? 'active' : 'pending'}"><i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-clock'}"></i> ${payment.payment_status || 'Success'}</span></td>
                    <td style="font-family:monospace; font-size:12px; color:var(--hk-text-muted);">${payment.transaction_id || 'TXN-' + payment.id}</td>
                    <td>${payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'Recent'}</td>
                </tr>
                `;
                });
            }
            else{
                html += `
                <tr>
                    <td colspan="6" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-wallet"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Payment Records</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Payout settlements and transaction histories will show up here.</p>
                        </div>
                    </td>
                </tr>
                `;
            }
        }
        else{
            html += `
            <tr>
                <td colspan="6" style="text-align:center; padding:56px 24px;">
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                        <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                            <i class="fa-solid fa-wallet"></i>
                        </div>
                        <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Payment Records</h4>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Payout settlements and transaction histories will show up here.</p>
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
function openProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
    
    // Fetch entities to populate the dropdown
    const entityType = document.getElementById('profileEntityType')?.value;
    if (entityType) {
        fetch('/api/vendor/my-entities/' + entityType)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const select = document.getElementById('entitySelect');
                    if (select) {
                        select.innerHTML = '<option value="">Select Equipment Source...</option>';
                        data.data.forEach(ent => {
                            if (!ent.profile_completed) {
                                select.innerHTML += '<option value="' + ent.id + '">' + ent.name + '</option>';
                            }
                        });
                        
                          if (select.options.length === 1) {
                              select.innerHTML = '<option value="">All profiles completed or no entities added.</option>';
                          }
                          
                          // Auto-fill form when entity is selected
                          select.addEventListener('change', async (e) => {
                              const entityId = e.target.value;
                              if (!entityId) return;
                              try {
                                  const res = await fetch('/api/vendor/entity-details/' + entityType + '/' + entityId);
                                  const result = await res.json();
                                  if (result.success && result.data) {
                                      const form = document.getElementById('vendorProfileForm');
                                      for (const key in result.data) {
                                          const input = form.querySelector('[name="' + key + '"]');
                                          if (input && result.data[key]) {
                                              input.value = result.data[key];
                                          }
                                      }
                                  }
                              } catch(err) { console.error(err); }
                          });

                    }
                }
            });
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModalBox") || document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}

document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const entityId = document.getElementById('entitySelect')?.value;
    const entityType = document.getElementById('profileEntityType')?.value;
    
    if (!entityId) {
        alert('Please select an entity first.');
        return;
    }
    
    const formData = new FormData(form);
    
    const submitBtn = document.getElementById('saveProfileBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';
    }

    try {
        const response = await fetch('/api/vendor/complete-profile/' + entityType + '/' + entityId, { 
            method: 'POST', 
            body: formData 
        });
        const result = await response.json();
        if (result.success) {
            alert('Profile completed successfully!');
            closeProfileModal();
            form.reset();
        } else {
            alert(result.message || 'Profile completion failed');
        }
    } catch (e) {
        alert('An error occurred.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Profile';
        }
    }
});
// ===================================
