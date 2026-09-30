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
            const vendorName = result.user?.name || result.details?.pharmacy_name || "Vendor";
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
            
            // Populate dropdowns with user's pharmacies
            if (typeof populatePharmacyDropdowns === 'function') {
                populatePharmacyDropdowns();
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

const medicineDashboardUi = createVendorDashboardUi({
    reload: () => reloadCurrentMedicinePanel()
});

medicineDashboardUi.setupDateFilter();
window.setupVendorTopSearch?.();
loadDashboard();

function filterMedicineRecords(records, dateFields) {
    return medicineDashboardUi
        ? medicineDashboardUi.filterRecords(records, dateFields)
        : (Array.isArray(records) ? records : []);
}

function reapplyVendorSearch() {
    window.applyVendorTopSearch?.();
}

function reloadCurrentMedicinePanel() {
    const activeText =
        document.querySelector(".menuItem.active")?.innerText
            ?.toLowerCase()
        || "dashboard";

    if (activeText.includes("medicines")) {
        loadMedicines();
    }
    else if (activeText.includes("stock")) {
        loadStock();
    }
    else if (activeText.includes("orders")) {
        loadMedicineOrders();
    }
    else if (activeText.includes("payments")) {
        loadVendorPayments();
    }
    else {
        loadDashboard();
    }
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}
async function logout(event){
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try{
        const response=await fetch('/api/user/logout',{
            method:'POST',
            credentials: 'include'
        });
        const result=await response.json();
        if(result.success){
            window.location.href="/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

const navItems = document.querySelectorAll(".menuItem");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });
        item.classList.add("active");

        const text = item.innerText.toLowerCase();

        const medicineSection = document.getElementById("medicineSection");
        const pharmacySection = document.getElementById("pharmacySection");
        const pharmacistSection = document.getElementById("pharmacistSection");

        if(medicineSection) medicineSection.style.display = "none";
        if(pharmacySection) pharmacySection.style.display = "none";
        if(pharmacistSection) pharmacistSection.style.display = "none";

        if(text.includes("dashboard")){
            loadDashboard();
        }
        else if(text.includes("medicines")){
            loadMedicines();
        }
        else if(text.includes("pharmacies")){
            loadPharmacies();
        }
        else if(text.includes("pharmacists")){
            loadPharmacists();
        }
        else if(text.includes("stock")){
            loadStock();
        }
            else if(
                text.includes(
                    "orders"
                )
            ){

                loadMedicineOrders();

            }

            else if(
                text.includes(
                    "payments"
                )
            ){

                loadVendorPayments();

            }

        }
    );

});




document.getElementById("addMedicineBtn").addEventListener("click",()=>{
    document.getElementById('medicineForm').reset(); document.getElementById('edit_medicine_id').value = ''; document.getElementById('medicineModalTitle').innerText = 'Add Medicine'; document.getElementById("medicineModal").style.display="flex";
});

document.getElementById("closeMedicineModal").addEventListener("click",()=>{
    document.getElementById("medicineModal").style.display="none";
});

document.getElementById("medicineForm").addEventListener("submit",async(e)=>{
    e.preventDefault();
    const formData = new FormData();
    const fields = [
        'medicine_name', 'generic_name', 'brand_name', 'medicine_type', 'category',
        'manufacturer', 'composition', 'mrp', 'selling_price', 'gst_percentage',
        'discount_percentage', 'stock_quantity', 'minimum_stock_alert', 'batch_number',
        'manufacturing_date', 'expiry_date', 'prescription_required', 'schedule_type',
        'uses_info', 'dosage_instructions', 'side_effects', 'warnings',
        'storage_instructions', 'delivery_available', 'delivery_charge',
        'barcode_number', 'medicine_status', 'featured_medicine'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) {
            formData.append(field, el.value !== undefined && el.value !== null ? el.value : '');
        }
    });

    const medicineName = (document.getElementById("medicine_name")?.value || "").trim();
    if (medicineName === "") {
        alert("Medicine Name Required");
        return;
    }

    const editId = document.getElementById("edit_medicine_id") ? document.getElementById("edit_medicine_id").value : "";

    const imageFile = document.getElementById("medicine_image") ? document.getElementById("medicine_image").files[0] : null;
    if (imageFile) {
        formData.append("medicine_image", imageFile);
    }
    const excelFile = document.getElementById("medicine_excel_file") ? document.getElementById("medicine_excel_file").files[0] : null;
    if (excelFile) {
        formData.append("medicine_excel_file", excelFile);
    }

    try {
        let response;
        if (editId) {
            response = await fetch("/api/update/medicine/" + editId, {
                method: "PUT",
                body: formData
            });
        } else {
            response = await fetch("/api/add/medicine", {
                method: "POST",
                body: formData
            });
        }

        const result = await response.json();
        if(result.success){
            alert(result.message);
            document.getElementById('medicineForm').reset();
            if(document.getElementById("edit_medicine_id")) document.getElementById("edit_medicine_id").value = "";
            document.getElementById('medicineModal').style.display='none';
            // Reload the current view
            if (typeof loadMedicines === "function") loadMedicines();
            if (typeof loadStock === "function" && document.getElementById("stockTableBody")) loadStock();
        } else {
            alert(result.message || "Operation failed.");
        }
    }
    catch(error){
        console.log(error);
        alert("Error saving medicine. Please try again.");
    }
});

async function loadMedicines(){
    try{
        console.log("Medicines Clicked");
        document.getElementById("mainContent").innerHTML = `
            <div id="medicineSection">
                <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                    <div>
                        <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Medicines Formulary</h2>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage your pharmaceutical inventory, prices, and prescriptions catalog</p>
                    </div>
                    <button id="addMedicineBtn" class="add-btn">
                        <i class="fa-solid fa-plus"></i> Add Medicine
                    </button>
                </div>

                <div class="table-wrapper">
                    <table id="medicineTable" class="adminTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Medicine Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>MRP</th>
                                <th>Selling Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="medicineTableBody">
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                                    <i class="fa-solid fa-spinner fa-spin"></i> Loading Medicines...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const addBtn = document.getElementById("addMedicineBtn");
        if(addBtn){
            addBtn.addEventListener("click", ()=>{
                const modal = document.getElementById("medicineModal");
                if(modal) modal.style.display = "flex";
            });
        }

        const tbody = document.getElementById("medicineTableBody");
        const response = await fetch("/api/medicines");
        const result = await response.json();
        window.medicinesData = result.medicines;

        tbody.innerHTML = "";

        if(!result.success){
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(239,75,95,0.1); color:#EF4B5F; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">Failed To Load Medicines</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Please check your network connection or server status.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        window.medicinesData = result.medicines;
        const medicines = filterMedicineRecords(
            result.medicines,
            ["created_at", "updated_at"]
        );

        if(medicines.length === 0){
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-capsules"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Medicines Found</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Click "Add Medicine" above to populate your pharmacy formulary.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        medicines.forEach(medicine=>{
            const isInStock = (medicine.stock_status || '').toLowerCase().includes('in stock') || (medicine.stock_quantity > 0);
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600; color:var(--hk-primary-blue);">#${medicine.medicine_id || medicine.id || "-"}</td>
                    <td style="font-weight:600; color:var(--hk-text-main);">${medicine.medicine_name || "-"}</td>
                    <td><span style="font-weight:500; color:var(--hk-text-muted);">${medicine.medicine_type || "-"}</span></td>
                    <td>${medicine.category || "-"}</td>
                    <td style="color:var(--hk-text-muted); text-decoration:line-through;">₹${medicine.mrp || 0}</td>
                    <td style="font-weight:700; color:var(--hk-text-main);">₹${medicine.selling_price || 0}</td>
                    <td style="font-weight:600;">${medicine.stock_quantity || 0} Units</td>
                    <td>
                        <span class="status-badge ${isInStock ? 'active' : 'cancelled'}">
                            <i class="fa-solid ${isInStock ? 'fa-check' : 'fa-xmark'}"></i>
                            ${medicine.medicine_status || (isInStock ? 'In Stock' : 'Out of Stock')}
                        </span>
                    </td>
                    <td style="white-space: nowrap; text-align: center;">
                        <i class="fa-solid fa-pen-to-square" onclick="editMedicine(${medicine.medicine_id || medicine.id})" title="Edit" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                        <i class="fa-solid fa-trash" onclick="deleteMedicine(${medicine.medicine_id || medicine.id})" title="Delete" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-left: 10px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </td>
                </tr>
            `;
        });
        reapplyVendorSearch();

    }
    catch(error){
        console.error("Load Medicines Error:", error);
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
            if(type === 'medicine') {
                if(typeof loadMedicineOrders === 'function') loadMedicineOrders();
            } else {
                if(typeof loadEquipmentOrders === 'function') loadEquipmentOrders();
            }
        } else {
            alert('Failed to update status');
        }
    } catch(e) {
        console.error(e);
        alert('An error occurred');
    }
};

async function loadMedicineOrders(){
    try{
        const response = await fetch('/api/medicine/orders');
        const result = await response.json();

        let html = `
        <div id="ordersSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Medicine Orders</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">View, track and dispatch pharmacy prescription orders</p>
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
                            <th>Prescription</th>
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

                    let prespHtml = '<span style="color:#888;">Not Required</span>';
                    if (order.prescription_status !== 'NOT_REQUIRED') {
                        prespHtml = `
                            <div>
                                <strong>Status:</strong> ${order.prescription_status}<br>
                                ${order.prescription_file ? `<a href="/uploads/${order.prescription_file}" target="_blank" style="color:var(--brand-primary); text-decoration:underline;">View File</a>` : ''}
                            </div>
                        `;
                    }

                    const statuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'PACKED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'];
                    let statusSelect = `<select id="status_${order.id}" style="padding:4px; border-radius:4px; border:1px solid #ddd;">`;
                    statuses.forEach(s => {
                        const sel = ((order.order_status || "").toUpperCase() === s.toUpperCase()) ? 'selected' : '';
                        statusSelect += `<option value="${s}" ${sel}>${s}</option>`;
                    });
                    statusSelect += `</select>`;

                    let actionHtml = `<button onclick="updateOrderStatus(${order.id}, 'medicine', document.getElementById('status_${order.id}').value, null)" style="padding:5px 10px; border-radius:6px; background:var(--brand-primary); color:#fff; border:none; cursor:pointer;">Update Status</button>`;
                    
                    if (order.prescription_status === 'PENDING') {
                        actionHtml += `
                            <div style="margin-top:5px; display:flex; gap:5px;">
                                <button onclick="updateOrderStatus(${order.id}, 'medicine', null, 'APPROVED')" style="padding:4px 8px; font-size:11px; background:green; color:#fff; border:none; border-radius:4px; cursor:pointer;">Approve</button>
                                <button onclick="updateOrderStatus(${order.id}, 'medicine', null, 'REJECTED')" style="padding:4px 8px; font-size:11px; background:red; color:#fff; border:none; border-radius:4px; cursor:pointer;">Reject</button>
                            </div>
                        `;
                    }

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
                        <td>${prespHtml}</td>
                        <td>${actionHtml}</td>
                    </tr>
                    `;
                });
            } else {
                html += `<tr><td colspan="8" style="text-align:center;">No orders found</td></tr>`;
            }
        } else {
            html += `<tr><td colspan="8" style="text-align:center;">No orders found</td></tr>`;
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

        const orderRes = await fetch('/api/medicine/orders');
        const orderResult = await orderRes.json();
        const orderTbody = document.getElementById("orderPaymentsTableBody");

        if(orderResult.success && orderResult.orders && orderResult.orders.length > 0) {
            const orders = filterMedicineRecords(orderResult.orders, ["created_at", "order_date"]);
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
            const payouts = filterMedicineRecords(payoutsResult.payments, ["paid_at", "created_at"]);
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

        const response =
            await fetch(
                `/api/vendor/dashboard${medicineDashboardUi.getQueryString()}`
            );

        const result =
            await response.json();

        if(!result.success){

            return;

        }

        const data =
            result.dashboard;

        let ordersHtml = '';

        if(data.recentOrders.length > 0){

            data.recentOrders.forEach(order=>{

                ordersHtml += `
                <tr>

                    <td>
                        #ORD${order.id}
                    </td>

                    <td>
                        ₹${order.total_amount}
                    </td>

                    <td>
                        ${order.order_status}
                    </td>

                </tr>
                `;
            });

        }
        else{

            ordersHtml = `
            <tr>

                <td colspan="3">
                    No Orders
                </td>

            </tr>
            `;

        }

        let paymentsHtml = '';

        if(data.recentPayments.length > 0){

            data.recentPayments.forEach(payment=>{

                paymentsHtml += `
                <tr>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_status}
                    </td>

                    <td>
                        ${
                            new Date(
                                payment.paid_at
                            ).toLocaleDateString()
                        }
                    </td>

                </tr>
                `;
            });

        }
        else{

            paymentsHtml = `
            <tr>

                <td colspan="3">
                    No Payments
                </td>

            </tr>
            `;

        }

        document.getElementById("mainContent").innerHTML = `
        <div id="dashboardSection">

            <!-- HEALTHCARE COMMAND CENTRE HERO BANNER -->
            <div class="hero-welcome-card">
                <div class="hero-text-content">
                    <h2>Welcome, <span class="vendor-display-name">${escapeHtml(currentVendorName)}</span> <i class="fa-solid fa-circle-check" style="color: #18B981; font-size: 18px;"></i></h2>
                    <p>Here’s what’s happening with your pharmacy inventory and customer prescription orders today.</p>
                </div>
                <div class="hero-quick-actions">
                    <button class="hero-btn" id="heroAddMedicineBtn" onclick="document.getElementById('medicinesBtn').click(); document.getElementById('addMedicineBtn')?.click();"><i class="fa-solid fa-plus"></i> Add Medicine</button>
                    <button class="hero-btn" id="heroOrdersBtn" onclick="document.getElementById('ordersBtn').click();"><i class="fa-solid fa-cart-shopping"></i> View Orders</button>
                </div>
            </div>

            <!-- BENTO KPI METRIC GRID -->
            <div id="dashboardCards" class="grid-container" style="margin-bottom: 24px;">
                <div class="dashCard featured-card" data-dashboard-target="paymentsBtn">
                    <div class="card-icon icon-green"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Sales</h3>
                            <span class="trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +19.3%</span>
                        </div>
                        <h1>₹${Number(data.totalRevenue).toLocaleString()}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill green" style="width: 86%;"></div></div>
                            <div class="card-progress-info"><span>Monthly Target: ₹2,00,000</span><span class="target-val">86% Achieved</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="ordersBtn">
                    <div class="card-icon icon-purple"><i class="fa-solid fa-cart-shopping"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Orders</h3>
                            <span class="trend positive"><i class="fa-solid fa-check"></i> Active</span>
                        </div>
                        <h1>${data.totalOrders}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill purple" style="width: 74%;"></div></div>
                            <div class="card-progress-info"><span>Target: 300 Orders</span><span class="target-val">74% Target</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="medicinesBtn">
                    <div class="card-icon icon-blue"><i class="fa-solid fa-capsules"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Products</h3>
                            <span class="trend positive">Catalog</span>
                        </div>
                        <h1>${data.totalProducts}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill" style="width: 92%;"></div></div>
                            <div class="card-progress-info"><span>Formulary In Stock</span><span class="target-val">Live Sync</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="stockBtn">
                    <div class="card-icon icon-orange"><i class="fa-solid fa-box"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Stock</h3>
                            <span class="trend positive">Units Ready</span>
                        </div>
                        <h1>${data.totalStock}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill orange" style="width: 80%;"></div></div>
                            <div class="card-progress-info"><span>Inventory Level</span><span class="target-val">Optimal</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CHARTS SECTION -->
            <div id="chartsGrid">
                <div class="chartWrapper" data-dashboard-target="paymentsBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Total Sales Trend</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Prescription revenue timeline</p>
                            </div>
                        </div>
                        <span class="status-badge" style="background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); font-size: 12px; font-weight: 700;">₹ Sales Timeline</span>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%;">
                        <canvas id="salesLineChart"></canvas>
                    </div>
                </div>

                <div class="chartWrapper" data-dashboard-target="stockBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(25, 191, 211, 0.1); color: var(--hk-cyan); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-pie"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Stock Distribution</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Category breakdown</p>
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
                <div class="table-wrapper" data-dashboard-target="ordersBtn" style="margin: 0;">
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
                                ${ordersHtml}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="table-wrapper" data-dashboard-target="paymentsBtn" style="margin: 0;">
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
                                ${paymentsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;

        medicineDashboardUi.setupLinks(
            document.getElementById("dashboardSection")
        );
        reapplyVendorSearch();

        if(window.mdcSalesChartInstance){
            window.mdcSalesChartInstance.destroy();
            window.mdcSalesChartInstance = null;
        }
        if(window.mdcStockChartInstance){
            window.mdcStockChartInstance.destroy();
            window.mdcStockChartInstance = null;
        }

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#94A3B8" : "#64748B";
        const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";
        const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

        const ctxLine = document.getElementById('salesLineChart');
        if(ctxLine){
            const chartCtx = ctxLine.getContext('2d');
            let grad = chartCtx.createLinearGradient(0, 0, 0, 260);
            grad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.18)');
            grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

            window.mdcSalesChartInstance = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: result.salesLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Sales (₹)',
                        data: result.salesData || [12000, 18000, 15000, 22000, 31000, data.totalRevenue || 28000],
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
        if(ctxPie){
            window.mdcStockChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: result.stockLabels || ['Antibiotics', 'Analgesics', 'Cardio', 'Vitamins', 'Others'],
                    datasets: [{
                        data: result.stockData || [35, 25, 20, 15, 5],
                        backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
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
        console.log("Load Dashboard Error:", error);
    }
}

async function loadStock(){
    try{
        document.getElementById("mainContent").innerHTML = `
            <div id="stockSection">
                <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                    <div>
                        <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Stock & Inventory Levels</h2>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Monitor batch allocations, low-stock threshold alerts, and expiry horizons</p>
                    </div>
                    <button id="addStockBtn" class="add-btn">
                        <i class="fa-solid fa-plus"></i> Add Stock
                    </button>
                </div>

                <div class="table-wrapper">
                    <table id="stockTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Medicine Name</th>
                            <th>Stock Qty</th>
                            <th>Minimum Alert</th>
                            <th>Batch No</th>
                            <th>Expiry Date</th>
                            <th>Inventory Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="stockTableBody">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                                <i class="fa-solid fa-spinner fa-spin"></i> Loading Stock Levels...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;

        const addStockBtn = document.getElementById("addStockBtn");
        if(addStockBtn){
            addStockBtn.addEventListener("click", ()=>{
                const modalTitle = document.querySelector("#medicineModalHeader h2");
                if(modalTitle) modalTitle.innerText = "Add Stock";
                const modal = document.getElementById("medicineModal");
                if(modal) modal.style.display = "flex";
            });
        }

        const tbody = document.getElementById("stockTableBody");
        const response = await fetch("/api/medicines");
        const result = await response.json();
        window.medicinesData = result.medicines;

        tbody.innerHTML = "";

        if(!result.success){
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(239,75,95,0.1); color:#EF4B5F; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">Failed To Load Stock</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Could not retrieve inventory levels from server.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const stockMedicines = filterMedicineRecords(
            result.medicines,
            ["created_at", "updated_at"]
        );

        if(stockMedicines.length === 0){
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:56px 24px;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
                            <div style="width:56px; height:56px; border-radius:50%; background:rgba(40,100,240,0.1); color:#2864F0; display:flex; align-items:center; justify-content:center; font-size:24px;">
                                <i class="fa-solid fa-box-open"></i>
                            </div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Stock Found</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Use "Add Stock" to register inventory quantities.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        stockMedicines.forEach(medicine=>{
            let status = "In Stock";
            let statusClass = "active";
            let statusIcon = "fa-check";

            if(Number(medicine.stock_quantity) <= Number(medicine.minimum_stock_alert)){
                status = "Low Stock";
                statusClass = "pending";
                statusIcon = "fa-triangle-exclamation";
            }
            if(Number(medicine.stock_quantity) <= 0){
                status = "Out Of Stock";
                statusClass = "cancelled";
                statusIcon = "fa-xmark";
            }

            tbody.innerHTML += `
            <tr>
                <td style="font-weight:600; color:var(--hk-primary-blue);">#${medicine.medicine_id || medicine.id || "-"}</td>
                <td style="font-weight:600; color:var(--hk-text-main);">${medicine.medicine_name || "-"}</td>
                <td style="font-weight:700; color:var(--hk-text-main);">${medicine.stock_quantity || 0} Units</td>
                <td style="color:var(--hk-text-muted);">${medicine.minimum_stock_alert || 0} Units</td>
                <td style="font-family:monospace; font-size:12px;">${medicine.batch_number || "BATCH-" + (medicine.id || "01")}</td>
                <td>${medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : "Valid"}</td>
                <td><span class="status-badge ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${status}</span></td>
                <td style="white-space: nowrap;">
                    <i class="fa-solid fa-pen-to-square" onclick="editMedicine(${medicine.medicine_id || medicine.id})" title="Edit" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    <i class="fa-solid fa-trash" onclick="deleteMedicine(${medicine.medicine_id || medicine.id})" title="Delete" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-left: 12px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                </td>
            </tr>
            `;
        });
        reapplyVendorSearch();

    }
    catch(error){
        console.error("Load Stock Error:", error);
    }
}

// Re-render medicines charts on theme toggle
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

async function loadPharmacies() {
    document.getElementById("mainContent").innerHTML = `
        <div id="pharmacySection" class="active-section" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Pharmacies</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage your pharmacy branches and their details</p>
                </div>
                <button id="addPharmacyMainBtn" class="add-btn" onclick="document.getElementById('addPharmacyModalBox').style.display='flex'">
                    <i class="fa-solid fa-plus"></i> Add Pharmacy
                </button>
            </div>
            <div class="table-wrapper">
                <table id="pharmacyTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>Pharmacy Name</th>
                            <th>Owner</th>
                            <th>Type</th>
                            <th>Contact</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="pharmacyTableBody">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                                <i class="fa-solid fa-spinner fa-spin"></i> Loading Pharmacies...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/api/vendor/pharmacies');
        const result = await response.json();
        const tbody = document.getElementById('pharmacyTableBody');
        tbody.innerHTML = '';
        
        if (result.success && result.pharmacies.length > 0) {
            window.pharmaciesData = result.pharmacies;
            result.pharmacies.forEach(ph => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight:600; color:var(--hk-text-main);">${ph.pharmacy_name}</td>
                    <td>${ph.owner_name}</td>
                    <td><span style="font-weight:500; color:var(--hk-text-muted);">${ph.pharmacy_type}</span></td>
                    <td>${ph.contact_number}</td>
                    <td>${ph.city}</td>
                    <td>
                        <span class="status-badge active">
                            <i class="fa-solid fa-check"></i> ${ph.status || 'Active'}
                        </span>
                    </td>
                    <td style="white-space: nowrap; text-align: center;">
                        <i class="fa-solid fa-pen-to-square" onclick="editPharmacy(${ph.id})" title="Edit" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                        <i class="fa-solid fa-trash" onclick="deletePharmacy(${ph.id})" title="Delete" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-left: 10px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                        No Pharmacies Added Yet.
                    </td>
                </tr>
            `;
        }
    } catch (e) {
        console.error(e);
        document.getElementById('pharmacyTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                    Failed to load pharmacies.
                </td>
            </tr>
        `;
    }
}

async function loadPharmacists() {
    document.getElementById("mainContent").innerHTML = `
        <div id="pharmacistSection" class="active-section" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Pharmacists</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage pharmacist details and their availability</p>
                </div>
                <button id="addPharmacistMainBtn" class="add-btn" onclick="document.getElementById('addPharmacistModalBox').style.display='flex'">
                    <i class="fa-solid fa-plus"></i> Add Pharmacist
                </button>
            </div>
            <div class="table-wrapper">
                <table id="pharmacistTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>Pharmacist Name</th>
                            <th>Pharmacy</th>
                            <th>Reg No</th>
                            <th>Qualification</th>
                            <th>Contact</th>
                            <th>Availability</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="pharmacistTableBody">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                                <i class="fa-solid fa-spinner fa-spin"></i> Loading Pharmacists...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/api/vendor/pharmacists');
        const result = await response.json();
        const tbody = document.getElementById('pharmacistTableBody');
        tbody.innerHTML = '';
        
        if (result.success && result.pharmacists.length > 0) {
            window.pharmacistsData = result.pharmacists;
            result.pharmacists.forEach(ph => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight:600; color:var(--hk-text-main);">${ph.pharmacist_name}</td>
                    <td>${ph.pharmacy_name}</td>
                    <td style="font-weight:600; color:var(--hk-primary-blue);">${ph.registration_number}</td>
                    <td><span style="font-weight:500; color:var(--hk-text-muted);">${ph.qualification}</span></td>
                    <td>${ph.contact_number}</td>
                    <td>
                        <span class="status-badge ${ph.availability === 'Full Time' ? 'active' : 'pending'}">
                            ${ph.availability}
                        </span>
                    </td>
                    <td style="white-space: nowrap; text-align: center;">
                        <i class="fa-solid fa-pen-to-square" onclick="editPharmacist(${ph.id})" title="Edit" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                        <i class="fa-solid fa-trash" onclick="deletePharmacist(${ph.id})" title="Delete" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-left: 10px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                        No Pharmacists Added Yet.
                    </td>
                </tr>
            `;
        }
    } catch (e) {
        console.error(e);
        document.getElementById('pharmacistTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
                    Failed to load pharmacists.
                </td>
            </tr>
        `;
    }
}

async function populatePharmacyDropdowns() {
    try {
        const response = await fetch('/api/vendor/pharmacies');
        const result = await response.json();
        if (result.success && result.pharmacies) {
            const selects = document.querySelectorAll('select[name="pharmacy_name"], select#shop_name');
            selects.forEach(select => {
                // Keep the first default option
                const defaultOption = select.options.length > 0 ? select.options[0].outerHTML : '<option value="">Select Pharmacy...</option>';
                select.innerHTML = defaultOption;
                
                result.pharmacies.forEach(ph => {
                    const opt = document.createElement('option');
                    opt.value = ph.pharmacy_name;
                    opt.textContent = ph.pharmacy_name;
                    select.appendChild(opt);
                });
            });
        }
    } catch (e) {
        console.error("Error populating pharmacy dropdowns:", e);
    }
}

// Edit & Delete Action Handlers
// editMedicine: full implementation defined below

window.deleteMedicine = async function(id) {
    if (confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/medicine/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Medicine deleted successfully.");
                if (typeof loadMedicines === 'function') loadMedicines();
            } else {
                alert(result.message || "Failed to delete medicine.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting medicine.");
        }
    }
};

// editPharmacy: full implementation defined below

window.deletePharmacy = async function(id) {
    if (confirm("Are you sure you want to delete this pharmacy? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/vendor/pharmacy/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Pharmacy deleted successfully.");
                if (typeof loadPharmacies === 'function') loadPharmacies();
            } else {
                alert(result.message || "Failed to delete pharmacy.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting pharmacy.");
        }
    }
};

// editPharmacist: full implementation defined below

window.deletePharmacist = async function(id) {
    if (confirm("Are you sure you want to delete this pharmacist? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/vendor/pharmacist/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Pharmacist deleted successfully.");
                if (typeof loadPharmacists === 'function') loadPharmacists();
            } else {
                alert(result.message || "Failed to delete pharmacist.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting pharmacist.");
        }
    }
};

window.editMedicine = async function(id) {
    // Always fetch fresh data if medicinesData is not available
    if (!window.medicinesData || !Array.isArray(window.medicinesData)) {
        try {
            const resp = await fetch('/api/medicines');
            const data = await resp.json();
            if (data.success) window.medicinesData = data.medicines;
        } catch(e) { console.error('Failed to fetch medicines:', e); }
    }
    if (!window.medicinesData) { alert('Could not load medicines data.'); return; }
    
    const med = window.medicinesData.find(m => m.medicine_id == id || m.id == id);
    if (!med) { alert('Medicine not found.'); return; }
    
    document.getElementById('medicineForm').reset();
    document.getElementById('edit_medicine_id').value = med.medicine_id || med.id;
    const titleEl = document.getElementById('medicineModalTitle') || document.querySelector('#medicineModalHeader h2');
    if (titleEl) titleEl.innerText = 'Edit Medicine';
    
    // Populate all text/select fields
    const fields = ['shop_name', 'medicine_name', 'generic_name', 'brand_name', 'medicine_type', 'category', 'manufacturer', 'composition', 'mrp', 'selling_price', 'gst_percentage', 'discount_percentage', 'stock_quantity', 'minimum_stock_alert', 'batch_number', 'manufacturing_date', 'expiry_date', 'prescription_required', 'schedule_type', 'uses_info', 'dosage_instructions', 'side_effects', 'warnings', 'storage_instructions', 'delivery_available', 'delivery_charge', 'barcode_number', 'medicine_status', 'featured_medicine'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && med[field] !== undefined && med[field] !== null) {
            if (field === 'manufacturing_date' || field === 'expiry_date') {
                try { el.value = new Date(med[field]).toISOString().split('T')[0]; } catch(e) { el.value = ''; }
            } else {
                el.value = med[field];
            }
        }
    });
    
    // Show previously uploaded file info
    const fileFields = [
        { inputId: 'medicine_image', dbField: 'medicine_image', label: 'Medicine Image' },
        { inputId: 'medicine_excel_file', dbField: 'medicine_excel_file', label: 'Excel/CSV File' }
    ];
    fileFields.forEach(ff => {
        const inputEl = document.getElementById(ff.inputId);
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        // Remove old file preview if exists
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (med[ff.dbField]) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Previously uploaded: <strong>' + med[ff.dbField] + '</strong> (select new file only to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('medicineModal').style.display = 'flex';
};

window.editPharmacy = async function(id) {
    if (!window.pharmaciesData || !Array.isArray(window.pharmaciesData)) {
        try {
            const resp = await fetch('/api/vendor/pharmacies');
            const data = await resp.json();
            if (data.success) window.pharmaciesData = data.pharmacies;
        } catch(e) { console.error('Failed to fetch pharmacies:', e); }
    }
    if (!window.pharmaciesData) { alert('Could not load pharmacies data.'); return; }
    
    const pharm = window.pharmaciesData.find(p => p.id == id);
    if (!pharm) { alert('Pharmacy not found.'); return; }
    
    const form = document.getElementById('addPharmacyForm');
    form.reset();
    document.getElementById('edit_pharmacy_id').value = pharm.id;
    document.getElementById('pharmacyModalTitle').innerText = 'Edit Pharmacy';
    
    // Populate all text/select fields
    const fields = ['pharmacy_name', 'owner_name', 'pharmacy_type', 'contact_number', 'email', 'alternate_contact', 'address', 'city', 'state', 'pincode', 'location', 'opening_time', 'closing_time', 'available_24_7', 'home_delivery', 'delivery_radius', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            if (field === 'available_24_7') {
                el.value = pharm[field] == 1 ? 'Yes' : (pharm[field] === 'Yes' ? 'Yes' : 'No');
            } else if (field === 'home_delivery') {
                el.value = pharm[field] == 1 ? 'Yes' : (pharm[field] === 'Yes' ? 'Yes' : 'No');
            } else {
                el.value = pharm[field];
            }
        }
    });
    
    // Show previously uploaded file info for pharmacy docs
    const pharmacyFileFields = ['pharmacy_logo', 'drug_licence', 'pharmacist_registration_certificate', 'pharmacist_qualification_certificate', 'shop_proof', 'owner_kyc'];
    pharmacyFileFields.forEach(fieldName => {
        const inputEl = form.querySelector('[name="'+fieldName+'"]');
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (pharm[fieldName]) {
            inputEl.removeAttribute('required');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Uploaded: <strong>' + pharm[fieldName] + '</strong> (select new to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('addPharmacyModalBox').style.display = 'flex';
};

window.editPharmacist = async function(id) {
    if (!window.pharmacistsData || !Array.isArray(window.pharmacistsData)) {
        try {
            const resp = await fetch('/api/vendor/pharmacists');
            const data = await resp.json();
            if (data.success) window.pharmacistsData = data.pharmacists;
        } catch(e) { console.error('Failed to fetch pharmacists:', e); }
    }
    if (!window.pharmacistsData) { alert('Could not load pharmacists data.'); return; }
    
    const pharm = window.pharmacistsData.find(p => p.id == id);
    if (!pharm) { alert('Pharmacist not found.'); return; }
    
    const form = document.getElementById('addPharmacistForm');
    form.reset();
    document.getElementById('edit_pharmacist_id').value = pharm.id;
    document.getElementById('pharmacistModalTitle').innerText = 'Edit Pharmacist';
    
    // Populate all text/select fields
    const fields = ['pharmacist_name', 'pharmacy_name', 'registration_number', 'qualification', 'state_pharmacy_council', 'contact_number', 'email', 'experience_years', 'shift_timing', 'availability', 'status'];
    fields.forEach(field => {
        const el = form.querySelector('[name="'+field+'"]');
        if (el && pharm[field] !== undefined && pharm[field] !== null) {
            el.value = pharm[field];
        }
    });
    
    // Show previously uploaded file info for pharmacist docs
    const pharmacistFileFields = ['registration_certificate_doc', 'pharmacist_certificate_doc', 'employment_proof'];
    pharmacistFileFields.forEach(fieldName => {
        const inputEl = form.querySelector('[name="'+fieldName+'"]');
        if (!inputEl) return;
        const parent = inputEl.closest('div');
        const oldPreview = parent.querySelector('.file-preview-info');
        if (oldPreview) oldPreview.remove();
        
        if (pharm[fieldName]) {
            inputEl.removeAttribute('required');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'file-preview-info';
            previewDiv.style.cssText = 'margin-top:6px; padding:8px 12px; background:rgba(40,100,240,0.08); border-radius:8px; font-size:12px; color:#2864F0; display:flex; align-items:center; gap:8px;';
            previewDiv.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> <span>Uploaded: <strong>' + pharm[fieldName] + '</strong> (select new to replace)</span>';
            parent.appendChild(previewDiv);
        }
    });
    
    document.getElementById('addPharmacistModalBox').style.display = 'flex';
};

// Remove old global Edit placeholder logic if it exists
