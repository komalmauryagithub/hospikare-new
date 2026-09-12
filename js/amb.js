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
function openProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}

async function loadUserProfile(){
    try{
        const response = await fetch('/api/user/profile', { credentials: 'include' });
        const result = await response.json();
        if(result.success){
            const vendorName = result.user?.name || result.details?.vendor_name || "Vendor";
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

document.getElementById("logoutBtn")?.addEventListener("click", logout);
async function logout(event){
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try{
        const response =
            await fetch('/api/user/logout',{
                    method:'POST',
                    credentials: 'include'
                }
            );
        const result =
            await response.json();
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
                        <i class="fa-solid fa-trash delete-amb-btn" onclick="deleteAmbulance(${ambulance.id})" title="Delete Ambulance"></i>
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

document.getElementById(
    "ambulanceForm"
).addEventListener(
    "submit",
    async(e) => {
        e.preventDefault();
        const formData =
            new FormData();
        formData.append(
            "ambulance_type",
            document.getElementById(
                "ambulance_type"
            ).value
        );
        formData.append(
            "base_chrge",
            document.getElementById(
                "base_chrge"
            ).value
        );
        formData.append(
            "min_chrge",
            document.getElementById(
                "min_chrge"
            ).value
        );
        formData.append(
            "night_chrg",
            document.getElementById(
                "night_chrg"
            ).value
        );
        formData.append(
            "wait_chrg",
            document.getElementById(
                "wait_chrg"
            ).value
        );
        formData.append(
            "status",
            document.getElementById(
                "status"
            ).value
        );
        formData.append(
            "eta",
            document.getElementById(
                "eta"
            ).value
        );
        formData.append(
            "book_time_slot",
            document.getElementById(
                "book_time_slot"
            ).value
        );
        formData.append(
            "area",
            document.getElementById(
                "area"
            ).value
        );
        formData.append(
            "description",
            document.getElementById(
                "description"
            ).value
        );
        formData.append(
            "driver_exp",
            document.getElementById(
                "driver_exp"
            ).value
        );
        formData.append(
            "lic",
            document.getElementById(
                "lic"
            ).files[0]
        );
        formData.append(
            "rc",
            document.getElementById(
                "rc"
            ).files[0]
        );
        formData.append(
            "veh_ins",
            document.getElementById(
                "veh_ins"
            ).files[0]
        );
        try{
            const response =
                await fetch(
                    '/api/add/ambulance',
                    {
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            if(result.success){
                showToast(
                    "Ambulance Added"
                );
                document.getElementById(
                    "ambulanceModal"
                ).style.display =
                    "none";
                loadAmbulances();
            }
        }
        catch(error){
            console.log(error);
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
