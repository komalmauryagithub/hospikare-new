const insuranceDashboardUi = createVendorDashboardUi({
    reload: () => loadDashboard()
});

insuranceDashboardUi.setupDateFilter();
loadDashboard();

window.addEventListener(
    "DOMContentLoaded",
    () => {

const customerSection =
    document.getElementById(
        "customerSection"
    );

if(customerSection){

    customerSection.style.display =
        "none";

}

    }
);

const paymentsSection =
    document.getElementById(
        "paymentsSection"
    );

if(paymentsSection){

    paymentsSection.style.display =
        "none";

}
async function fillProfileForm(profile, details = {}) {
    if (!profile) return;
    const nameField = document.getElementById("profileName");
    const emailField = document.getElementById("profileEmail");
    const userTypeField = document.getElementById("profileUserType");
    const bankField = document.getElementById("profileBank");
    const ifscField = document.getElementById("profileIfsc");

    if (nameField) nameField.value = profile.name || "";
    if (emailField) emailField.value = profile.email || profile.emailorcontact || "";
    if (userTypeField && profile.users_type) userTypeField.value = profile.users_type;
    if (bankField) bankField.value = profile.bank_account || "";
    if (ifscField) ifscField.value = profile.ifsc || "";

    const form = document.getElementById('vendorProfileForm');
    if (form) {
        const profileMap = {
            'company_name': profile.company_name,
            'name': profile.name,
            'contact_number': profile.contact_number,
            'email': profile.email || profile.emailorcontact,
            'business_address': profile.business_address,
            'bank_account': profile.bank_account,
            'ifsc': profile.ifsc,
            'business_reg_number': profile.business_reg_number,
            'service_area': profile.service_area,
            'service_24x7': profile.service_24x7
        };
        for (const [key, val] of Object.entries(profileMap)) {
            const input = form.querySelector('[name="' + key + '"]');
            if (input && input.type !== 'file') {
                input.value = val || "";
            }
        }
    }

    if (details) {
        for (const [key, value] of Object.entries(details)) {
            const input = document.querySelector('#vendorProfileForm [name="' + key + '"]');
            if (input && input.type !== 'file' && !input.value) {
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
            const vendorName = result.user?.name || result.details?.insurance_name || result.details?.company_name || "Vendor";
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
            const isEditRequested = Number(result.user?.edit_requested) === 1;
            const isEditAllowed = Number(result.user?.edit_allowed) === 1;
            if (window.setProfileMode) {
                if (!isComplete || isEditAllowed) {
                    window.setProfileMode('edit');
                } else {
                    window.setProfileMode('view');
                    if (isEditRequested) {
                        const reqBtn = document.getElementById('enableProfileEditBtn');
                        const bannerContainer = document.getElementById('profileStatusBannerContainer');
                        if (reqBtn) {
                            reqBtn.disabled = true;
                            reqBtn.innerHTML = '<i class="fa-solid fa-clock"></i> Edit Request Pending Admin Approval';
                            reqBtn.style.background = '#94a3b8';
                            reqBtn.style.boxShadow = 'none';
                            reqBtn.style.cursor = 'not-allowed';
                        }
                        if (bannerContainer) {
                            bannerContainer.innerHTML = '<div style="padding:12px 16px; background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; font-size:13px; color:#78350f; font-weight:500; display:flex; align-items:center; gap:10px; margin-bottom:12px;"><i class="fa-solid fa-hourglass-half" style="color:#d97706; font-size:18px;"></i><div style="flex:1;"><strong>Edit Request Pending Admin Approval.</strong> You have requested permission to update your vendor profile. Once Admin approves the request, the fields will become editable.</div></div>';
                        }
                    }
                }
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

document.getElementById("logoutBtn")?.addEventListener("click", logout);

async function logout(event){
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try{
        const response =
            await fetch(
                '/api/user/logout',
                {
                    method:'POST',
                    credentials: 'include'
                }
            );
        const result =
            await response.json();
        if(result.success){
            window.location.href =
                "/rg.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

function parseMoney(value){
    const amount = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value){
    return `Rs. ${parseMoney(value).toLocaleString("en-IN")}`;
}

function formatDate(value){
    if(!value){
        return "N/A";
    }

    const date = new Date(value);
    if(Number.isNaN(date.getTime())){
        return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function statusClass(value){
    const status = String(value || "pending").toLowerCase();

    if(status === "approved" || status === "active" || status === "paid" || status === "completed" || status === "success"){
        return "approved";
    }

    if(status === "rejected" || status === "expired" || status === "cancelled"){
        return "rejected";
    }

    return "pending";
}

function statusValue(value, fallback = "pending"){
    return String(value || fallback).toLowerCase();
}

function statusLabel(value, fallback = "pending"){
    const status = statusValue(value, fallback);
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusPill(value, fallback = "pending"){
    return `<span class="claimStatusPill ${statusClass(value || fallback)}">${escapeHtml(statusLabel(value, fallback))}</span>`;
}

function safeArray(value){
    return Array.isArray(value) ? value : [];
}

const navItems = document.querySelectorAll(".menuItem");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });
        item.classList.add("active");

        const id = item.id;
        if(id === "plansBtn"){
            loadInsurances();
        } else if(id === "companiesBtn"){
            loadCompanies();
        } else if(id === "bookingsBtn" || id === "policiesBtn"){
            loadBookings();
        } else if(id === "customersBtn"){
            loadCustomers();
        } else if(id === "claimsBtn"){
            loadClaims();
        } else if(id === "renewalsBtn"){
            loadRenewals();
        } else if(id === "paymentsBtn"){
            loadPayments();
        } else if(id === "dashboardBtn"){
            loadDashboard();
        }
    });
});


async function loadInsurances(){
    try{
        const response =
            await fetch(
                "/api/user/insurances"
            );
        const result =
            await response.json();
        if(result.success){
            const insurances =
                result.insurances;
            let html = `
            <div id="insuranceSection">
                <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="font-family: var(--font-heading);">My Insurance Plans</h2>
                    <button id="addPlanBtn" class="btn-base" style="background-color: var(--sidebar-active-bg); color: white;">
                        <i class="fa-solid fa-plus"></i> Add Plan
                    </button>
                </div>
                <div class="table-container" id="insuranceTableContainer">
                    <table id="insuranceTable" class="adminTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>IRDAI</th>
                                <th>GST</th>
                                <th>Claim Type</th>
                                <th>Claim Time</th>
                                <th>Support</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            if(insurances.length === 0){
                html += `
                <tr>
                    <td colspan="10" class="noInsuranceData" style="text-align: center; padding: 20px;">
                        No Insurance Plans Found
                    </td>
                </tr>
                `;
            }
            else{
                insurances.forEach(item=>{
                    html += `
                    <tr>
                        <td>${escapeHtml(item.id)}</td>
                        <td>${escapeHtml(item.comp_name || "N/A")}</td>
                        <td>${escapeHtml(item.comp_type || "N/A")}</td>
                        <td>${escapeHtml(item.irdai || "N/A")}</td>
                        <td>${escapeHtml(item.gst || "N/A")}</td>
                        <td>${escapeHtml(item.claim_type || "N/A")}</td>
                        <td>${escapeHtml(item.claim_time || "N/A")}</td>
                        <td>${escapeHtml(item.cust_sup_num || "N/A")}</td>
                        <td>${escapeHtml(item.email_sup || "N/A")}</td>
                        <td>
                            <button onclick="editInsurancePlan(${item.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Plan"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteInsurancePlan(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Plan"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                    `;
                });
            }
            html += `
                        </tbody>
                    </table>
                </div>
            </div>
            `;
            document.getElementById(
                "mainContainer"
            ).innerHTML = html;
            document.getElementById(
                "addPlanBtn"
            ).addEventListener(
                "click",
                function() {
                    const hiddenField = document.getElementById('edit_insurance_id');
                    if(hiddenField) hiddenField.value = '';
                    const modalHeader = document.querySelector('#insuranceModalHeader h2');
                    if(modalHeader) modalHeader.innerText = 'Add Insurance Plan';
                    document.getElementById('insuranceForm')?.reset();
                    openInsuranceModal();
                }
            );
        }
    }
    catch(error){
        console.log(error);
    }
}

async function openInsuranceModal(){
    document.getElementById(
        "insuranceModal"
    ).style.display = "flex";
    
    // Populate company dropdown
    try {
        const res = await fetch('/api/all-insurance-companies');
        const data = await res.json();
        const select = document.getElementById('planCompanySelect');
        if(select && data.success) {
            const currentVal = select.value;
            select.innerHTML = '<option value="">-- Select Company --</option>';
            data.data.forEach(c => {
                select.innerHTML += `<option value="${c.id}" ${c.id == currentVal ? 'selected' : ''}>${c.company_name}</option>`;
            });
        }
    } catch(e) { console.error(e); }
}

function closeInsuranceModal(){
    document.getElementById(
        "insuranceModal"
    ).style.display = "none";
}

document.addEventListener("submit",
    async function(e){
        if(e.target.id ==="insuranceForm")
        {
            e.preventDefault();
            try{
                const formData =
                    new FormData(
                        e.target
                    );
                const editId = document.getElementById('edit_insurance_id')?.value;
                const url = editId ? '/api/edit/insurance/' + editId : '/api/add/insurance';
                const method = editId ? 'PUT' : 'POST';
                const response =
                    await fetch(
                        url,
                        {
                            method: method,
                            body:formData
                        }
                    );
                const result =
                    await response.json();
                if(result.success){
                    alert(
                        editId ? "Insurance Plan Updated Successfully" : "Insurance Added Successfully"
                    );
                    closeInsuranceModal();
                    loadInsurances();
                }
                else{
                    alert(
                        result.message
                    );
                }
            }
            catch(error){
                console.log(error);
            }
        }
    }
);

async function loadBookings(){
    try{
        const response = await fetch('/api/insurance/bookings');
        const result = await response.json();
        const bookings = result.success ? safeArray(result.bookings) : [];

        document.getElementById("mainContainer").innerHTML = `
        <div id="bookingsSection">
            <div class="vendor-section-header">
                <div>
                    <h2>Insurance Bookings</h2>
                    <p>Policies purchased from your insurance plans</p>
                </div>
            </div>
            <div class="table-container" id="bookingsTableContainer">
                <table id="bookingsTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Plan</th>
                            <th>Policy Number</th>
                            <th>Coverage Amount</th>
                            <th>Premium Amount</th>
                            <th>Start</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.length ? bookings.map(booking => `
                            <tr>
                                <td>${escapeHtml(booking.id)}</td>
                                <td>
                                    <strong>${escapeHtml(booking.full_name || "User")}</strong>
                                    <div class="claimMuted">${escapeHtml(booking.phone || booking.email || `User #${booking.user_id || "N/A"}`)}</div>
                                </td>
                                <td>${escapeHtml(booking.plan_name || booking.comp_name || "N/A")}</td>
                                <td>${escapeHtml(booking.policy_number || "N/A")}</td>
                                <td>${formatMoney(booking.coverage_amount)}</td>
                                <td>${formatMoney(booking.premium_amount)}</td>
                                <td>${formatDate(booking.start_date)}</td>
                                <td>${formatDate(booking.expiry_date)}</td>
                                <td>${statusPill(booking.insurance_status, "active")}</td>
                                <td>${statusPill(booking.payment_status, "paid")}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="10" style="text-align: center; padding: 20px;">No Bookings Found</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
        `;
        return;
    } catch(error){
        console.log(error);
        document.getElementById("mainContainer").innerHTML = `
            <div class="table-container" style="padding:20px;">
                Bookings could not be loaded.
            </div>
        `;
        return;
    }

    try{
        const response = await fetch('/api/insurance/bookings');
        const result = await response.json();
        let html = `
        <div id="bookingsSection">
            <div style="margin-bottom: 16px;">
                <h2 style="font-family: var(--font-heading);">Insurance Bookings</h2>
            </div>
            <div class="table-container" id="bookingsTableContainer">
                <table id="bookingsTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User ID</th>
                            <th>Policy Number</th>
                            <th>Coverage Amount</th>
                            <th>Premium Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        if(result.success && result.bookings && result.bookings.length > 0){
            result.bookings.forEach(booking => {
                html += `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.user_id}</td>
                    <td>${booking.policy_number || 'N/A'}</td>
                    <td>₹${booking.coverage_amount || 0}</td>
                    <td>₹${booking.premium_amount || 0}</td>
                    <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${booking.insurance_status === 'Active' ? 'var(--trend-up-bg)' : 'var(--trend-down-bg)'}; color: ${booking.insurance_status === 'Active' ? 'var(--trend-up)' : 'var(--trend-down)'};">${booking.insurance_status || 'N/A'}</span></td>
                </tr>
                `;
            });
        } else {
            html += `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">No Bookings Found</td>
            </tr>
            `;
        }
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
        document.getElementById("mainContainer").innerHTML = html;
    } catch(error){
        console.log(error);
    }
}


async function loadCustomers(){

    try{
        const response = await fetch('/api/insurance/customers');
        const result = await response.json();
        const customers = result.success ? safeArray(result.customers) : [];

        document.getElementById("mainContainer").innerHTML = `
        <div id="customerSection">
            <div class="vendor-section-header">
                <div>
                    <h2>Insurance Customers</h2>
                    <p>Users with policies under your insurance plans</p>
                </div>
            </div>
            <div class="table-container" id="customerTableContainer">
                <table id="customerTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Plan</th>
                            <th>Policy</th>
                            <th>Coverage</th>
                            <th>Premium</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.length ? customers.map(customer => `
                            <tr>
                                <td>${escapeHtml(customer.id)}</td>
                                <td>${escapeHtml(customer.full_name || "User")}</td>
                                <td>${escapeHtml(customer.email || "N/A")}</td>
                                <td>${escapeHtml(customer.phone || "N/A")}</td>
                                <td>${escapeHtml(customer.plan_name || customer.comp_name || "N/A")}</td>
                                <td>${escapeHtml(customer.policy_number || "N/A")}</td>
                                <td>${formatMoney(customer.coverage_amount)}</td>
                                <td>${formatMoney(customer.premium_amount)}</td>
                                <td>${statusPill(customer.insurance_status, "active")}</td>
                                <td>${statusPill(customer.payment_status, "paid")}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="10" style="text-align: center; padding: 20px;">No Customers Found</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
        `;
        return;
    }
    catch(error){
        console.log(error);
        document.getElementById("mainContainer").innerHTML = `
            <div class="table-container" style="padding:20px;">
                Customers could not be loaded.
            </div>
        `;
        return;
    }

    try{

        const response =
            await fetch(
                '/api/insurance/customers'
            );

        const result =
            await response.json();

        let html = `
        <div id="customerSection">
            <div style="margin-bottom: 16px;">
                <h2 style="font-family: var(--font-heading);">Insurance Customers</h2>
            </div>
            <div class="table-container" id="customerTableContainer">
                <table id="customerTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Plan</th>
                            <th>Policy</th>
                            <th>Coverage</th>
                            <th>Premium</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(result.success && result.customers.length > 0){
            result.customers.forEach(customer => {
                html += `
                <tr>
                    <td>${customer.id}</td>
                    <td>${customer.full_name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.plan_name}</td>
                    <td>${customer.policy_number}</td>
                    <td>₹${customer.coverage_amount}</td>
                    <td>₹${customer.premium_amount}</td>
                    <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${customer.insurance_status.toLowerCase() === 'active' ? 'var(--trend-up-bg)' : 'var(--trend-down-bg)'}; color: ${customer.insurance_status.toLowerCase() === 'active' ? 'var(--trend-up)' : 'var(--trend-down)'};">${customer.insurance_status}</span></td>
                    <td><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${customer.payment_status.toLowerCase() === 'paid' ? 'var(--trend-up-bg)' : 'var(--trend-down-bg)'}; color: ${customer.payment_status.toLowerCase() === 'paid' ? 'var(--trend-up)' : 'var(--trend-down)'};">${customer.payment_status}</span></td>
                </tr>
                `;
            });
        } else {
            html += `
            <tr>
                <td colspan="10" style="text-align: center; padding: 20px;">No Customers Found</td>
            </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(error);

    }

}

async function loadClaims(){
    try{
        document.getElementById("mainContainer").innerHTML = `
        <div id="claimsSection">
            <div class="vendor-section-header">
                <div>
                    <h2>Insurance Claims</h2>
                    <p>Claims submitted for your insurance plans</p>
                </div>
                <button class="btn-base refreshClaimsBtn" type="button" id="refreshClaimsBtn">
                    <i class="fa-solid fa-rotate"></i> Refresh
                </button>
            </div>
            <div class="claimSummaryGrid" id="claimSummaryGrid"></div>
            <div class="table-container" id="claimsTableContainer">
                <table id="claimsTable" class="adminTable">
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Customer</th>
                            <th>Policy</th>
                            <th>Plan</th>
                            <th>Claim</th>
                            <th>Coverage</th>
                            <th>Status</th>
                            <th>Document</th>
                            <th>Submitted</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="claimsTableBody">
                        <tr>
                            <td colspan="10" style="text-align:center; padding:20px;">Loading claims...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;

        document.getElementById("refreshClaimsBtn")
            ?.addEventListener("click", loadClaims);

        const response = await fetch('/api/insurance/claims');
        const result = await response.json();

        if(!result.success){
            throw new Error(result.message || "Claims could not be loaded");
        }

        const claims = result.success && Array.isArray(result.claims)
            ? result.claims
            : [];

        renderClaimSummary(claims);
        renderClaimsTable(claims);
    }
    catch(error){
        console.log(error);
        document.getElementById("mainContainer").innerHTML = `
            <div class="table-container" style="padding:20px;">
                Claims could not be loaded.
            </div>
        `;
    }
}

function renderClaimSummary(claims){
    const summary = document.getElementById("claimSummaryGrid");
    if(!summary){
        return;
    }

    const pending = claims.filter(claim => String(claim.claim_status || "").toLowerCase() === "pending").length;
    const approved = claims.filter(claim => String(claim.claim_status || "").toLowerCase() === "approved").length;
    const rejected = claims.filter(claim => String(claim.claim_status || "").toLowerCase() === "rejected").length;

    summary.innerHTML = `
        <div class="claimSummaryCard">
            <span>Total Claims</span>
            <strong>${claims.length}</strong>
        </div>
        <div class="claimSummaryCard pending">
            <span>Pending</span>
            <strong>${pending}</strong>
        </div>
        <div class="claimSummaryCard approved">
            <span>Approved</span>
            <strong>${approved}</strong>
        </div>
        <div class="claimSummaryCard rejected">
            <span>Rejected</span>
            <strong>${rejected}</strong>
        </div>
    `;
}

function renderClaimsTable(claims){
    const tbody = document.getElementById("claimsTableBody");
    if(!tbody){
        return;
    }

    if(!claims.length){
        tbody.innerHTML = `
        <tr>
            <td colspan="10" style="text-align:center; padding:20px;">No Claims Found</td>
        </tr>
        `;
        return;
    }

    tbody.innerHTML = claims.map(claim => {
        const status = statusValue(claim.claim_status);
        const documentName = String(claim.medical_documents || "").replace(/^\/?uploads\//, "");
        const documentLink = documentName
            ? `<a class="claimDocLink" href="/uploads/${encodeURIComponent(documentName)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-medical"></i> View</a>`
            : "N/A";

        return `
            <tr>
                <td><strong>#${escapeHtml(claim.id)}</strong></td>
                <td>
                    <strong>${escapeHtml(claim.full_name || "User")}</strong>
                    <div class="claimMuted">${escapeHtml(claim.phone || claim.email || "N/A")}</div>
                </td>
                <td><code>${escapeHtml(claim.policy_number || "N/A")}</code></td>
                <td>${escapeHtml(claim.plan_name || claim.comp_name || "N/A")}</td>
                <td>
                    <strong>${formatMoney(claim.claim_amount)}</strong>
                    ${claim.approved_amount ? `<div style="font-size:11px;color:#10b981;font-weight:700;">Approved: ${formatMoney(claim.approved_amount)}</div>` : ''}
                    <div class="claimMuted">${escapeHtml(claim.claim_reason || "No reason")}</div>
                </td>
                <td>${formatMoney(claim.coverage_amount)}</td>
                <td>${statusPill(status)}</td>
                <td>${documentLink}</td>
                <td>${formatDate(claim.created_at)}</td>
                <td>
                    <button type="button" onclick="openVendorClaimModal(${claim.id},'${escapeHtml(claim.full_name||'User')}','${escapeHtml(claim.policy_number||'N/A')}','${escapeHtml(claim.claim_status||'pending')}',${parseFloat(claim.approved_amount)||0},'${escapeHtml(claim.admin_remarks||'')}')"
                        style="background:#2563eb; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;">
                        <i class="fa-solid fa-pen-to-square"></i> Process / Action
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}


async function updateClaimStatus(claimId, status, button){
    try{
        if(button){
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = "Saving...";
        }

        const response = await fetch('/api/insurance/claims/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                claim_id: claimId,
                status
            })
        });
        const result = await response.json();

        if(!result.success){
            alert(result.message || "Claim status could not be updated");
            return;
        }

        loadClaims();
    }
    catch(error){
        console.log(error);
        alert("Claim status could not be updated");
        if(button){
            button.disabled = false;
            button.textContent = button.dataset.originalText || statusLabel(status);
        }
    }
}

async function loadPayments(){
    try{
        const mainContent = document.getElementById("mainContainer") || document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">User Payments</h2>
                <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Payments received from users</p>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>User</th>
                            <th>Total Amount</th>
                            <th>Paid Amount</th>
                            <th>Balance</th>
                            <th>Payment Status</th>
                        </tr>
                    </thead>
                    <tbody id="paymentsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const response = await fetch('/api/insurance/bookings');
        const result = await response.json();
        const tbody = document.getElementById("paymentsTableBody");

        if(result.success && result.bookings && result.bookings.length > 0) {
            if(result.bookings.length === 0){
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No User Payments Found</td></tr>`;
            } else {
                result.bookings.forEach(booking => {
                    const totalAmt = parseFloat(booking.total_amount || booking.premium_amount || 0);
                    const paidAmt = parseFloat(booking.paid_amount || totalAmt);
                    const isPart = booking.payment_type === 'Part';
                    const balance = isPart ? Math.max(0, totalAmt - paidAmt) : 0;
                    let paymentBadge = isPart
                        ? `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#fff7ed; color:#ea580c;">Part Payment</span>`
                        : `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#f0fdf4; color:#16a34a;">Full Payment</span>`;
                    tbody.innerHTML += `
                    <tr>
                        <td>${booking.id}</td>
                        <td><span style="font-weight:600;">${booking.patient_name || booking.user_name || '-'}</span></td>
                        <td><span style="font-weight:600;">&#8377;${totalAmt}</span></td>
                        <td><span style="font-weight:600; color:#16a34a;">&#8377;${paidAmt}</span></td>
                        <td><span style="font-weight:600; color:#dc2626;">&#8377;${balance}</span></td>
                        <td>${paymentBadge}</td>
                    </tr>
                    `;
                });
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No User Payments Found</td></tr>`;
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
            const payouts = payoutsResult.payments;
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

    }
    catch(error){
        console.log(error);
    }
}
async function loadDashboard(){

    try{
        const [
            insuranceResponse,
            customerResponse,
            paymentResponse,
            claimResponse
        ] = await Promise.all([
            fetch('/api/user/insurances'),
            fetch('/api/insurance/customers'),
            fetch('/api/vendor/payments'),
            fetch('/api/insurance/claims')
        ]);

        const [
            insuranceResult,
            customerResult,
            paymentResult,
            claimResult
        ] = await Promise.all([
            insuranceResponse.json(),
            customerResponse.json(),
            paymentResponse.json(),
            claimResponse.json()
        ]);

        const insurances = insuranceDashboardUi.filterRecords(
            safeArray(insuranceResult.insurances),
            ["created_at"]
        );
        const customers = insuranceDashboardUi.filterRecords(
            safeArray(customerResult.customers),
            ["created_at", "start_date"]
        );
        const payments = insuranceDashboardUi.filterRecords(
            safeArray(paymentResult.payments),
            ["paid_at", "created_at"]
        );
        const claims = insuranceDashboardUi.filterRecords(
            safeArray(claimResult.claims),
            ["created_at"]
        );

        const totalPlans = insurances.length;
        const totalCustomers = customers.length;
        const totalClaims = claims.length;
        const pendingClaims = claims.filter(claim => statusValue(claim.claim_status) === "pending").length;
        const approvedClaims = claims.filter(claim => statusValue(claim.claim_status) === "approved" || statusValue(claim.claim_status) === "settled").length;
        const activePolicies = customers.filter(customer => statusValue(customer.insurance_status, "active") === "active").length;
        const expiredPolicies = customers.filter(customer => statusValue(customer.insurance_status) === "expired").length;
        const cancelledPolicies = customers.filter(customer => statusValue(customer.insurance_status) === "cancelled").length;
        const otherPolicies = Math.max(totalCustomers - activePolicies - expiredPolicies - cancelledPolicies, 0);
        const renewalDue = customers.filter(c => statusValue(c.insurance_status) === "expired" || (c.expiry_date && new Date(c.expiry_date) <= new Date())).length;
        const totalPayments = payments.reduce(
            (sum, payment) => sum + parseMoney(payment.amount),
            0
        );


        const emptyRow = (columns, message) => `
            <tr>
                <td colspan="${columns}" style="text-align:center; padding:20px; color:var(--text-muted);">${message}</td>
            </tr>
        `;

        document.getElementById("mainContainer").innerHTML = `
        <div id="dashboardPage">

            <!-- HEALTHCARE COMMAND CENTRE HERO BANNER -->
            <div class="hero-welcome-card">
                <div class="hero-text-content">
                    <h2>Welcome, <span class="vendor-display-name">${escapeHtml(currentVendorName)}</span> <i class="fa-solid fa-circle-check" style="color: #18B981; font-size: 18px;"></i></h2>
                    <p>Here’s what’s happening with your health insurance policies and claim settlements today.</p>
                </div>
                <div class="hero-quick-actions">
                    <button class="hero-btn" id="heroAddPlanBtn" onclick="document.getElementById('plansBtn').click(); document.getElementById('addPlanBtn')?.click();"><i class="fa-solid fa-plus"></i> Add Plan</button>
                    <button class="hero-btn" id="heroClaimsBtn" onclick="document.getElementById('claimsBtn').click();"><i class="fa-solid fa-file-medical"></i> Review Claims</button>
                </div>
            </div>

            <!-- BENTO KPI METRIC GRID (5 Specs: Total Policies, Active Policies, Pending Claims, Approved Claims, Renewal Due) -->
            <div id="dashboardCards" class="grid-container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="dashCard" data-dashboard-target="policiesBtn" style="cursor:pointer;">
                    <div class="card-icon icon-blue"><i class="fa-solid fa-shield"></i></div>
                    <div class="card-content">
                        <h3>Total Policies</h3>
                        <h1>${totalCustomers}</h1>
                        <span class="trend positive">All Time</span>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="policiesBtn" style="cursor:pointer;">
                    <div class="card-icon icon-green"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="card-content">
                        <h3>Active Policies</h3>
                        <h1>${activePolicies}</h1>
                        <span class="trend positive">Currently Active</span>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="claimsBtn" style="cursor:pointer;">
                    <div class="card-icon icon-orange"><i class="fa-solid fa-clock"></i></div>
                    <div class="card-content">
                        <h3>Pending Claims</h3>
                        <h1>${pendingClaims}</h1>
                        <span class="trend warning">Needs Action</span>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="claimsBtn" style="cursor:pointer;">
                    <div class="card-icon icon-green"><i class="fa-solid fa-file-circle-check"></i></div>
                    <div class="card-content">
                        <h3>Approved Claims</h3>
                        <h1>${approvedClaims}</h1>
                        <span class="trend positive">Settled / Approved</span>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="renewalsBtn" style="cursor:pointer;">
                    <div class="card-icon icon-purple"><i class="fa-solid fa-arrows-rotate"></i></div>
                    <div class="card-content">
                        <h3>Renewal Due</h3>
                        <h1>${renewalDue}</h1>
                        <span class="trend ${renewalDue > 0 ? 'warning' : 'positive'}">Expired / Due</span>
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
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Earnings Overview</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Monthly premium collected</p>
                            </div>
                        </div>
                        <span class="status-badge" style="background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); font-size: 12px; font-weight: 700;">₹ Premium Stream</span>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%;">
                        <canvas id="earningsChart"></canvas>
                    </div>
                </div>

                <div class="chartWrapper" data-dashboard-target="customersBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(25, 191, 211, 0.1); color: var(--hk-cyan); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-pie"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Policy Status</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Active vs Lapsed vs Expired</p>
                            </div>
                        </div>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%; display: flex; align-items: center; justify-content: center;">
                        <canvas id="policyChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="insuranceDashboardTables">
                <div class="table-container" data-dashboard-target="customersBtn">
                    <div class="tableTitleBar">
                        <h3>Recent Customers</h3>
                    </div>
                    <table class="adminTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Plan</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customers.length ? customers.slice(0,5).map(customer => `
                                <tr>
                                    <td>${escapeHtml(customer.id)}</td>
                                    <td>${escapeHtml(customer.full_name || "User")}</td>
                                    <td>${escapeHtml(customer.plan_name || customer.comp_name || "N/A")}</td>
                                    <td>${statusPill(customer.insurance_status, "active")}</td>
                                </tr>
                            `).join("") : emptyRow(4, "No customers yet")}
                        </tbody>
                    </table>
                </div>

                <div class="table-container" data-dashboard-target="claimsBtn">
                    <div class="tableTitleBar">
                        <h3>Recent Claims</h3>
                    </div>
                    <table class="adminTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Claim</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${claims.length ? claims.slice(0,5).map(claim => `
                                <tr>
                                    <td>${escapeHtml(claim.id)}</td>
                                    <td>${escapeHtml(claim.full_name || "User")}</td>
                                    <td>${formatMoney(claim.claim_amount)}</td>
                                    <td>${statusPill(claim.claim_status)}</td>
                                </tr>
                            `).join("") : emptyRow(4, "No claims submitted")}
                        </tbody>
                    </table>
                </div>

                <div class="table-container" data-dashboard-target="paymentsBtn">
                    <div class="tableTitleBar">
                        <h3>Recent Payouts</h3>
                    </div>
                    <table class="adminTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.length ? payments.slice(0,5).map(payment => `
                                <tr>
                                    <td>${escapeHtml(payment.id)}</td>
                                    <td>${formatMoney(payment.amount)}</td>
                                    <td>${statusPill(payment.payout_status, "pending")}</td>
                                </tr>
                            `).join("") : emptyRow(3, "No payouts found")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;

        insuranceDashboardUi.setupLinks(
            document.getElementById("dashboardPage")
        );

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#94A3B8" : "#64748B";
        const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";
        const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

        if(window.insEarningsChartInstance) {
            window.insEarningsChartInstance.destroy();
            window.insEarningsChartInstance = null;
        }
        if(window.insPolicyChartInstance) {
            window.insPolicyChartInstance.destroy();
            window.insPolicyChartInstance = null;
        }

        // Aggregate monthly payments
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const curMonthIdx = new Date().getMonth();
        const past6Months = [];
        const past6Revenue = [];
        for (let i = 5; i >= 0; i--) {
            const mIdx = (curMonthIdx - i + 12) % 12;
            past6Months.push(monthNames[mIdx]);
            past6Revenue.push(0);
        }

        payments.forEach(p => {
            const dateStr = p.paid_at || p.created_at;
            if (dateStr) {
                const pMonth = new Date(dateStr).getMonth();
                for (let i = 0; i < 6; i++) {
                    if (monthNames[(curMonthIdx - (5 - i) + 12) % 12] === monthNames[pMonth]) {
                        past6Revenue[i] += Number(p.amount || 0);
                    }
                }
            }
        });

        if (past6Revenue.every(v => v === 0) && totalPayments > 0) {
            past6Revenue[5] = totalPayments;
        }

        const earningsChart = document.getElementById('earningsChart');
        if(window.Chart && earningsChart){
            const chartCtx = earningsChart.getContext('2d');
            let grad = chartCtx.createLinearGradient(0, 0, 0, 250);
            grad.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.18)');
            grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

            window.insEarningsChartInstance = new Chart(
                earningsChart,
                {
                    type:'line',
                    data:{
                        labels: past6Months,
                        datasets:[{
                            label:'Revenue (₹)',
                            data: past6Revenue,
                            borderColor:'#2563EB',
                            backgroundColor: grad,
                            borderWidth: 2.5,
                            tension:0.38,
                            fill:true,
                            pointBackgroundColor: '#2563EB',
                            pointBorderColor: surfaceColor,
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 7
                        }]
                    },
                    options:{
                        responsive:true,
                        maintainAspectRatio:false,
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
                                    label: ctx => ` Revenue: ₹${Number(ctx.parsed.y).toLocaleString('en-IN')}`
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
                }
            );
        }

        const policyChart = document.getElementById('policyChart');
        if(window.Chart && policyChart){
            const totalStatusCount = activePolicies + expiredPolicies + cancelledPolicies + otherPolicies;
            const chartData = totalStatusCount > 0 ? [activePolicies, expiredPolicies, cancelledPolicies, otherPolicies] : [1, 0, 0, 0];
            const chartColors = totalStatusCount > 0 ? ['#059669', '#D97706', '#DC2626', '#64748B'] : ['#64748B', '#64748B', '#64748B', '#64748B'];

            window.insPolicyChartInstance = new Chart(
                policyChart,
                {
                    type:'doughnut',
                    data:{
                        labels:['Active','Expired','Cancelled','Other'],
                        datasets:[{
                            data: chartData,
                            backgroundColor: chartColors,
                            borderWidth: 3,
                            borderColor: surfaceColor,
                            hoverBorderColor: surfaceColor,
                            hoverBorderWidth: 4,
                            hoverOffset: 8,
                            borderRadius: 6,
                            spacing: 3
                        }]
                    },
                    options:{
                        responsive:true,
                        maintainAspectRatio:false,
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
                                cornerRadius: 10,
                                callbacks: {
                                    label: ctx => totalStatusCount === 0 ? ' No data available' : ` ${ctx.label}: ${ctx.parsed} policies`
                                }
                            }
                        }
                    }
                }
            );
        }

        return;
    }
    catch(error){
        console.log(error);
        document.getElementById("mainContainer").innerHTML = `
            <div class="table-container" style="padding:20px;">
                Dashboard could not be loaded.
            </div>
        `;
        return;
    }
}

// Re-render insurance charts on theme toggle
window.addEventListener("hk-theme-change", () => {
    const dashSec = document.getElementById("dashboardPage");
    if (dashSec && dashSec.style.display !== "none") {
        loadDashboard();
    }
});





window.openAddCompanyModal = function() {
    document.getElementById('companyForm').reset();
    document.getElementById('company_id').value = '';
    document.getElementById('companyModalTitle').innerText = 'Add Insurance Company';
    document.getElementById('companyModal').style.display = 'flex';
};

window.editCompany = async function(id) {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        if(data.success) {
            const company = data.data.find(c => c.id == id);
            if(company) {
                const form = document.getElementById('companyForm');
                form.reset();
                document.getElementById('company_id').value = company.id;
                document.getElementById('companyModalTitle').innerText = 'Edit Insurance Company';
                
                const fields = [
                    'company_name', 'company_type', 'contact_person', 'mobile_number', 'email', 'website',
                    'full_address', 'city', 'state', 'pincode', 'insurance_tpa_name', 'policy_types',
                    'cashless_available', 'claim_support', 'network_hospitals', 'status', 'verification_status'
                ];
                
                fields.forEach(f => {
                    if(form.elements[f]) form.elements[f].value = company[f] || '';
                });
                
                document.getElementById('companyModal').style.display = 'flex';
            }
        }
    } catch(e) {
        console.error(e);
    }
};

window.deleteCompany = async function(id) {
    if(!confirm('Are you sure you want to delete this company?')) return;
    try {
        const res = await fetch('/api/vendor/delete-insurance-company/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            loadCompanies();
        } else {
            alert('Error deleting company');
        }
    } catch(e) {
        console.error(e);
    }
};

window.loadCompanies = async function() {
    try {
        const res = await fetch('/api/vendor/insurance-companies');
        const data = await res.json();
        
        let html = `
        <div id="companiesSection" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                <div>
                    <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--hk-text-main); margin:0 0 4px;">Insurance Companies</h2>
                    <p style="margin:0; font-size:13px; color:var(--hk-text-muted);">Manage partnered insurance companies</p>
                </div>
                <button onclick="openAddCompanyModal()" style="padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-plus"></i> Add Company
                </button>
            </div>
            
            <div class="table-wrapper" style="overflow-x:auto; background:white; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                <table class="adminTable" style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Type</th>
                            <th>Contact Person</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(c => {
                html += `
                <tr>
                    <td style="padding:16px;">#${c.id}</td>
                    <td style="padding:16px; font-weight:600;">${c.company_name}</td>
                    <td style="padding:16px;">${c.company_type || '-'}</td>
                    <td style="padding:16px;">${c.contact_person || '-'} <br><small style="color:gray;">${c.mobile_number || ''}</small></td>
                    <td style="padding:16px;">
                        <span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${c.status === 'Active' ? '#dcfce7' : '#f1f5f9'}; color: ${c.status === 'Active' ? '#166534' : '#475569'};">${c.status || 'Active'}</span>
                    </td>
                    <td style="padding:16px;">
                        <button onclick="editCompany(${c.id})" style="background:none; border:none; color:#2563eb; cursor:pointer; margin-right:10px;" title="Edit Company"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteCompany(${c.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Company"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="6" style="text-align:center; padding:30px; color:gray;">No insurance companies found. Click 'Add Company' to create one.</td></tr>`;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        document.getElementById('mainContainer').innerHTML = html;
        
    } catch(e) {
        console.error(e);
        document.getElementById('mainContainer').innerHTML = '<div style="padding:20px; color:red;">Error loading companies</div>';
    }
};

// Also we need to bind the submit handler for companyForm ONLY IF IT DOESN'T EXIST!
document.addEventListener('DOMContentLoaded', () => {
    const cf = document.getElementById('companyForm');
    if(cf && !cf.hasAttribute('data-bound')) {
        cf.setAttribute('data-bound', 'true');
        cf.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const editId = document.getElementById('company_id').value;
            const url = editId ? '/api/vendor/edit-insurance-company/' + editId : '/api/vendor/add-insurance-company';
            
            try {
                const res = await fetch(url, { method: editId ? 'PUT' : 'POST', body: formData }); // actually edit API might be PUT, let me check server.js!
                // Ah, the edit API in server.js says: app.put('/api/vendor/edit-insurance-company/:id'
                // Wait! Since we are uploading files using FormData, usually you can't easily PUT files unless you do fetch with PUT. fetch(url, {method: 'PUT', body: formData}) DOES work!
                const resData = await res.json();
                if (resData.success) {
                    alert(resData.message || 'Saved successfully');
                    document.getElementById('companyModal').style.display = 'none';
                    if(document.getElementById('companiesSection')) loadCompanies();
                } else {
                    alert(resData.message || 'Error saving');
                }
            } catch(error) {
                console.error(error);
                alert('An error occurred');
            }
        });
    }
});


// ====== INSURANCE PLAN EDIT/DELETE ======
window.editInsurancePlan = async function(id) {
    try {
        const res = await fetch('/api/user/insurances');
        const data = await res.json();
        if(data.success) {
            const plan = data.insurances.find(p => p.id == id);
            if(plan) {
                const form = document.getElementById('insuranceForm');
                form.reset();
                
                // Set hidden edit id
                let hiddenField = document.getElementById('edit_insurance_id');
                if(!hiddenField) {
                    hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.id = 'edit_insurance_id';
                    hiddenField.name = 'edit_insurance_id';
                    form.prepend(hiddenField);
                }
                hiddenField.value = plan.id;
                
                // Map DB fields to form field names
                const fieldMap = {
                    'comp_type': 'comp_type',
                    'description': 'ins_description',
                    'irdai': 'irdai_number',
                    'comp_pan': 'comp_pan',
                    'gst': 'gst_number',
                    'offc_add': 'ins_address',
                    'claim_type': 'claim_type',
                    'doc_req': 'required_docs',
                    'claim_time': 'claim_approval_time',
                    'cust_sup_num': 'contact_number',
                    'email_sup': 'ins_email',
                    'company_id': 'company_id'
                };
                
                Object.keys(fieldMap).forEach(dbField => {
                    const formField = fieldMap[dbField];
                    if(form.elements[formField]) {
                        form.elements[formField].value = plan[dbField] || '';
                    }
                });
                
                // Update modal title
                const modalHeader = document.querySelector('#insuranceModalHeader h2');
                if(modalHeader) modalHeader.innerText = 'Edit Insurance Plan';
                
                // Show modal
                document.getElementById('insuranceModal').style.display = 'flex';
            }
        }
    } catch(e) {
        console.error(e);
    }
};

window.deleteInsurancePlan = async function(id) {
    if(!confirm('Are you sure you want to delete this insurance plan?')) return;
    try {
        const res = await fetch('/api/delete/insurance/' + id, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
            alert('Plan deleted successfully!');
            loadInsurances();
        } else {
            alert(data.message || 'Error deleting plan');
        }
    } catch(e) {
        console.error(e);
    }
};

// ==================== VENDOR RENEWALS & CLAIM ACTION HANDLERS ====================

async function loadRenewals() {
    try {
        const response = await fetch('/api/insurance/customers');
        const result = await response.json();
        const policies = result.success ? safeArray(result.customers) : [];

        document.getElementById("mainContainer").innerHTML = `
        <div id="renewalsSection">
            <div class="vendor-section-header">
                <div>
                    <h2>Policy Renewals</h2>
                    <p>Track policy expiry dates, renewal amounts, and statuses</p>
                </div>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>Policy Number</th>
                            <th>Customer Name</th>
                            <th>Expiry Date</th>
                            <th>Renewal Amount</th>
                            <th>Renewal Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${policies.length ? policies.map(p => {
                            const isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
                            const renewalStatus = isExpired ? 'Renewal Due' : (p.insurance_status || 'Active');
                            const badgeColor = isExpired ? '#ef4444' : '#10b981';
                            const badgeBg = isExpired ? '#fef2f2' : '#ecfdf5';
                            return `
                                <tr>
                                    <td><code>${escapeHtml(p.policy_number || 'N/A')}</code></td>
                                    <td>
                                        <strong>${escapeHtml(p.full_name || 'User')}</strong>
                                        <div class="claimMuted">${escapeHtml(p.email || p.phone || '')}</div>
                                    </td>
                                    <td><strong>${formatDate(p.expiry_date)}</strong></td>
                                    <td><strong>${formatMoney(p.premium_amount)}</strong></td>
                                    <td>
                                        <span style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeColor}; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:800; text-transform:uppercase;">
                                            ${escapeHtml(renewalStatus)}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join("") : `
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 20px;">No Policy Renewals Found</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    } catch(e) {
        console.error('loadRenewals error:', e);
    }
}

window.openVendorClaimModal = function(claimId, patientName, policyNum, currentStatus, approvedAmt, remarks) {
    document.getElementById('vendorClaimModalId').value = claimId;
    document.getElementById('vendorClaimModalInfo').innerHTML =
        `Claim #${claimId} &bull; <strong>${escapeHtml(patientName)}</strong> &bull; Policy: <code>${escapeHtml(policyNum)}</code>`;
    document.getElementById('vendorClaimStatusSelect').value = currentStatus || 'pending';
    document.getElementById('vendorClaimApprovedAmount').value = approvedAmt > 0 ? approvedAmt : '';
    document.getElementById('vendorClaimRemarks').value = remarks || '';
    document.getElementById('vendorClaimModalError').style.display = 'none';
    document.getElementById('vendorClaimActionModal').style.display = 'flex';
};

window.submitVendorClaimUpdate = async function() {
    const claimId = document.getElementById('vendorClaimModalId').value;
    const status = document.getElementById('vendorClaimStatusSelect').value;
    const approvedAmount = document.getElementById('vendorClaimApprovedAmount').value;
    const adminRemarks = document.getElementById('vendorClaimRemarks').value;
    const errEl = document.getElementById('vendorClaimModalError');
    errEl.style.display = 'none';

    try {
        const res = await fetch('/api/insurance/claims/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                claim_id: claimId,
                status: status,
                approved_amount: approvedAmount || null,
                admin_remarks: adminRemarks || null
            })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('vendorClaimActionModal').style.display = 'none';
            loadClaims();
        } else {
            errEl.textContent = data.message || 'Failed to update claim.';
            errEl.style.display = 'block';
        }
    } catch(e) {
        console.error(e);
        errEl.textContent = 'Server error occurred.';
        errEl.style.display = 'block';
    }
};



function openProfileModal() { const modal = document.getElementById('profileModal'); if (modal) modal.style.display = 'flex'; }
function closeProfileModal() { const modal = document.getElementById('profileModal'); if (modal) modal.style.display = 'none'; }

document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('saveProfileBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Saving...'; }
    try {
        const response = await fetch('/api/user/profile', { method: 'PUT', body: formData });
        const result = await response.json();
        if (result.success) {
            alert('Profile updated successfully!');
            closeProfileModal();
            if (typeof loadUserProfile === 'function') loadUserProfile();
        } else {
            alert(result.message || 'Profile update failed');
        }
    } catch (e) {
        alert('An error occurred.');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Save Profile'; }
    }
});
