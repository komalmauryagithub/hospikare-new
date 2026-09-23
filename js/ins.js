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
        } else if(id === "bookingsBtn"){
            loadBookings();
        } else if(id === "customersBtn"){
            loadCustomers();
        } else if(id === "claimsBtn"){
            loadClaims();
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
                            </tr>
                        </thead>
                        <tbody>
            `;
            if(insurances.length === 0){
                html += `
                <tr>
                    <td colspan="9" class="noInsuranceData" style="text-align: center; padding: 20px;">
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
                openInsuranceModal
            );
        }
    }
    catch(error){
        console.log(error);
    }
}

function openInsuranceModal(){
    document.getElementById(
        "insuranceModal"
    ).style.display = "flex";
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
                const response =
                    await fetch(
                        "/api/add/insurance",
                        {
                            method:"POST",
                            body:formData
                        }
                    );
                const result =
                    await response.json();
                if(result.success){
                    alert(
                        "Insurance Added Successfully"
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
            ? `<a class="claimDocLink" href="/uploads/${encodeURIComponent(documentName)}" target="_blank" rel="noopener">View</a>`
            : "N/A";

        return `
            <tr>
                <td>${escapeHtml(claim.id)}</td>
                <td>
                    <strong>${escapeHtml(claim.full_name || "User")}</strong>
                    <div class="claimMuted">${escapeHtml(claim.phone || claim.email || "N/A")}</div>
                </td>
                <td>${escapeHtml(claim.policy_number || "N/A")}</td>
                <td>${escapeHtml(claim.plan_name || claim.comp_name || "N/A")}</td>
                <td>
                    <strong>${formatMoney(claim.claim_amount)}</strong>
                    <div class="claimMuted">${escapeHtml(claim.claim_reason || "No reason")}</div>
                </td>
                <td>${formatMoney(claim.coverage_amount)}</td>
                <td>${statusPill(status)}</td>
                <td>${documentLink}</td>
                <td>${formatDate(claim.created_at)}</td>
                <td>
                    <div class="claimActionGroup">
                        <button type="button" class="claimActionBtn approve" data-claim-id="${escapeHtml(claim.id)}" data-status="approved" ${status === "approved" ? "disabled" : ""}>Approve</button>
                        <button type="button" class="claimActionBtn reject" data-claim-id="${escapeHtml(claim.id)}" data-status="rejected" ${status === "rejected" ? "disabled" : ""}>Reject</button>
                        <button type="button" class="claimActionBtn pending" data-claim-id="${escapeHtml(claim.id)}" data-status="pending" ${status === "pending" ? "disabled" : ""}>Pending</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    tbody.querySelectorAll(".claimActionBtn").forEach(button => {
        button.addEventListener("click", () => updateClaimStatus(
            button.dataset.claimId,
            button.dataset.status,
            button
        ));
    });
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
        const activePolicies = customers.filter(customer => statusValue(customer.insurance_status, "active") === "active").length;
        const expiredPolicies = customers.filter(customer => statusValue(customer.insurance_status) === "expired").length;
        const cancelledPolicies = customers.filter(customer => statusValue(customer.insurance_status) === "cancelled").length;
        const otherPolicies = Math.max(totalCustomers - activePolicies - expiredPolicies - cancelledPolicies, 0);
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

            <!-- BENTO KPI METRIC GRID -->
            <div id="dashboardCards" class="grid-container" style="margin-bottom: 24px;">
                <div class="dashCard featured-card" data-dashboard-target="paymentsBtn">
                    <div class="card-icon icon-green"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Revenue</h3>
                            <span class="trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +17.8%</span>
                        </div>
                        <h1>${formatMoney(totalPayments)}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill green" style="width: 88%;"></div></div>
                            <div class="card-progress-info"><span>Annual Target: ₹10,00,000</span><span class="target-val">88% Reached</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="plansBtn">
                    <div class="card-icon icon-blue"><i class="fa-solid fa-shield-heart"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Active Plans</h3>
                            <span class="trend positive">Listed</span>
                        </div>
                        <h1>${totalPlans}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill" style="width: 95%;"></div></div>
                            <div class="card-progress-info"><span>Policy Portfolio</span><span class="target-val">Active</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="customersBtn">
                    <div class="card-icon icon-purple"><i class="fa-solid fa-users"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Customers</h3>
                            <span class="trend positive"><i class="fa-solid fa-check"></i> ${activePolicies} Active</span>
                        </div>
                        <h1>${totalCustomers}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill purple" style="width: 76%;"></div></div>
                            <div class="card-progress-info"><span>Subscriber Target</span><span class="target-val">76% Target</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard" data-dashboard-target="claimsBtn">
                    <div class="card-icon icon-orange"><i class="fa-solid fa-file-medical"></i></div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Pending Claims</h3>
                            <span class="trend ${pendingClaims > 0 ? 'warning' : 'positive'}">Review</span>
                        </div>
                        <h1>${pendingClaims}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill orange" style="width: 60%;"></div></div>
                            <div class="card-progress-info"><span>Resolution Rate</span><span class="target-val">94% Fast-Track</span></div>
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
                        select.innerHTML = '<option value="">Select Insurance Company...</option>';
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
