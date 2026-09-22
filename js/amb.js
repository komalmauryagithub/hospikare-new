let appliedDashboardDateFrom = "";
let appliedDashboardDateTo = "";
let appliedDashboardRangeLabel = "All Time";

function formatDashboardDate(value) {
    if (!value) {
        return "";
    }

    const [year, month, day] =
        value.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatDashboardMonth(value) {
    if (!value) {
        return "";
    }

    const [year, month] =
        value.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        1
    ).toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}

function padDashboardDatePart(value) {
    return String(value).padStart(2, "0");
}

function getDashboardMonthRange(value) {
    const [year, month] =
        value.split("-").map(Number);
    const lastDay =
        new Date(year, month, 0).getDate();

    return {
        from:
            `${year}-${padDashboardDatePart(month)}-01`,
        to:
            `${year}-${padDashboardDatePart(month)}-${padDashboardDatePart(lastDay)}`
    };
}

function getDashboardDateRangeLabel(from, to) {
    if (from && to) {
        return from === to
            ? formatDashboardDate(from)
            : `${formatDashboardDate(from)} - ${formatDashboardDate(to)}`;
    }

    if (from) {
        return `From ${formatDashboardDate(from)}`;
    }

    if (to) {
        return `Up to ${formatDashboardDate(to)}`;
    }

    return "All Time";
}

function normalizeDashboardRecordDate(value) {
    if (!value) {
        return "";
    }

    const match =
        String(value).match(/\d{4}-\d{2}-\d{2}/);

    return match ? match[0] : "";
}

function isWithinDashboardDateRange(value) {
    if (!appliedDashboardDateFrom && !appliedDashboardDateTo) {
        return true;
    }

    const recordDate =
        normalizeDashboardRecordDate(value);

    if (!recordDate) {
        return false;
    }

    if (
        appliedDashboardDateFrom
        && recordDate < appliedDashboardDateFrom
    ) {
        return false;
    }

    if (
        appliedDashboardDateTo
        && recordDate > appliedDashboardDateTo
    ) {
        return false;
    }

    return true;
}

function filterDashboardRecords(records, dateFields) {
    if (!Array.isArray(records)) {
        return [];
    }

    return records.filter(record => {
        const dateValue =
            dateFields
                .map(field => record[field])
                .find(Boolean);

        return isWithinDashboardDateRange(dateValue);
    });
}

function reloadCurrentAmbulancePanel() {
    const activeId =
        document.querySelector(".menuItem.active")?.id
        || "dashboardBtn";

    if (activeId === "ambulancesBtn") {
        loadAmbulances();
    }
    else if (activeId === "availabilityBtn") {
        loadAmbulanceAvailability();
    }
    else if (activeId === "bookingsBtn") {
        loadBookings();
    }
    else if (activeId === "paymentsBtn") {
        loadPayments();
    }
    else if (activeId === "driversBtn") {
        loadDrivers();
    }
    else {
        loadDashboard();
    }
}

function setupDashboardDateFilter() {
    const dashboardDateFilterBtn =
        document.getElementById("dashboardDateFilterBtn");
    const dashboardDateFilterPanel =
        document.getElementById("dashboardDateFilterPanel");
    const dashboardDateFilterText =
        document.getElementById("dashboardDateFilterText");
    const dashboardDateFrom =
        document.getElementById("dashboardDateFrom");
    const dashboardDateTo =
        document.getElementById("dashboardDateTo");
    const dashboardDateMonth =
        document.getElementById("dashboardDateMonth");
    const dashboardDateYear =
        document.getElementById("dashboardDateYear");
    const dashboardDateModeInputs =
        document.querySelectorAll(
            "input[name='dashboardDateFilterMode']"
        );
    const dashboardDateModeFields =
        document.querySelectorAll(
            "#dashboardDateFilterPanel [data-date-mode-field]"
        );
    const dashboardDateFilterError =
        document.getElementById("dashboardDateFilterError");
    const applyDashboardDateFilterBtn =
        document.getElementById("applyDashboardDateFilter");
    const clearDashboardDateFilterBtn =
        document.getElementById("clearDashboardDateFilter");

    if (
        !dashboardDateFilterBtn
        || !dashboardDateFilterPanel
        || !dashboardDateFilterText
    ) {
        return;
    }

    function getDashboardSelectedDateMode() {
        const selected =
            document.querySelector(
                "input[name='dashboardDateFilterMode']:checked"
            );

        return selected ? selected.value : "date";
    }

    function setDashboardDateMode(mode) {
        dashboardDateModeFields.forEach(field => {
            field.hidden =
                field.dataset.dateModeField !== mode;
        });

        if (dashboardDateFilterError) {
            dashboardDateFilterError.innerText = "";
        }
    }

    function setDashboardDatePanelOpen(isOpen) {
        dashboardDateFilterPanel.hidden = !isOpen;
        dashboardDateFilterBtn.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }

    function updateDashboardRangeLabel() {
        dashboardDateFilterText.innerText =
            appliedDashboardRangeLabel;
    }

    function populateDashboardYears() {
        if (!dashboardDateYear) {
            return;
        }

        const currentYear =
            new Date().getFullYear();

        dashboardDateYear.innerHTML =
            `<option value="">Select year</option>`;

        for (
            let year = currentYear + 1;
            year >= currentYear - 8;
            year--
        ) {
            dashboardDateYear.innerHTML +=
                `<option value="${year}">${year}</option>`;
        }
    }

    function applyDashboardDateFilter() {
        const selectedMode =
            getDashboardSelectedDateMode();
        let nextDateFrom = "";
        let nextDateTo = "";
        let nextRangeLabel = "All Time";

        if (selectedMode === "date") {
            if (
                dashboardDateFrom.value
                && dashboardDateTo.value
                && dashboardDateFrom.value > dashboardDateTo.value
            ) {
                dashboardDateFilterError.innerText =
                    "From Date cannot be after To Date.";
                return;
            }

            nextDateFrom =
                dashboardDateFrom.value;
            nextDateTo =
                dashboardDateTo.value;
            nextRangeLabel =
                getDashboardDateRangeLabel(
                    nextDateFrom,
                    nextDateTo
                );
        }
        else if (selectedMode === "month") {
            if (!dashboardDateMonth.value) {
                dashboardDateFilterError.innerText =
                    "Please select a month.";
                return;
            }

            const range =
                getDashboardMonthRange(
                    dashboardDateMonth.value
                );

            nextDateFrom = range.from;
            nextDateTo = range.to;
            nextRangeLabel =
                formatDashboardMonth(
                    dashboardDateMonth.value
                );
        }
        else if (selectedMode === "year") {
            if (!dashboardDateYear.value) {
                dashboardDateFilterError.innerText =
                    "Please select a year.";
                return;
            }

            nextDateFrom =
                `${dashboardDateYear.value}-01-01`;
            nextDateTo =
                `${dashboardDateYear.value}-12-31`;
            nextRangeLabel =
                `Year ${dashboardDateYear.value}`;
        }

        if (dashboardDateFilterError) {
            dashboardDateFilterError.innerText = "";
        }

        appliedDashboardDateFrom = nextDateFrom;
        appliedDashboardDateTo = nextDateTo;
        appliedDashboardRangeLabel = nextRangeLabel;

        updateDashboardRangeLabel();
        setDashboardDatePanelOpen(false);
        reloadCurrentAmbulancePanel();
    }

    dashboardDateFilterBtn.addEventListener(
        "click",
        () => {
            setDashboardDatePanelOpen(
                dashboardDateFilterPanel.hidden
            );
        }
    );

    dashboardDateModeInputs.forEach(input => {
        input.addEventListener(
            "change",
            () => setDashboardDateMode(input.value)
        );
    });

    applyDashboardDateFilterBtn?.addEventListener(
        "click",
        applyDashboardDateFilter
    );

    clearDashboardDateFilterBtn?.addEventListener(
        "click",
        () => {
            dashboardDateFrom.value = "";
            dashboardDateTo.value = "";
            dashboardDateMonth.value = "";
            dashboardDateYear.value = "";
            appliedDashboardDateFrom = "";
            appliedDashboardDateTo = "";
            appliedDashboardRangeLabel = "All Time";

            if (dashboardDateFilterError) {
                dashboardDateFilterError.innerText = "";
            }

            updateDashboardRangeLabel();
            setDashboardDatePanelOpen(false);
            reloadCurrentAmbulancePanel();
        }
    );

    [
        dashboardDateFrom,
        dashboardDateTo,
        dashboardDateMonth,
        dashboardDateYear
    ]
        .filter(Boolean)
        .forEach(input => {
            input.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Enter") {
                        applyDashboardDateFilter();
                    }
                }
            );
        });

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    ".dashboard-date-filter"
                )
            ) {
                setDashboardDatePanelOpen(false);
            }
        }
    );

    populateDashboardYears();
    setDashboardDateMode(
        getDashboardSelectedDateMode()
    );
    updateDashboardRangeLabel();
}

setupDashboardDateFilter();
loadDashboard();

window.dashboardInterval = setInterval(() => {
    loadDashboard();
}, 5000);

document.getElementById("availabilitySection").style.display = "none";
document.getElementById("ambulanceSection").style.display = "none";
document.getElementById("bookingsSection").style.display = "none";
document.getElementById("paymentsSection").style.display = "none";
    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";
    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";
document.getElementById("dashboardSection").style.display = "block";

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




async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await response.json();
        if(result.success){
            const vendorName = result.user?.company_name || result.user?.name || result.details?.ambulance_service_name || result.details?.vendor_name || "Ambulance Partner";
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = `Welcome ${vendorName}`;
            
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });

            const profileNameEl = document.querySelector('.profile-name');
            if (profileNameEl) profileNameEl.innerText = vendorName;

            const isCompleted = Boolean(result.user?.vendor_profile_completed);
            const triggerText = document.getElementById('profileTriggerText');
            const triggerIcon = document.getElementById('profileSectionTrigger')?.querySelector('i');
            if (triggerText) {
                triggerText.innerText = isCompleted ? 'Show Profile' : 'Complete Profile';
            }
            if (triggerIcon) {
                triggerIcon.className = isCompleted ? 'fa-solid fa-id-card' : 'fa-solid fa-user-pen';
                triggerIcon.style.color = isCompleted ? '#10b981' : '#3b82f6';
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

document.getElementById("logoutBtn")?.addEventListener("click", logout);
async function logout(event){
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try{
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            credentials: 'include'
        });
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

function openAmbulanceSection(section, activeItem) {
    navItems.forEach(nav => {
        nav.classList.toggle("active", nav === activeItem);
    });

    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("ambulanceSection").style.display = "none";
    document.getElementById("availabilitySection").style.display = "none";
    document.getElementById("bookingsSection").style.display = "none";
    document.getElementById("paymentsSection").style.display = "none";
    if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "none";
    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";

    if (section === "dashboard") {
        document.getElementById("dashboardSection").style.display = "block";
        loadDashboard();
    }
    else if (section === "ambulances") {
        document.getElementById("ambulanceSection").style.display = "block";
        loadAmbulances();
    }
    else if (section === "availability") {
        document.getElementById("availabilitySection").style.display = "block";
        loadAmbulanceAvailability();
    }
    else if (section === "bookings") {
        document.getElementById("bookingsSection").style.display = "block";
        loadBookings();
    }
    else if (section === "payments") {
        document.getElementById("paymentsSection").style.display = "block";
        loadPayments();
    }
    else if (section === "drivers") {
        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";
        loadDrivers();
    }
    else if (section === "livemap") {
        if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "flex";
        if(typeof initFleetMap === "function") initFleetMap();
    }
}

navItems.forEach(item => {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    item.addEventListener(
        "click",
        () => openAmbulanceSection(item.dataset.section, item)
    );

    item.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Enter"
                || event.key === " "
            ) {
                event.preventDefault();
                item.click();
            }
        }
    );
});

function openAmbulanceListSection() {
    document.getElementById("ambulancesBtn")?.click();
}

function setupDashboardCardLinks() {
    document.querySelectorAll(".dashboard-link")
        .forEach(item => {
            const target =
                document.getElementById(
                    item.dataset.dashboardTarget
                );

            if (!target) {
                return;
            }

            item.classList.add("clickable-card");
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");

            const openTarget = () => target.click();

            item.addEventListener("click", openTarget);
            item.addEventListener(
                "keydown",
                event => {
                    if (
                        event.key === "Enter"
                        || event.key === " "
                    ) {
                        event.preventDefault();
                        openTarget();
                    }
                }
            );
        });
}

setupDashboardCardLinks();

async function loadBookings(){
    try{
        const response = await fetch('/api/ambulance/bookings');
        const result =
        await response.json();
        const tbody =
        document.getElementById(
            "bookingsTableBody"
        );
        tbody.innerHTML = "";
        if(result.success){
            const bookings =
                filterDashboardRecords(
                    result.bookings,
                    ["booking_date", "created_at"]
                );

            if(
                bookings.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td colspan="11">
                        No Bookings Found
                    </td>
                </tr>
                `;
                return;
            }
            bookings.forEach(
                booking => {
                    tbody.innerHTML += `
                    <tr>
                        <td>
                            ${booking.id}
                        </td>
                        <td>
                            ${booking.patient_name}
                        </td>
                        <td>
                            ${booking.patient_condition}
                        </td>
                        <td>
                            ${booking.pickup_address}
                        </td>
                        <td>
                            ${booking.destination_address}
                        </td>
                        <td>
                            ${
                                new Date(
                                    booking.booking_date
                                ).toLocaleString()
                            }
                        </td>
                        <td>
                            ₹${booking.total_amount}
                        </td>
                        <td>
                            ${
                                new Date(
                                    booking.created_at
                                ).toLocaleDateString()
                            }
                        </td>
                        <td>
                            <select
                                id="booking_status_${booking.id}"
                                class="bookingSelect"
                            >
                                <option
                                    value="pending"
                                    ${
                                        booking.booking_status
                                        === "pending"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Pending
                                </option>
                                <option
                                    value="accepted"
                                    ${
                                        booking.booking_status
                                        === "accepted"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Accepted
                                </option>
                                <option
                                    value="completed"
                                    ${
                                        booking.booking_status
                                        === "completed"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Completed
                                </option>
                                <option
                                    value="cancelled"
                                    ${
                                        booking.booking_status
                                        === "cancelled"
                                        ?
                                        "selected"
                                        :
                                        ""
                                    }
                                >
                                    Cancelled
                                </option>
                            </select>
                        </td>
                        <td>
                            <button
                                class="bookingUpdateBtn"
                                onclick="
                                    updateBookingStatus(
                                        ${booking.id},
                                        ${booking.ambulance_id}
                                    )
                                "
                            >
                                Update
                            </button>
                        </td>
                    </tr>
                    `;
                }
            );
        }
    }
    catch(error){
        console.log(error);
    }
}

async function updateBookingStatus(
    bookingId,
    ambulanceId
){

    try{

        const booking_status =
        document.getElementById(
            `booking_status_${bookingId}`
        ).value;

const ambulance_status =
document.getElementById(
    `booking_ambulance_status_${bookingId}`
).value;

        const response =
        await fetch(

            '/api/update-booking-status',

            {

                method:'PUT',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    booking_id:
                    bookingId,

                    ambulance_id:
                    ambulanceId,

                    booking_status,

                    ambulance_status

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

            loadBookings();

            loadAmbulanceAvailability();

            loadAmbulances();

            loadDashboard();

            showToast(
                "Status Updated"
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadAmbulances(){
    try{
        const response =
            await fetch(
                '/api/ambulances'
            );
        const result =
            await response.json();
        const tbody =
            document.getElementById(
                "ambulanceTableBody"
            );
        tbody.innerHTML = "";
        if(
            result.success
        ){
            const ambulances =
                filterDashboardRecords(
                    result.ambulances,
                    ["created_at"]
                );

            if(
                ambulances.length
                === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="noAmbulanceData"
                    >
                        No Ambulances Found
                    </td>
                </tr>
                `;
                return;
            }
            ambulances
            .forEach(ambulance => {
                tbody.innerHTML += `
                <tr>
                    <td>
                        ${ambulance.id}
                    </td>
                    <td>
                        ${ambulance.ambulance_type}
                    </td>
                    <td>
                        <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 600; font-family: monospace; color: #1e293b;">${ambulance.vehicle_number || "-"}</span>
                    </td>

                    <td>
                        ₹${ambulance.base_chrge}
                    </td>
                    <td>
                        ₹${ambulance.min_chrge}
                    </td>
                    <td>
                        ₹${ambulance.night_chrg}
                    </td>
                    <td>
                        ${ambulance.status}
                    </td>
                    <td>
                        ${ambulance.eta}
                    </td>
                    <td>
                        ${ambulance.area}
                    </td>
                    <td>
                        ${
                            new Date(
                                ambulance.created_at
                            ).toLocaleDateString()
                        }
                    </td>
                    <td style="text-align: center;">
                        <i class="fa-solid fa-pen-to-square edit-amb-btn" onclick="openEditAmbulance(${ambulance.id})" title="Edit Ambulance" style="color: var(--primary); cursor: pointer; margin-right: 12px;"></i>
                        <i class="fa-solid fa-trash delete-amb-btn" onclick="deleteAmbulance(${ambulance.id})" title="Delete Ambulance" style="color: var(--error); cursor: pointer;"></i>
                    </td>
                </tr>
                `;
            });
        }
    }
    catch(error){
        console.log(error);
    }
}


async function openEditAmbulance(ambId) {
    const form = document.getElementById('ambulanceForm');
    if(!form) return;
    form.reset();
    
    // Set edit mode
    let hiddenId = document.getElementById('edit_ambulance_id');
    if(!hiddenId) {
        hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = 'edit_ambulance_id';
        form.prepend(hiddenId);
    }
    hiddenId.value = ambId;
    
    // Update modal title and button
    const header = document.getElementById('ambulanceModalHeader');
    if(header) {
        const h2 = header.querySelector('h2');
        if(h2) h2.innerText = 'Edit Ambulance';
    }
    const saveBtn = document.getElementById('saveAmbulanceBtn');
    if (saveBtn) saveBtn.innerText = 'Update Ambulance';
    
    try {
        const res = await fetch('/api/ambulances');
        const result = await res.json();
        if(result.success && result.ambulances) {
            const amb = result.ambulances.find(a => String(a.id) === String(ambId));
            if(amb) {
                // Smart select for ambulance_type
                const typeSelect = document.getElementById('ambulance_type');
                if(typeSelect && amb.ambulance_type) {
                    let matched = false;
                    for(let i = 0; i < typeSelect.options.length; i++) {
                        const opt = typeSelect.options[i];
                        if(opt.value === amb.ambulance_type || opt.text === amb.ambulance_type) {
                            typeSelect.selectedIndex = i;
                            matched = true;
                            break;
                        }
                    }
                    if(!matched) {
                        const lowerVal = amb.ambulance_type.toLowerCase();
                        for(let i = 0; i < typeSelect.options.length; i++) {
                            const opt = typeSelect.options[i];
                            if(opt.value && (opt.value.toLowerCase().includes(lowerVal) || lowerVal.includes(opt.value.toLowerCase()))) {
                                typeSelect.selectedIndex = i;
                                matched = true;
                                break;
                            }
                        }
                    }
                    if(!matched) {
                        const newOpt = new Option(amb.ambulance_type, amb.ambulance_type, true, true);
                        typeSelect.add(newOpt);
                    }
                }

                if(document.getElementById('vehicle_number')) document.getElementById('vehicle_number').value = amb.vehicle_number || '';
                if(document.getElementById('base_chrge')) document.getElementById('base_chrge').value = amb.base_chrge || '';
                if(document.getElementById('min_chrge')) document.getElementById('min_chrge').value = amb.min_chrge || '';
                if(document.getElementById('night_chrg')) document.getElementById('night_chrg').value = amb.night_chrg || '';
                if(document.getElementById('wait_chrg')) document.getElementById('wait_chrg').value = amb.wait_chrg || '';
                if(document.getElementById('eta')) document.getElementById('eta').value = amb.eta || '';
                if(document.getElementById('book_time_slot')) document.getElementById('book_time_slot').value = amb.book_time_slot || '';
                if(document.getElementById('area')) document.getElementById('area').value = amb.area || '';
                if(document.getElementById('description')) document.getElementById('description').value = amb.description || '';

                // Smart select for status
                const statusSelect = document.getElementById('status');
                if(statusSelect && amb.status) {
                    for(let i = 0; i < statusSelect.options.length; i++) {
                        if(statusSelect.options[i].value.toLowerCase() === amb.status.toLowerCase() || statusSelect.options[i].text.toLowerCase() === amb.status.toLowerCase()) {
                            statusSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }
    } catch(e) { console.error(e); }
    
    document.getElementById('ambulanceModal').style.display = 'flex';
}

async function deleteAmbulance(id) {
    if(!confirm("Are you sure you want to delete this ambulance?")) {
        return;
    }
    try {
        const response = await fetch(`/api/ambulance/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if(result.success) {
            showToast("Ambulance Deleted Successfully!");
            loadAmbulances();
            loadAmbulanceAvailability();
            loadDashboard();
        } else {
            alert(result.message || "Failed to delete ambulance.");
        }
    } catch(error) {
        console.log(error);
        alert("Error deleting ambulance.");
    }
}

async function updateAmbulanceStatus(
    ambulanceId
){

    try{

        const status =
        document.getElementById(
            `ambulance_status_${ambulanceId}`
        ).value;

        const response =
        await fetch(

            '/api/update/ambulance',

            {

                method:'PUT',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    id:
                    ambulanceId,

                    status,

                    base_chrge:0

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

            loadAmbulances();

            loadAmbulanceAvailability();

            loadBookings();

            showToast(
                "Ambulance Status Updated"
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

document.getElementById(
    "addAmbulanceBtn"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "ambulanceModal"
        ).style.display = "flex";
    }
);

document.getElementById(
    "closeAmbulanceModal"
).addEventListener(
    "click",
    () => {
        document.getElementById(
            "ambulanceModal"
        ).style.display = "none";
    }
);

document.getElementById("ambulanceForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append("ambulance_type", document.getElementById("ambulance_type")?.value || "");
    formData.append("vehicle_number", document.getElementById("vehicle_number")?.value || "");
    formData.append("base_chrge", document.getElementById("base_chrge")?.value || "");
    formData.append("min_chrge", document.getElementById("min_chrge")?.value || "");
    formData.append("night_chrg", document.getElementById("night_chrg")?.value || "");
    formData.append("wait_chrg", document.getElementById("wait_chrg")?.value || "");
    formData.append("status", document.getElementById("status")?.value || "Available");
    formData.append("eta", document.getElementById("eta")?.value || "");
    formData.append("book_time_slot", document.getElementById("book_time_slot")?.value || "");
    formData.append("area", document.getElementById("area")?.value || "");
    formData.append("description", document.getElementById("description")?.value || "");
    formData.append("driver_exp", document.getElementById("driver_exp")?.value || "");
    
    const rcFile = document.getElementById("rc")?.files?.[0];
    if (rcFile) formData.append("rc", rcFile);
    
    const vehInsFile = document.getElementById("veh_ins")?.files?.[0];
    if (vehInsFile) formData.append("veh_ins", vehInsFile);
    
    const licFile = document.getElementById("lic")?.files?.[0];
    if (licFile) formData.append("lic", licFile);

    const editId = document.getElementById("edit_ambulance_id")?.value;
    const isEdit = Boolean(editId);
    const url = isEdit ? '/api/update/ambulance/' + editId : '/api/add/ambulance';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            showToast(isEdit ? "Ambulance Updated Successfully!" : "Ambulance Added Successfully!");
            document.getElementById("ambulanceModal").style.display = "none";
            document.getElementById("ambulanceForm").reset();
            if (document.getElementById("edit_ambulance_id")) {
                document.getElementById("edit_ambulance_id").value = "";
            }
            loadAmbulances();
        } else {
            showToast(result.message || "Failed to save ambulance");
        }
    } catch (error) {
        console.error(error);
        showToast("Error updating ambulance");
    }
});

async function loadAmbulanceAvailability(){
    try{
        const response =
            await fetch(
                '/api/ambulance/availability'
            );
        const result =
            await response.json();
        const availableBody =
            document.getElementById(
                "availableAmbulanceBody"
            );
        const busyBody =
            document.getElementById(
                "busyAmbulanceBody"
            );

        if (!availableBody || !busyBody) {
            return;
        }

        availableBody.innerHTML = "";
        busyBody.innerHTML = "";

        if (
            !response.ok
            ||
            !result.success
            || !Array.isArray(result.available)
            || !Array.isArray(result.busy)
        ) {
            const message =
                result.message || "Unable to load ambulance availability.";

            availableBody.innerHTML = `
                <tr>
                    <td colspan="8">${message}</td>
                </tr>
            `;
            busyBody.innerHTML = `
                <tr>
                    <td colspan="8">${message}</td>
                </tr>
            `;
            return;
        }

        const availableAmbulances =
            filterDashboardRecords(
                result.available,
                ["created_at"]
            );
        const busyAmbulances =
            filterDashboardRecords(
                result.busy,
                ["created_at"]
            );

        if (availableAmbulances.length === 0) {
            availableBody.innerHTML = `
                <tr>
                    <td colspan="8">No Available Ambulances Found</td>
                </tr>
            `;
        }

        if (busyAmbulances.length === 0) {
            busyBody.innerHTML = `
                <tr>
                    <td colspan="8">No Busy Ambulances Found</td>
                </tr>
            `;
        }

        availableAmbulances
        .forEach(ambulance => {
            availableBody.innerHTML += `
            <tr>
                <td>
                    ${ambulance.id}
                </td>
                <td>
                    ${ambulance.ambulance_type}
                </td>
                <td>
                    ${ambulance.area}
                </td>
                <td>
                    ${ambulance.eta}
                </td>
                <td>
                    ₹${ambulance.base_chrge}
                </td>
                <td>
                    <input
                        type="text"
                        value="${ambulance.base_chrge}"
                        id="price_${ambulance.id}"
                        class="updateInput"
                    >
                </td>
                <td>
                    <select
                        id="status_${ambulance.id}"
                        class="updateSelect"
                    >
                        <option
                            ${
                                ambulance.status
                                === "Available"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Available
                        </option>
                        <option
                            ${
                                ambulance.status
                                === "Busy / On Trip"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Busy / On Trip
                        </option>
                    </select>
                </td>
                <td>
                    <button
                        class="saveUpdateBtn"
                        onclick="
                            updateAmbulance(
                                ${ambulance.id}
                            )
                        "
                    >
                        Save
                    </button>
                </td>
            </tr>
            `;
        });
        busyAmbulances
        .forEach(ambulance => {
            busyBody.innerHTML += `
            <tr>
                <td>
                    ${ambulance.id}
                </td>
                <td>
                    ${ambulance.ambulance_type}
                </td>
                <td>
                    ${ambulance.area}
                </td>
                <td>
                    ${ambulance.eta}
                </td>
                <td>
                    ₹${ambulance.base_chrge}
                </td>
                <td>
                    <input
                        type="text"
                        value="${ambulance.base_chrge}"
                        id="price_${ambulance.id}"
                        class="updateInput"
                    >
                </td>
                <td>
                    <select
                        id="status_${ambulance.id}"
                        class="updateSelect"
                    >
                        <option
                            ${
                                ambulance.status
                                === "Available"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Available
                        </option>
                        <option
                            ${
                                ambulance.status
                                === "Busy / On Trip"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            Busy / On Trip
                        </option>
                    </select>
                </td>
                <td>
                    <button
                        class="saveUpdateBtn"
                        onclick="
                            updateAmbulance(
                                ${ambulance.id}
                            )
                        "
                    >
                        Save
                    </button>
                </td>
            </tr>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}

async function updateAmbulance(id){
    try{
        const price =
            document.getElementById(
                `price_${id}`
            ).value;
        const status =
            document.getElementById(
                `status_${id}`
            ).value;
        const response =
            await fetch(
                '/api/update/ambulance',
                {
                    method:'PUT',
                    headers:{
                        'Content-Type':
                        'application/json'
                    },
                    body:JSON.stringify({
                        id,
                        base_chrge:price,
                        status
                    })
                }
            );
        const result =
            await response.json();
        if(result.success){
            loadAmbulanceAvailability();
        }
    }
    catch(error){
        console.log(error);
    }
}

async function loadPayments(){

    try{

        const response =
        await fetch(
            '/api/vendor/payments'
        );

        const result =
        await response.json();

        const tbody =
        document.getElementById(
            "paymentsTableBody"
        );

        tbody.innerHTML = "";

        if(result.success){
            const payments =
                filterDashboardRecords(
                    result.payments,
                    ["paid_at", "created_at"]
                );

            if(
                payments.length === 0
            ){

                tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No Payments Found
                    </td>
                </tr>
                `;

                return;

            }

            payments.forEach(
                payment => {

                    tbody.innerHTML += `
                    <tr>

                        <td>
                            ${payment.id}
                        </td>

                        <td>
                            ₹${payment.amount}
                        </td>

                        <td>
                            ${payment.razorpay_payment_id || 'N/A'}
                        </td>

                        <td>
                            ${payment.payout_status}
                        </td>

                        <td>
                        ${
                            new Date(
                                payment.paid_at
                                || payment.created_at
                            ).toLocaleString()
                        }
                        </td>

                    </tr>
                    `;

                }
            );

        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadDashboard(){

    try{

        const ambulanceResponse =
        await fetch('/api/ambulances');

        const ambulanceResult =
        await ambulanceResponse.json();

        const bookingResponse =
        await fetch('/api/ambulance/bookings');

        const bookingResult =
        await bookingResponse.json();

        const paymentResponse =
        await fetch('/api/vendor/payments');

        const paymentResult =
        await paymentResponse.json();

        const dashboardAmbulances =
            ambulanceResult.success
                ? filterDashboardRecords(
                    ambulanceResult.ambulances,
                    ["created_at"]
                )
                : [];

        const dashboardBookings =
            bookingResult.success
                ? filterDashboardRecords(
                    bookingResult.bookings,
                    ["booking_date", "created_at"]
                )
                : [];

        const dashboardPayments =
            paymentResult.success
                ? filterDashboardRecords(
                    paymentResult.payments,
                    ["created_at", "paid_at"]
                )
                : [];

        let totalAmbulances = 0;
        let availableAmbulances = 0;

        let totalBookings = 0;

        let totalEarnings = 0;

        let totalPayout = 0;

        if(ambulanceResult.success){

            totalAmbulances =
            dashboardAmbulances.length;

            availableAmbulances =
            dashboardAmbulances.filter(
                amb =>
                amb.status.toLowerCase().includes("available")
            ).length;

        }

        if(bookingResult.success){

            totalBookings =
            dashboardBookings.length;

            dashboardBookings.forEach(
                booking => {

                    totalEarnings +=
                    Number(booking.total_amount);

                }
            );

        }

        if(paymentResult.success){

            dashboardPayments.forEach(
                payment => {

                    totalPayout +=
                    Number(payment.amount);

                }
            );

        }

        document.getElementById(
            "totalAmbulances"
        ).innerText =
        totalAmbulances;

        document.getElementById(
            "availableAmbulances"
        ).innerText =
        `${availableAmbulances} Available`;

        document.getElementById(
            "totalBookings"
        ).innerText =
        totalBookings;

        document.getElementById(
            "totalEarnings"
        ).innerText =
        `₹${totalEarnings}`;

        document.getElementById(
            "vendorPayout"
        ).innerText =
        `₹${totalPayout}`;

        const bookingBody =
        document.getElementById(
            "dashboardBookingBody"
        );

        bookingBody.innerHTML = "";

        dashboardBookings
        .slice(0,5)
        .forEach(booking => {

            bookingBody.innerHTML += `
            <tr>

                <td>
                    #${booking.id}
                </td>

                <td>
                    ${booking.patient_name}
                </td>

                <td>
                    ${booking.pickup_address}
                </td>

                <td>
                    ${booking.destination_address}
                </td>

                <td>
                    ₹${booking.total_amount}
                </td>

                <td>
                    <span class="
                    ${booking.booking_status === 'completed'
                    ? 'completedStatus'
                    :
                    booking.booking_status === 'cancelled'
                    ?
                    'cancelledStatus'
                    :
                    'pendingStatus'}
                    ">
                        ${booking.booking_status}
                    </span>
                </td>

            </tr>
            `;

        });

        const paymentBody =
        document.getElementById(
            "dashboardPaymentBody"
        );

        paymentBody.innerHTML = "";

        if(paymentResult.success){

            dashboardPayments
            .slice(0,5)
            .forEach(payment => {

                paymentBody.innerHTML += `
                <tr>

                    <td>
                        #${payment.id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.razorpay_payment_id}
                    </td>

                    <td>
                        <span class="completedStatus">
                            Paid
                        </span>
                    </td>

                </tr>
                `;

            });

        }

        if (ambulanceResult.success) {
            const areaAvailable = {};
            const areaBusy = {};
            const areaTotal = {};

            dashboardAmbulances.forEach(amb => {
                const area = amb.area || 'General Area';
                areaTotal[area] = (areaTotal[area] || 0) + 1;
                if (amb.status && amb.status.toLowerCase().includes("available")) {
                    areaAvailable[area] = (areaAvailable[area] || 0) + 1;
                } else {
                    areaBusy[area] = (areaBusy[area] || 0) + 1;
                }
            });

            const labels = Object.keys(areaTotal).length > 0 ? Object.keys(areaTotal) : ['Coverage Area'];
            const availableData = labels.map(a => areaAvailable[a] || 0);
            const busyData = labels.map(a => areaBusy[a] || 0);
            const totalData = labels.map(a => areaTotal[a] || 0);

            const ctx = document.getElementById('ambulanceHeatmapChart');
            if (ctx) {
                const isDark = document.documentElement.getAttribute("data-theme") === "dark";
                const textColor = isDark ? "#94A3B8" : "#64748B";
                const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";
                const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

                const chartCtx = ctx.getContext('2d');
                
                let gradientBlue = chartCtx.createLinearGradient(0, 0, 0, 260);
                gradientBlue.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.45)' : 'rgba(37, 99, 235, 0.35)');
                gradientBlue.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

                let gradientTeal = chartCtx.createLinearGradient(0, 0, 0, 260);
                gradientTeal.addColorStop(0, isDark ? 'rgba(20, 184, 166, 0.40)' : 'rgba(20, 184, 166, 0.30)');
                gradientTeal.addColorStop(1, 'rgba(20, 184, 166, 0.01)');

                let gradientPurple = chartCtx.createLinearGradient(0, 0, 0, 260);
                gradientPurple.addColorStop(0, isDark ? 'rgba(139, 92, 246, 0.30)' : 'rgba(139, 92, 246, 0.20)');
                gradientPurple.addColorStop(1, 'rgba(139, 92, 246, 0.01)');

                if (window.ambulanceHeatmapInstance) {
                    window.ambulanceHeatmapInstance.destroy();
                    window.ambulanceHeatmapInstance = null;
                }
                
                window.ambulanceHeatmapInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Available Units',
                                data: availableData,
                                borderColor: '#2563EB',
                                backgroundColor: gradientBlue,
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointHoverRadius: 8,
                                pointBackgroundColor: '#2563EB',
                                pointBorderColor: surfaceColor,
                                pointBorderWidth: 2.5
                            },
                            {
                                label: 'On-Duty / Busy',
                                data: busyData,
                                borderColor: '#14B8A6',
                                backgroundColor: gradientTeal,
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 5,
                                pointHoverRadius: 8,
                                pointBackgroundColor: '#14B8A6',
                                pointBorderColor: surfaceColor,
                                pointBorderWidth: 2.5
                            },
                            {
                                label: 'Total Fleet Demand',
                                data: totalData,
                                borderColor: '#8B5CF6',
                                backgroundColor: gradientPurple,
                                borderWidth: 2,
                                borderDash: [5, 5],
                                fill: false,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 7,
                                pointBackgroundColor: '#8B5CF6',
                                pointBorderColor: surfaceColor,
                                pointBorderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false
                        },
                        animation: {
                            duration: 1000,
                            easing: 'easeOutQuart'
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                align: 'end',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8,
                                    padding: 16,
                                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' },
                                    color: textColor
                                }
                            },
                            tooltip: {
                                backgroundColor: isDark ? '#0F172A' : '#172033',
                                titleColor: '#FFFFFF',
                                bodyColor: '#CBD5E1',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderWidth: 1,
                                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: '700' },
                                bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                                padding: 12,
                                cornerRadius: 10,
                                usePointStyle: true
                            }
                        },
                        scales: {
                            x: {
                                grid: { color: gridColor },
                                border: { display: false },
                                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }, color: textColor, padding: 8 }
                            },
                            y: {
                                beginAtZero: true,
                                suggestedMax: Math.max(...totalData, 2) + 1,
                                grid: { color: gridColor },
                                border: { dash: [4, 4], display: false },
                                ticks: { stepSize: 1, precision: 0, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }, color: textColor, padding: 10 }
                            }
                        }
                    }
                });
            }
        }

    } catch(error) {
        console.log(error);
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #10b981; color: white; padding: 12px 20px;
        border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: var(--font-body); font-size: 14px; font-weight: 500;
        transform: translateX(100%); opacity: 0; transition: all 0.3s ease;
    `;
    toast.innerHTML = `<i class="fa-solid fa-check-circle" style="margin-right:8px;"></i> ${message}`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- ADD BOOKING MODAL LOGIC ---
const addBookingModal = document.getElementById('addBookingModal');
document.getElementById('addAmbulanceBookingBtn')?.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/ambulances');
        const data = await res.json();
        const select = document.getElementById('newBookingAmbulance');
        select.innerHTML = '<option value="">Select an Ambulance...</option>';
        if(data.success) {
            data.ambulances.forEach(amb => {
                select.innerHTML += `<option value="${amb.id}">ID: ${amb.id} - ${amb.ambulance_type} (${amb.status})</option>`;
            });
        }
    } catch(e) { console.log(e); }
    addBookingModal.style.display = 'flex';
});

document.getElementById('closeAddBookingModal')?.addEventListener('click', () => {
    addBookingModal.style.display = 'none';
});

document.getElementById('addBookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        ambulance_id: document.getElementById('newBookingAmbulance').value,
        patient_name: document.getElementById('newPatientName').value,
        total_amount: document.getElementById('newTotalAmount').value,
        patient_condition: document.getElementById('newPatientCondition').value,
        pickup_address: document.getElementById('newPickupAddress').value,
        destination_address: document.getElementById('newDestinationAddress').value,
        booking_status: document.getElementById('newBookingStatus').value,
        payment_status: document.getElementById('newPaymentStatus').value
    };

    try {
        const res = await fetch('/api/ambulance/bookings/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
            showToast("Booking Added Successfully!");
            addBookingModal.style.display = 'none';
            document.getElementById('addBookingForm').reset();
            loadBookings();
            loadDashboard();
        } else {
            showToast("Failed to add booking.");
        }
    } catch(e) {
        console.log(e);
        showToast("Error adding booking.");
    }
});

// Re-render ambulance charts on theme toggle
window.addEventListener("hk-theme-change", () => {
    const dashSec = document.getElementById("dashboardSection");
    if (dashSec && dashSec.style.display !== "none") {
        loadDashboard();
    }
});


// ====== NEW PROFILE FLOW LOGIC ======
// ====== AMBULANCE VENDOR PROFILE FLOW ======
async function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
    
    const bannerContainer = document.getElementById('profileStatusBannerContainer');
    const actionButtons = document.getElementById('profileModalActionButtons');
    const form = document.getElementById('vendorProfileForm');
    if (!form) return;

    try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await res.json();
        if (result.success && result.user) {
            const user = result.user;
            
            // Populate fields
            if (form.elements['company_name']) form.elements['company_name'].value = user.company_name || '';
            if (form.elements['name']) form.elements['name'].value = user.name || '';
            if (form.elements['business_reg_number']) form.elements['business_reg_number'].value = user.business_reg_number || '';
            if (form.elements['contact_number']) form.elements['contact_number'].value = user.contact_number || user.emailorcontact || '';
            if (form.elements['email']) form.elements['email'].value = user.email || (user.emailorcontact && user.emailorcontact.includes('@') ? user.emailorcontact : '');
            if (form.elements['service_area']) form.elements['service_area'].value = user.service_area || '';
            if (form.elements['service_24x7']) form.elements['service_24x7'].value = user.service_24x7 || 'Yes';
            if (form.elements['business_address']) form.elements['business_address'].value = user.business_address || '';

            const allInputs = form.querySelectorAll('input, select, textarea');
            const fileInputs = form.querySelectorAll('input[type="file"]');
            const isCompleted = Boolean(user.vendor_profile_completed);
            const isEditAllowed = Boolean(user.edit_allowed);
            const isEditRequested = Boolean(user.edit_requested);

            if (!isCompleted) {
                // State 1: Profile NOT completed
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '';
                    input.style.cursor = 'auto';
                });

                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="padding:12px 16px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:10px; font-size:13px; color:#1d4ed8; font-weight:500; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-circle-info" style="font-size:16px;"></i>
                            <div>Please complete your ambulance vendor details and upload verification documents below.</div>
                        </div>
                    `;
                }
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--border-color, #cbd5e1); background:var(--card-bg, #fff); border-radius:10px; cursor:pointer; color:var(--text-main, #101828); font-weight:600;" onclick="closeProfileModal()">Close</button>
                        <button type="submit" id="saveProfileBtn" style="padding:10px 22px; border:none; background:var(--primary, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-floppy-disk"></i> Save Profile</button>
                    `;
                }
            } else if (!isEditAllowed) {
                // State 2: Profile Completed & Locked
                allInputs.forEach(input => {
                    input.disabled = true;
                    input.style.backgroundColor = 'rgba(0,0,0,0.03)';
                    input.style.cursor = 'not-allowed';
                });

                if (!isEditRequested) {
                    if (bannerContainer) {
                        bannerContainer.innerHTML = `
                            <div style="padding:12px 16px; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; font-size:13px; color:#92400e; font-weight:500; display:flex; align-items:center; gap:10px;">
                                <i class="fa-solid fa-shield-halved" style="color:#d97706; font-size:18px;"></i>
                                <div style="flex:1;">
                                    <strong>Vendor Profile is Verified & Locked.</strong> Direct updates are restricted. If you need to update any information or documents, please request permission from Admin.
                                </div>
                            </div>
                        `;
                    }
                    if (actionButtons) {
                        actionButtons.innerHTML = `
                            <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--border-color, #cbd5e1); background:var(--card-bg, #fff); border-radius:10px; cursor:pointer; color:var(--text-main, #101828); font-weight:600;" onclick="closeProfileModal()">Close</button>
                            <button type="button" id="requestAdminEditBtn" style="padding:10px 22px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:8px; box-shadow:0 2px 8px rgba(217,119,6,0.25);"><i class="fa-solid fa-lock"></i> Request Admin for Edit</button>
                        `;
                        const reqBtn = document.getElementById('requestAdminEditBtn');
                        if (reqBtn) {
                            reqBtn.onclick = async () => {
                                reqBtn.disabled = true;
                                reqBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Requesting...';
                                try {
                                    const reqRes = await fetch('/api/vendor/request-profile-edit/vendor_ambulance/' + user.id, { method: 'POST' });
                                    const reqData = await reqRes.json();
                                    if (reqData.success) {
                                        alert('Edit request sent to Admin successfully! Once Admin approves, you will be able to update your profile details.');
                                        openProfileModal();
                                    } else {
                                        alert(reqData.message || 'Failed to submit request.');
                                        reqBtn.disabled = false;
                                        reqBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Request Admin for Edit';
                                    }
                                } catch(err) {
                                    alert('Network error while requesting edit.');
                                    reqBtn.disabled = false;
                                    reqBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Request Admin for Edit';
                                }
                            };
                        }
                    }
                } else {
                    // Edit request pending approval
                    if (bannerContainer) {
                        bannerContainer.innerHTML = `
                            <div style="padding:12px 16px; background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; font-size:13px; color:#78350f; font-weight:500; display:flex; align-items:center; gap:10px;">
                                <i class="fa-solid fa-hourglass-half" style="color:#d97706; font-size:18px;"></i>
                                <div style="flex:1;">
                                    <strong>Edit Request Pending Admin Approval.</strong> You have requested to update your vendor profile. Once Admin approves the request, the fields will become editable.
                                </div>
                            </div>
                        `;
                    }
                    if (actionButtons) {
                        actionButtons.innerHTML = `
                            <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--border-color, #cbd5e1); background:var(--card-bg, #fff); border-radius:10px; cursor:pointer; color:var(--text-main, #101828); font-weight:600;" onclick="closeProfileModal()">Close</button>
                            <button type="button" disabled style="padding:10px 20px; border:none; background:#94a3b8; color:#fff; border-radius:10px; cursor:not-allowed; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-clock"></i> Edit Request Pending Admin Approval</button>
                        `;
                    }
                }
            } else {
                // State 3: Edit Approved by Admin
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '';
                    input.style.cursor = 'auto';
                });

                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="padding:12px 16px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; font-size:13px; color:#065f46; font-weight:500; display:flex; align-items:center; gap:10px;">
                            <i class="fa-solid fa-circle-check" style="color:#059669; font-size:18px;"></i>
                            <div style="flex:1;">
                                <strong>Edit Permission Approved!</strong> Admin has granted access to update your vendor profile. Make your changes and click 'Update Profile' below.
                            </div>
                        </div>
                    `;
                }
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--border-color, #cbd5e1); background:var(--card-bg, #fff); border-radius:10px; cursor:pointer; color:var(--text-main, #101828); font-weight:600;" onclick="closeProfileModal()">Close</button>
                        <button type="submit" id="saveProfileBtn" style="padding:10px 22px; border:none; background:#059669; color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-pen-to-square"></i> Update Profile</button>
                    `;
                }
            }
        }
    } catch (err) {
        console.error("Profile load error:", err);
    }
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
            alert('Ambulance Vendor Profile saved successfully!');
            closeProfileModal();
            await loadUserProfile();
        } else {
            alert(result.message || 'Profile save failed');
        }
    } catch (e) {
        console.error(e);
        alert('An error occurred while saving.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText || 'Save Profile';
        }
    }
});

// ===================================


// ================= DRIVER CRUD =================
window._allDriversList = [];

function formatDriverWhatsAppMessage(driver) {
    let cleanMobile = String(driver.mobile_number || '').replace(/[^0-9]/g, '');
    if (cleanMobile.length === 10) {
        cleanMobile = '91' + cleanMobile;
    }
    
    let text = `🚨 *HospiKare Fleet - Driver & Vehicle Duty Details* 🚨\n\n`;
    text += `Hello *${driver.driver_name || 'Driver'}*,\n`;
    text += `Aapko HospiKare Emergency Ambulance Fleet me assign kiya gaya hai. Details neeche di gayi hain:\n\n`;
    
    text += `📋 *Driver Details:*\n`;
    text += `• *Name:* ${driver.driver_name || 'N/A'}\n`;
    text += `• *Driver / Emp ID:* ${driver.driver_id_str || 'N/A'}\n`;
    text += `• *Contact:* ${driver.mobile_number || 'N/A'}\n`;
    text += `• *Duty Status:* ${driver.status || 'Active'}\n\n`;
    
    const ambType = driver.ambulance_type || (driver.ambulance && driver.ambulance.ambulance_type);
    const vehNo = driver.vehicle_number || (driver.ambulance && driver.ambulance.vehicle_number);
    const baseFare = driver.base_chrge || (driver.ambulance && driver.ambulance.base_chrge);
    const minFare = driver.min_chrge || (driver.ambulance && driver.ambulance.min_chrge);
    const area = driver.area || (driver.ambulance && driver.ambulance.area);
    const eta = driver.eta || (driver.ambulance && driver.ambulance.eta);
    
    if (ambType || vehNo) {
        text += `🚑 *Assigned Ambulance Details:*\n`;
        text += `• *Ambulance Type:* ${ambType || 'Emergency Ambulance'}\n`;
        text += `• *Vehicle Reg No:* ${vehNo || 'N/A'}\n`;
        if (baseFare) text += `• *Base Fare / KM:* ₹${baseFare}\n`;
        if (minFare) text += `• *Minimum Fare:* ₹${minFare}\n`;
        if (area) text += `• *Service Area:* ${area}\n`;
        if (eta) text += `• *Response ETA:* ${eta}\n\n`;
    } else {
        text += `🚑 *Assigned Ambulance:* Currently Unassigned\n\n`;
    }
    
    text += `⚠️ *Important Instructions:*\n`;
    text += `1. Vehicle ki safety kit, oxygen cylinder aur medical supplies check karein.\n`;
    text += `2. Duty ke dauran apna phone aur GPS location ON rakhein.\n`;
    text += `3. Emergency dispatch request aane par turant response karein.\n\n`;
    text += `— *HospiKare Fleet Management*`;
    
    return {
        phone: cleanMobile,
        message: text,
        url: `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`
    };
}

function shareDriverWhatsApp(driver) {
    if (!driver || !driver.mobile_number) {
        alert('Driver mobile number is not available!');
        return;
    }
    const info = formatDriverWhatsAppMessage(driver);
    window.open(info.url, '_blank');
}

async function loadDrivers() {
    try {
        const response = await fetch('/api/vendor/drivers');
        const result = await response.json();
        const tbody = document.getElementById("driversTableBody");
        if(tbody) tbody.innerHTML = "";
        
        if (result.success) {
            const drivers = result.data || [];
            window._allDriversList = drivers;
            let html = "";
            drivers.forEach(driver => {
                const photoSrc = driver.driver_photo ? '/uploads/' + driver.driver_photo : '/assets/default_avatar.png';
                const statusColor = driver.status === 'Active' ? '#18B981' : (driver.status === 'Inactive' ? '#EF4B5F' : '#F59E0B');
                
                const assignedHtml = driver.ambulance_type 
                    ? '<div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;"><span style="font-size: 13px; font-weight: 600; color: var(--text-dark);">' + driver.ambulance_type + '</span> <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.35); padding: 2px 7px; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: 700;">' + (driver.vehicle_number || '-') + '</span></div>'
                    : '<span style="color: #ef4444; font-size: 12px; font-weight: 600; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 4px;">Unassigned</span>';

                html += `
                    <tr>
                        <td style="text-align: center;"><img src="${photoSrc}" alt="Driver" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"></td>
                        <td>
                            <div style="font-weight: 700; color: var(--text-dark); font-size: 14px;">${driver.driver_name}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">ID: ${driver.driver_id_str || 'N/A'}</div>
                        </td>
                        <td style="font-weight: 500; font-size: 13px; color: var(--text-dark);">${driver.mobile_number}</td>
                        <td><span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid ${statusColor}40;">${driver.status || 'Active'}</span></td>
                        <td>${assignedHtml}</td>
                        <td style="text-align: center;">
                            <div style="display: inline-flex; align-items: center; gap: 10px;">
                                <i class="fa-brands fa-whatsapp whatsapp-driver-btn" data-id="${driver.id}" title="Send Assignment Details on WhatsApp" style="color: #22c55e; font-size: 18px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                                <i class="fa-solid fa-pen-to-square edit-driver-btn" data-id="${driver.id}" title="Edit Driver" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                                <i class="fa-solid fa-trash delete-driver-btn" data-id="${driver.id}" title="Delete Driver" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                            </div>
                        </td>
                    </tr>
                `;
            });
            if(tbody) {
                tbody.innerHTML = html;
                document.querySelectorAll('.whatsapp-driver-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        const driver = window._allDriversList?.find(d => String(d.id) === String(id));
                        if (driver) {
                            shareDriverWhatsApp(driver);
                        }
                    });
                });
                document.querySelectorAll('.edit-driver-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => openDriverModal(e.currentTarget.getAttribute('data-id')));
                });
                document.querySelectorAll('.delete-driver-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteDriver(e.currentTarget.getAttribute('data-id')));
                });
            }
        }
    } catch(err) { console.error(err); }
}

async function loadAmbulanceDropdown(selectedId = null, currentDriverId = null) {
    const select = document.getElementById('assigned_ambulance_id');
    if(!select) return;
    try {
        const response = await fetch('/api/ambulances');
        const result = await response.json();
        select.innerHTML = '<option value="">No Ambulance Assigned</option>';
        if (result.success && result.ambulances) {
            result.ambulances.forEach(amb => {
                const ambType = amb.ambulance_type || 'Ambulance';
                const regNo = amb.vehicle_number ? amb.vehicle_number : `ID: #${amb.id}`;
                const assignedDriverId = amb.assigned_driver_id;
                const assignedDriverName = amb.driver_name;
                
                const isCurrentDriverAmb = (selectedId && String(amb.id) === String(selectedId)) || 
                                           (currentDriverId && assignedDriverId && String(assignedDriverId) === String(currentDriverId));
                const isAssignedToOther = assignedDriverId && !isCurrentDriverAmb;
                
                let label = `${ambType} (${regNo})`;
                let disabledAttr = '';
                let selectedAttr = '';
                let optStyle = '';
                
                if (isCurrentDriverAmb) {
                    selectedAttr = 'selected';
                } else if (isAssignedToOther) {
                    disabledAttr = 'disabled';
                    const driverDisplay = assignedDriverName ? assignedDriverName : `Driver #${assignedDriverId}`;
                    label += ` - (Assigned: ${driverDisplay})`;
                    optStyle = 'color: var(--text-muted, #94a3b8); opacity: 0.55;';
                }
                
                const styleAttr = optStyle ? `style="${optStyle}"` : '';
                select.innerHTML += `<option value="${amb.id}" ${selectedAttr} ${disabledAttr} ${styleAttr}>${label}</option>`;
            });
            if (selectedId) {
                select.value = String(selectedId);
            }
        }
    } catch(err) { console.error('Error loading ambulances dropdown:', err); }
}

document.getElementById('addDriverSectionBtn')?.addEventListener('click', () => openDriverModal(null));
document.getElementById('closeDriverModal')?.addEventListener('click', () => document.getElementById('driverModal').style.display = 'none');
document.getElementById('cancelDriverBtn')?.addEventListener('click', () => document.getElementById('driverModal').style.display = 'none');

async function openDriverModal(driverId) {
    document.getElementById('driverCrudForm').reset();
    document.getElementById('driver_id').value = '';
    document.getElementById('driverModalTitle').innerText = 'Add New Driver';
    
    if (driverId) {
        document.getElementById('driverModalTitle').innerText = 'Edit Driver';
        try {
            const res = await fetch('/api/vendor/driver/' + driverId);
            const result = await res.json();
            if (result.success && result.data) {
                const driver = result.data;
                document.getElementById('driver_id').value = driver.id;
                document.getElementById('driver_name').value = driver.driver_name || '';
                document.getElementById('driver_id_str').value = driver.driver_id_str || '';
                document.getElementById('driver_mobile').value = driver.mobile_number || '';
                document.getElementById('driver_status').value = driver.status || 'Active';
                document.getElementById('driver_address').value = driver.address || '';
                document.getElementById('driver_dl_number').value = driver.driving_license_number || '';
                if(driver.license_expiry_date) {
                    document.getElementById('driver_dl_expiry').value = driver.license_expiry_date.split('T')[0];
                }
                await loadAmbulanceDropdown(driver.assigned_ambulance_id, driver.id);
            }
        } catch(e) { 
            console.error(e); 
            await loadAmbulanceDropdown(null, null);
        }
    } else {
        await loadAmbulanceDropdown(null, null);
    }
    document.getElementById('driverModal').style.display = 'flex';
}

document.getElementById('driverCrudForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const driverId = document.getElementById('driver_id').value;
    
    formData.append('driver_name', document.getElementById('driver_name').value);
    formData.append('driver_id_str', document.getElementById('driver_id_str').value);
    formData.append('mobile_number', document.getElementById('driver_mobile').value);
    formData.append('status', document.getElementById('driver_status').value);
    formData.append('address', document.getElementById('driver_address').value);
    formData.append('driving_license_number', document.getElementById('driver_dl_number').value);
    formData.append('license_expiry_date', document.getElementById('driver_dl_expiry').value);
    formData.append('assigned_ambulance_id', document.getElementById('assigned_ambulance_id') ? document.getElementById('assigned_ambulance_id').value : '');
    
    const photo = document.getElementById('driver_photo_upload').files[0];
    if (photo) formData.append('driver_photo', photo);
    const doc = document.getElementById('driver_dl_doc_upload').files[0];
    if (doc) formData.append('driving_license_doc', doc);

    const url = driverId ? '/api/vendor/driver/update/' + driverId : '/api/vendor/driver/create';
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
            document.getElementById('driverModal').style.display = 'none';
            loadDrivers();
            loadAmbulanceDropdown();
            
            if (result.driver && (result.driver.ambulance_type || (result.driver.ambulance && (result.driver.ambulance.ambulance_type || result.driver.ambulance.vehicle_number)))) {
                const sharePrompt = confirm('Driver saved successfully! Do you want to share the assigned ambulance details with the driver on WhatsApp now?');
                if (sharePrompt) {
                    shareDriverWhatsApp({
                        ...result.driver,
                        ambulance_type: result.driver.ambulance?.ambulance_type || result.driver.ambulance_type,
                        vehicle_number: result.driver.ambulance?.vehicle_number || result.driver.vehicle_number,
                        base_chrge: result.driver.ambulance?.base_chrge || result.driver.base_chrge,
                        min_chrge: result.driver.ambulance?.min_chrge || result.driver.min_chrge,
                        area: result.driver.ambulance?.area || result.driver.area,
                        eta: result.driver.ambulance?.eta || result.driver.eta
                    });
                }
            } else {
                alert('Driver saved successfully!');
            }
        } else {
            alert(result.message || 'Failed to save driver');
        }
    } catch(err) {
        alert('Server error');
    }
});

async function deleteDriver(driverId) {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
        const res = await fetch('/api/vendor/driver/delete/' + driverId, { method: 'POST' });
        const result = await res.json();
        if (result.success) {
            loadDrivers();
            loadAmbulanceDropdown();
        } else {
            alert(result.message || 'Failed to delete driver');
        }
    } catch(err) { alert('Server error'); }
}

function initFleetMap() {
    if (window.fleetMapInitialized) return;
    const mapContainer = document.getElementById("fleetMap");
    if (!mapContainer || typeof L === "undefined") return;

    window.fleetMap = L.map("fleetMap").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "� OpenStreetMap contributors"
    }).addTo(window.fleetMap);
    window.fleetMapInitialized = true;

    // Simulate getting ambulance locations
    const ambIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/883/883360.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const mockAmbulances = [
        { lat: 19.0760, lng: 72.8777, name: "MH-01-AB-1234", status: "Available" },
        { lat: 28.7041, lng: 77.1025, name: "DL-10-XY-9876", status: "On Route" },
        { lat: 12.9716, lng: 77.5946, name: "KA-05-ZX-5555", status: "Available" }
    ];

    mockAmbulances.forEach(amb => {
        L.marker([amb.lat, amb.lng], { icon: ambIcon })
            .addTo(window.fleetMap)
            .bindPopup(`<b>${amb.name}</b><br>Status: ${amb.status}`);
    });
    
    // Invalidate size in case map is rendered while container is hidden
    setTimeout(() => {
        window.fleetMap.invalidateSize();
    }, 100);
}

