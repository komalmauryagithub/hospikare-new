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
function openProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
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
            currentVendorName = vendorName;
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = `Welcome ${vendorName}`;
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });
            fillProfileForm(result.user, result.details || {});
            const isComplete = result.user.bank_account && result.user.ifsc;
            const triggerText = document.getElementById('profileTriggerText');
            if(triggerText) {
                triggerText.innerText = 'Complete Profile';
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

            const medicineSection =
                document.getElementById(
                    "medicineSection"
                );

            if(medicineSection){

                medicineSection.style.display =
                    "none";

            }

            if(
                text.includes(
                    "dashboard"
                )
            ){

                loadDashboard();

            }

            else if(
                text.includes(
                    "medicines"
                )
            ){

                if(medicineSection){

                    medicineSection.style.display =
                        "block";

                }

                loadMedicines();

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
    document.getElementById("medicineModal").style.display="flex";
});

document.getElementById("closeMedicineModal").addEventListener("click",()=>{
    document.getElementById("medicineModal").style.display="none";
});

document.getElementById("medicineForm").addEventListener("submit",async(e)=>{
    e.preventDefault();
    const formData=new FormData();
    const medicineName=document.getElementById("medicine_name").value.trim();
    formData.append("medicine_name",medicineName);
    formData.append("generic_name",document.getElementById("generic_name").value);
    formData.append("brand_name",document.getElementById("brand_name").value);
    formData.append("medicine_type",document.getElementById("medicine_type").value);
    formData.append("category",document.getElementById("category").value);
    formData.append("manufacturer",document.getElementById("manufacturer").value);
    formData.append("composition",document.getElementById("composition").value);
    formData.append("mrp",document.getElementById("mrp").value);
    formData.append("selling_price",document.getElementById("selling_price").value);
    formData.append("gst_percentage",document.getElementById("gst_percentage").value);
    formData.append("discount_percentage",document.getElementById("discount_percentage").value);
    formData.append("stock_quantity",document.getElementById("stock_quantity").value);
    formData.append("minimum_stock_alert",document.getElementById("minimum_stock_alert").value);
    formData.append("batch_number",document.getElementById("batch_number").value);
    formData.append("manufacturing_date",document.getElementById("manufacturing_date").value);
    formData.append("expiry_date",document.getElementById("expiry_date").value);
    formData.append("prescription_required",document.getElementById("prescription_required").value);
    formData.append("schedule_type",document.getElementById("schedule_type").value);
    formData.append("uses_info",document.getElementById("uses_info").value);
    formData.append("dosage_instructions",document.getElementById("dosage_instructions").value);
    formData.append("side_effects",document.getElementById("side_effects").value);
    formData.append("warnings",document.getElementById("warnings").value);
    formData.append("storage_instructions",document.getElementById("storage_instructions").value);
    formData.append("delivery_available",document.getElementById("delivery_available").value);
    formData.append("delivery_charge",document.getElementById("delivery_charge").value);
    formData.append("barcode_number",document.getElementById("barcode_number").value);
    formData.append("medicine_status",document.getElementById("medicine_status").value);
    formData.append("featured_medicine",document.getElementById("featured_medicine").value);
    if(medicineName===""){
        alert("Medicine Name Required");
        return;
    }
    if(document.getElementById("medicine_image").files[0]){
        formData.append(
            "medicine_image",
            document.getElementById("medicine_image").files[0]
        );
    }
    if(document.getElementById("medicine_excel_file").files[0]){
        formData.append(
            "medicine_excel_file",
            document.getElementById("medicine_excel_file").files[0]
        );
    }
    try{

        const response=await fetch('/api/add/medicine',{
            method:'POST',
            body:formData
        });
        const result=await response.json();
        if(result.success){
            alert(result.message);
            document.getElementById('medicineForm').reset();
            document.getElementById('medicineModal').style.display='none';
            loadMedicines();
        }
    }
    catch(error){
        console.log(error);
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
                            </tr>
                        </thead>
                        <tbody id="medicineTableBody">
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
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

        tbody.innerHTML = "";

        if(!result.success){
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:56px 24px;">
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

        const medicines = filterMedicineRecords(
            result.medicines,
            ["created_at", "updated_at"]
        );

        if(medicines.length === 0){
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:56px 24px;">
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
                            <th>Customer</th>
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
        const response = await fetch('/api/vendor/payments');
        const result = await response.json();

        let html = `
        <div id="paymentsSection">
            <div class="table-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Pharmacy Settlements & Payments</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Track payout transfers, bank settlement schedules, and transaction receipts</p>
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
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(result.success){
            const payments = filterMedicineRecords(
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
                        <td>${payment.payment_method || 'Direct Transfer'}</td>
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
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Payments Found</h4>
                            <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Pharmacy settlement disbursements will appear here.</p>
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
                        <h4 style="margin:0; font-size:16px; font-weight:700; color:var(--hk-text-main);">No Payments Found</h4>
                        <p style="margin:0; font-size:13px; color:var(--hk-text-muted); max-width:320px;">Pharmacy settlement disbursements will appear here.</p>
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
                        </tr>
                    </thead>
                    <tbody id="stockTableBody">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 30px; color: var(--hk-text-muted);">
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

        tbody.innerHTML = "";

        if(!result.success){
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:56px 24px;">
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
                    <td colspan="7" style="text-align:center; padding:56px 24px;">
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



