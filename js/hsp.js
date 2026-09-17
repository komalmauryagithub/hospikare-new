let appliedDashboardDateFrom = "";
let appliedDashboardDateTo = "";
let appliedDashboardRangeLabel = "All Time";
let hospitalPanelSearchTerm = "";

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

function getHospitalPanelSearchTerm() {
    const searchInput =
        document.getElementById("hospitalPanelSearch");

    return String(searchInput?.value || "")
        .trim()
        .toLowerCase();
}

function applyHospitalPanelSearch() {
    hospitalPanelSearchTerm =
        getHospitalPanelSearchTerm();

    const rows =
        document.querySelectorAll("#mainContent tbody tr");

    rows.forEach(row => {
        const text =
            row.innerText.toLowerCase();
        const isEmptyRow =
            row.querySelector("td[colspan]");

        row.style.display =
            !hospitalPanelSearchTerm
            || isEmptyRow
            || text.includes(hospitalPanelSearchTerm)
                ? ""
                : "none";
    });
}

function setupHospitalPanelSearch() {
    const searchInput =
        document.getElementById("hospitalPanelSearch");
    const searchButton =
        document.getElementById("hospitalPanelSearchBtn");

    if (!searchInput) {
        return;
    }

    const runSearch = () => {
        applyHospitalPanelSearch();
    };

    searchInput.addEventListener(
        "input",
        runSearch
    );
    searchInput.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
            }
        }
    );
    searchButton?.addEventListener(
        "click",
        runSearch
    );
}

function reloadCurrentHospitalPanel() {
    const activeId =
        document.querySelector(".menuItem.active")?.id
        || "dashboardBtn";

    if (activeId === "hospitalsBtn") {
        loadHospitals();
    }
    else if (activeId === "availabilityBtn") {
        loadAvailability();
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
        reloadCurrentHospitalPanel();
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
            reloadCurrentHospitalPanel();
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

function setupHospitalDashboardCardLinks() {
    document.querySelectorAll(".dashboard-link")
        .forEach(item => {
            const target =
                document.getElementById(
                    item.dataset.dashboardTarget
                );

            if(!target){
                return;
            }

            item.classList.add("clickable-card");
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");

            const openTarget = () => target.click();

            item.addEventListener("click", event => {
                if (
                    event.target.closest(
                        "a, button, input, select, textarea"
                    )
                ) {
                    return;
                }

                openTarget();
            });
            item.addEventListener("keydown", event => {
                if(
                    event.key === "Enter"
                    || event.key === " "
                ){
                    event.preventDefault();
                    openTarget();
                }
            });
        });
}

setupDashboardDateFilter();
setupHospitalPanelSearch();
loadDashboard();

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
            const vendorName = result.user?.name || result.details?.hospital_name || "Vendor";
            currentVendorName = vendorName;
            const welcomeText = document.getElementById("welcomeText");
            if (welcomeText) welcomeText.innerText = `Welcome ${vendorName}`;
            document.querySelectorAll(".vendor-display-name").forEach(el => {
                el.textContent = vendorName;
            });
            fillProfileForm(result.user, result.details || {});
            const isComplete = result.user.bank_account && result.user.ifsc;
            if(window.setProfileMode) {
                window.setProfileMode(isComplete ? 'view' : 'edit');
            }
        }
    } catch(err) {
        console.error("Error loading profile:", err);
    }
}

document.getElementById("hospitalForm")
.addEventListener(
    "submit",
    async function(e){
        e.preventDefault();
        const formData = new FormData();
        formData.append(
            "hospital_name",
            document.getElementById("hospital_name").value
        );
        formData.append(
            "address",
            document.getElementById("hospital_address").value
        );
        formData.append(
            "facilities",
            document.getElementById("hospital_facilities").value
        );
        formData.append(
            "live_api_url",
            document.getElementById("hospital_live_api_url").value
        );
        formData.append(
            "live_api_key",
            document.getElementById("hospital_live_api_key").value
        );
        const hospitalImages = document.getElementById("hospital_images");
        const maxHospitalImages = hospitalImages && hospitalImages.files ? Math.min(hospitalImages.files.length, 4) : 0;
        for(let i = 0; i < maxHospitalImages; i++){
            formData.append("hospital_images", hospitalImages.files[i]);
        }
        const rooms = [];
        document.querySelectorAll(".roomBox").forEach(room => {
            const roomImgs = room.querySelector(".room_images").files;
            const maxRoomImages = roomImgs ? Math.min(roomImgs.length, 4) : 0;
            for(let j=0; j < maxRoomImages; j++){
                formData.append("room_images", roomImgs[j]);
            }
            rooms.push({
                room_type: room.querySelector(".room_type").value,
                pricing: room.querySelector(".room_pricing").value,
                total_beds: room.querySelector(".room_total_beds").value,
                details: room.querySelector(".room_details").value,
                availability: room.querySelector(".room_availability").value,
                imageCount: maxRoomImages
            });
        });
        formData.append(
            "rooms",
            JSON.stringify(rooms)
        );
        const doctors = [];
        document.querySelectorAll(
            ".doctorBox"
        ).forEach(doc => {
            doctors.push({
                doctor_name:
                    doc.querySelector(
                        ".doctor_name"
                    ).value,
                qualification:
                    doc.querySelector(
                        ".doctor_qualification"
                    ).value,
                experience:
                    doc.querySelector(
                        ".doctor_experience"
                    ).value
            });
        });
        formData.append(
            "doctors",
            JSON.stringify(doctors)
        );
        const hospitalReg =
            document.getElementById(
                "hospital_reg_certificate"
            );
        if(hospitalReg.files[0]){
            formData.append(
                "hospital_reg_certificate",
                hospitalReg.files[0]
            );
        }
        const shopLicense =
            document.getElementById(
                "shop_license"
            );
        if(shopLicense.files[0]){
            formData.append(
                "shop_license",
                shopLicense.files[0]
            );
        }
        const medicalCouncil =
            document.getElementById(
                "medical_council_registration"
            );
        if(medicalCouncil.files[0]){
            formData.append(
                "medical_council_registration",
                medicalCouncil.files[0]
            );
        }
        const electricityBill =
            document.getElementById(
                "electricity_bill"
            );
        if(electricityBill.files[0]){
            formData.append(
                "electricity_bill",
                electricityBill.files[0]
            );
        }
        try{
            const response =
                await fetch(
                    '/api/add/hospital',
                    {
                        method:'POST',
                        body:formData
                    }
                );
            const result =
                await response.json();
            console.log(result);
            if(result.success){
                alert(
                    "Hospital Added Successfully"
                );
                document.getElementById(
                    "hospitalModal"
                ).style.display = "none";
                loadHospitals();
            }
            else{
                alert(
                    result.message ||
                    "Failed To Add Hospital"
                );
            }
        }
        catch(error){
            console.log(error);
        }
});

document.getElementById("closeRoomModal").addEventListener("click", () => {
    document.getElementById(
        "roomModal"
    ).style.display = "none";
});

async function loadHospitalDropdown(){
    try{
        const response =
            await fetch('/api/user/hospitals');
        const result =
            await response.json();
        const dropdown =
            document.getElementById(
                "room_hospital"
            );
        dropdown.innerHTML = "";
        result.hospitals.forEach(hospital => {
            dropdown.innerHTML += `
            <option
                value="${hospital.id}"
            >
                ${hospital.hospital_name}
            </option>
            `;
        });
    }
    catch(error){
        console.log(error);
    }
}

document.getElementById("roomForm")
.addEventListener(
    "submit",
    async function(e){
        e.preventDefault();
        try{
            const formData = new FormData();
            formData.append("hospital_id", document.getElementById("room_hospital").value);
            formData.append("details", document.getElementById("room_details").value);
            formData.append("pricing", document.getElementById("room_pricing").value);
            formData.append("room_type", document.getElementById("room_type").value);
            formData.append("total_beds", document.getElementById("room_total_beds").value);
            formData.append("availability", document.getElementById("room_availability").value);
            
            // Add room images (max 4)
            const roomImagesInput = document.getElementById("room_images");
            const maxRoomImages = Math.min(roomImagesInput.files.length, 4);
            for(let i = 0; i < maxRoomImages; i++){
                formData.append("room_images", roomImagesInput.files[i]);
            }
            
            const response = await fetch('/api/add/room', {
                method:'POST',
                body: formData
            });
            const result = await response.json();
            if(result.success){
                alert("Room Added Successfully");
                document.getElementById("roomModal").style.display = "none";
                document.getElementById("roomForm").reset();
                loadAvailability();
            }
            else{
                alert(result.message || "Failed to add room");
            }
        }
        catch(error){
            console.log(error);
            alert("Error adding room");
        }
});

async function updateRoom(hospitalId,roomIndex){
    try{
        const beds = document.getElementById(`beds_${hospitalId}_${roomIndex}` ).value;
        const availability = document.getElementById(`availability_${hospitalId}_${roomIndex}`).value;
        const response = await fetch('/api/update/room',{
                    method:'PUT',
                    headers:{
                        'Content-Type':
                        'application/json'
                    },
                    body:JSON.stringify({
                        hospital_id:hospitalId,
                        room_index:roomIndex,
                        total_beds:beds,
                        availability:availability
                    })
                }
            );
        const result =
            await response.json();
        if(result.success){
            alert(
                "Room Updated Successfully"
            );
            loadAvailability();
        }
        else{
            alert(result.message);
        }
    }
    catch(error){
        console.log(error);
    }
}

async function loadHospitals(){
    try{
        const response = await fetch('/api/hospitals');
        const result = await response.json();

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="font-size: 24px; color: var(--text-main, #1e293b); font-weight: 700;">My Hospitals</h2>
                <button id="addHospitalBtn" style="padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; background-color: var(--sidebar-active-bg, #2563eb); color: white; border: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    <i class="fa-solid fa-plus"></i> Add Hospital
                </button>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hospital Name</th>
                            <th>City</th>
                            <th>Address</th>
                            <th>Rooms</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="hospitalsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("hospitalsTableBody");

        if(!result.success || !result.hospitals || result.hospitals.length === 0){
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No Hospitals Found</td></tr>';
            return;
        }

        result.hospitals.forEach(hospital => {
            let roomCount = 0;
            try {
                const rooms = typeof hospital.rooms === 'string' ? JSON.parse(hospital.rooms) : (hospital.rooms || []);
                roomCount = rooms.length;
            } catch(e) { roomCount = 0; }

            tbody.innerHTML += `
            <tr>
                <td>${hospital.id}</td>
                <td><span style="font-weight:600; color:var(--text-main, #1e293b);">${hospital.hospital_name || ''}</span></td>
                <td>${hospital.city || '-'}</td>
                <td>${hospital.address || '-'}</td>
                <td>${roomCount} rooms</td>
                <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#16a34a;">${hospital.status || 'Active'}</span></td>
            </tr>
            `;
        });
        applyHospitalPanelSearch();

        // Wire up Add Hospital button to open the modal
        const addBtn = document.getElementById("addHospitalBtn");
        if(addBtn){
            addBtn.addEventListener("click", () => {
                document.getElementById("hospitalModal").style.display = "flex";
            });
        }
    }
    catch(error){
        console.log(error);
    }
}

async function loadAvailability(){
    try{
        const response = await fetch('/api/hospital/availability');
        const result = await response.json();

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: var(--text-main, #1e293b); font-weight: 700;">Room Availability</h2>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>Hospital</th>
                            <th>Room Type</th>
                            <th>Total Beds</th>
                            <th>Pricing</th>
                            <th>Availability</th>
                        </tr>
                    </thead>
                    <tbody id="availabilityTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("availabilityTableBody");

        if(!result.success || !result.hospitals || result.hospitals.length === 0){
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No Available Rooms Found</td></tr>';
            return;
        }

        result.hospitals.forEach(hospital => {
            let rooms = [];
            try {
                rooms = typeof hospital.rooms === 'string' ? JSON.parse(hospital.rooms) : (hospital.rooms || []);
            } catch(e) { rooms = []; }

            rooms.forEach(room => {
                const isAvailable = room.availability && room.availability.toLowerCase() === 'available';
                const badgeStyle = isAvailable
                    ? 'background:#dcfce7; color:#16a34a;'
                    : 'background:#fee2e2; color:#dc2626;';

                tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight:600; color:var(--text-main, #1e293b);">${hospital.hospital_name || ''}</span></td>
                    <td>${room.room_type || '-'}</td>
                    <td>${room.total_beds || '-'}</td>
                    <td style="font-weight:600; color:#16a34a;">₹${room.pricing || '0'}</td>
                    <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; ${badgeStyle}">${room.availability || 'N/A'}</span></td>
                </tr>
                `;
            });
        });
        applyHospitalPanelSearch();
    }
    catch(error){
        console.log(error);
    }
}

async function loadBookings(){
    try{
        const response = await fetch('/api/hospital/bookings');
        const result = await response.json();
        
        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">Hospital Bookings</h2>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Age/Gender</th>
                            <th>Hospital</th>
                            <th>Room/Bed</th>
                            <th>Admission</th>
                            <th>Discharge</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody id="bookingsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("bookingsTableBody");
        const bookings =
            filterDashboardRecords(
                result.bookings,
                [
                    "created_at",
                    "booking_date",
                    "admission_date",
                    "appointment_date"
                ]
            );

        if(bookings.length === 0){
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">No Bookings Found</td></tr>`;
            return;
        }

        bookings.forEach(booking => {
            tbody.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td><span style="font-weight:600; color:var(--text-main, #1e293b);">${booking.patient_name}</span></td>
                <td>${booking.patient_age} / ${booking.patient_gender}</td>
                <td>${booking.hospital_name}</td>
                <td>
                    <span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#e0e7ff; color:#4338ca; display:block; margin-bottom:4px;">${booking.room_type}</span>
                    <span style="font-size:12px; color:var(--text-muted, #64748b);">${booking.bed_type}</span>
                </td>
                <td>${booking.admission_date}</td>
                <td>${booking.discharge_date}</td>
                <td style="font-weight:600; color:#16a34a;">₹${booking.total_amount}</td>
            </tr>
            `;
        });
        applyHospitalPanelSearch();
    }
    catch(error){
        console.log(error);
    }
}
loadBookings();

async function loadPayments(){
    try{
        const response = await fetch('/api/vendor/payments');
        const result = await response.json();

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">Vendor Payments</h2>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Amount</th>
                            <th>Razorpay Payment ID</th>
                            <th>Status</th>
                            <th>Paid At</th>
                        </tr>
                    </thead>
                    <tbody id="paymentsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("paymentsTableBody");
        const payments =
            filterDashboardRecords(
                result.payments,
                ["paid_at", "created_at"]
            );

        if(payments.length === 0){
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No Payments Found</td></tr>`;
            return;
        }

        payments.forEach(payment => {
            let statusColor = payment.payment_status === 'Success' ? 'background:#dcfce7; color:#15803d;' : 'background:#fef3c7; color:#b45309;';
            tbody.innerHTML += `
            <tr>
                <td><span style="font-weight:600; color:var(--text-muted, #475569);">#${payment.vendor_id}</span></td>
                <td style="font-weight:700; font-size:15px; color:var(--text-main, #1e293b);">₹${payment.amount}</td>
                <td><span style="font-family:monospace; color:var(--text-muted, #64748b);">${payment.razorpay_payment_id || '-'}</span></td>
                <td>
                    <span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; ${statusColor}">${payment.payment_status || '-'}</span>
                </td>
                <td>${payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '-'}</td>
            </tr>
            `;
        });
        applyHospitalPanelSearch();
    }
    catch(error){
        console.log(error);
    }
}

async function loadDashboard(){
    try{
        const bookingResponse = await fetch('/api/hospital/bookings');
        const bookingResult = await bookingResponse.json();
        
        const paymentResponse = await fetch('/api/vendor/payments');
        const paymentResult = await paymentResponse.json();

        const bookings = filterDashboardRecords(
            bookingResult.bookings,
            [
                "created_at",
                "booking_date",
                "admission_date",
                "appointment_date"
            ]
        );
        const payments = filterDashboardRecords(
            paymentResult.payments,
            ["paid_at", "created_at"]
        );

        let totalRevenue = 0;
        payments.forEach(payment => {
            totalRevenue += Number(payment.amount || 0);
        });

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <!-- HEALTHCARE COMMAND CENTRE HERO BANNER -->
            <div class="hero-welcome-card">
                <div class="hero-text-content">
                    <h2>Welcome, <span class="vendor-display-name">${escapeHtml(currentVendorName)}</span> <i class="fa-solid fa-circle-check" style="color: #18B981; font-size: 18px;"></i></h2>
                    <p>Here’s what’s happening with your hospital occupancy and inpatient admissions today.</p>
                </div>
                <div class="hero-quick-actions">
                    <button class="hero-btn" id="heroAddHospitalBtn" onclick="document.getElementById('hospitalsBtn').click(); document.getElementById('addHospitalBtn')?.click();"><i class="fa-solid fa-plus"></i> Add Hospital</button>
                    <button class="hero-btn" id="heroAvailabilityBtn" onclick="document.getElementById('availabilityBtn').click();"><i class="fa-solid fa-bed-pulse"></i> Manage Beds</button>
                </div>
            </div>

            <!-- BENTO KPI METRIC GRID -->
            <div id="dashboardCards" class="grid-container" style="margin-bottom: 24px;">
                <div class="dashCard featured-card dashboard-link" data-dashboard-target="paymentsBtn">
                    <div class="card-icon icon-purple">
                        <i class="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Earnings</h3>
                            <span class="trend positive"><i class="fa-solid fa-arrow-trend-up"></i> +16.4%</span>
                        </div>
                        <h1>₹${totalRevenue.toLocaleString()}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill purple" style="width: 85%;"></div></div>
                            <div class="card-progress-info"><span>Monthly Target: ₹2,50,000</span><span class="target-val">85% Reached</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="bookingsBtn">
                    <div class="card-icon icon-blue">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Total Bookings</h3>
                            <span class="trend positive"><i class="fa-solid fa-check"></i> Active</span>
                        </div>
                        <h1>${bookings.length}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill" style="width: 72%;"></div></div>
                            <div class="card-progress-info"><span>Target: 100 Patients</span><span class="target-val">72% Target</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="availabilityBtn">
                    <div class="card-icon icon-green">
                        <i class="fa-solid fa-bed"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Room Bookings</h3>
                            <span class="trend positive">Occupied</span>
                        </div>
                        <h1>${bookings.length}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill green" style="width: 64%;"></div></div>
                            <div class="card-progress-info"><span>Capacity: 50 Beds</span><span class="target-val">Live Inpatient</span></div>
                        </div>
                    </div>
                </div>

                <div class="dashCard dashboard-link" data-dashboard-target="bookingsBtn">
                    <div class="card-icon icon-cyan">
                        <i class="fa-solid fa-user-doctor"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-meta-row">
                            <h3>Appointments</h3>
                            <span class="trend positive">Scheduled</span>
                        </div>
                        <h1>${bookings.length}</h1>
                        <div class="card-progress-wrap">
                            <div class="card-progress-bar"><div class="card-progress-fill cyan" style="width: 90%;"></div></div>
                            <div class="card-progress-info"><span>Doctors On Duty</span><span class="target-val">On Track</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CHARTS SECTION -->
            <div id="chartsGrid">
                <div class="chartWrapper dashboard-link" data-dashboard-target="paymentsBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Hospital Revenue Trend</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Inpatient & outpatient admissions</p>
                            </div>
                        </div>
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background: rgba(40, 100, 240, 0.1); color: var(--hk-primary-blue); font-size: 12px; font-weight: 700;">₹ Financial Stream</span>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%;">
                        <canvas id="hspRevenueChart"></canvas>
                    </div>
                </div>

                <div class="chartWrapper dashboard-link" data-dashboard-target="bookingsBtn">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid var(--hk-divider); padding-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(25, 191, 211, 0.1); color: var(--hk-cyan); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                <i class="fa-solid fa-chart-pie"></i>
                            </div>
                            <div>
                                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--hk-text-main); margin: 0 0 2px 0;">Booking Distribution</h3>
                                <p style="font-size: 12px; color: var(--hk-text-muted); margin: 0;">Department allocation</p>
                            </div>
                        </div>
                    </div>
                    <div style="position: relative; height: 280px; width: 100%; display:flex; justify-content:center; align-items:center;">
                        <canvas id="hspBookingChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- RECENT ACTIVITY SECTION -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="table-wrapper dashboard-link dashboard-clickable-panel" data-dashboard-target="bookingsBtn" style="margin: 0;">
                    <div class="table-header">
                        <h3>Recent Bookings</h3>
                    </div>
                    <div class="table-container" style="border:none; box-shadow:none; margin:0;">
                        <table class="adminTable">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Hospital</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="recentBookingsBody">
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
                            <tbody id="recentPaymentsBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        setupHospitalDashboardCardLinks();

        // Render Charts with Clean Instance Management & Theme Adaptability
        if (window.hspRevenueChartInstance) {
            window.hspRevenueChartInstance.destroy();
            window.hspRevenueChartInstance = null;
        }
        if (window.hspBookingChartInstance) {
            window.hspBookingChartInstance.destroy();
            window.hspBookingChartInstance = null;
        }

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#94A3B8" : "#64748B";
        const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";
        const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

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

        if (past6Revenue.every(v => v === 0) && totalRevenue > 0) {
            past6Revenue[5] = totalRevenue;
        }

        const revCanvas = document.getElementById('hspRevenueChart');
        if (revCanvas) {
            const revCtx = revCanvas.getContext('2d');
            let gradBlue = revCtx.createLinearGradient(0, 0, 0, 260);
            gradBlue.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.18)');
            gradBlue.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

            window.hspRevenueChartInstance = new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: past6Months,
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: past6Revenue,
                        borderColor: '#2563EB',
                        backgroundColor: gradBlue,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.38,
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
            });
        }

        // Room / Department booking distribution
        let generalCount = 0;
        let icuCount = 0;
        let deluxeCount = 0;
        let otherCount = 0;

        bookings.forEach(b => {
            const rt = (b.room_type || b.department || '').toLowerCase();
            if (rt.includes('icu') || rt.includes('critical')) icuCount++;
            else if (rt.includes('deluxe') || rt.includes('private') || rt.includes('vip')) deluxeCount++;
            else if (rt.includes('general') || rt.includes('ward')) generalCount++;
            else otherCount++;
        });

        const totalDeptBookings = generalCount + icuCount + deluxeCount + otherCount;
        const bookingData = totalDeptBookings > 0 ? [generalCount, icuCount, deluxeCount, otherCount] : [1, 0, 0, 0];
        const bookingColors = totalDeptBookings > 0 ? ['#2563EB', '#DC2626', '#10B981', '#F59E0B'] : ['#64748B', '#64748B', '#64748B', '#64748B'];

        const bookCanvas = document.getElementById('hspBookingChart');
        if (bookCanvas) {
            const bookCtx = bookCanvas.getContext('2d');
            window.hspBookingChartInstance = new Chart(bookCtx, {
                type: 'doughnut',
                data: {
                    labels: ['General Ward', 'ICU Care', 'Deluxe Room', 'Specialty'],
                    datasets: [{
                        data: bookingData,
                        backgroundColor: bookingColors,
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
                            cornerRadius: 10,
                            callbacks: {
                                label: ctx => totalDeptBookings === 0 ? ' No data available' : ` ${ctx.label}: ${ctx.parsed} bookings`
                            }
                        }
                    }
                }
            });
        }

        // Populate recent tables
        const bookingBody = document.getElementById("recentBookingsBody");
        if(bookings.length === 0){
             bookingBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No recent bookings</td></tr>`;
        } else {
            bookings.slice(0,5).forEach(booking => {
                bookingBody.innerHTML += `
                <tr>
                    <td style="font-weight:600; color:var(--text-main, #1e293b);">${booking.patient_name}</td>
                    <td>${booking.hospital_name}</td>
                    <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#15803d;">Confirmed</span></td>
                </tr>
                `;
            });
        }

        const paymentBody = document.getElementById("recentPaymentsBody");
        if(payments.length === 0){
             paymentBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No recent payments</td></tr>`;
        } else {
            payments.slice(0,5).forEach(payment => {
                let statusColor = payment.payment_status === 'Success' ? 'background:#dcfce7; color:#15803d;' : 'background:#fef3c7; color:#b45309;';
                paymentBody.innerHTML += `
                <tr>
                    <td style="font-weight:700; color:var(--text-main, #1e293b);">₹${payment.amount}</td>
                    <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; ${statusColor}">${payment.payment_status}</span></td>
                    <td>${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}</td>
                </tr>
                `;
            });
        }
        applyHospitalPanelSearch();
    }
    catch(error){
        console.log(error);
    }
}

// Re-render hospital charts on theme toggle
window.addEventListener("hk-theme-change", () => {
    const dashSec = document.getElementById("dashboardSection");
    if (dashSec && dashSec.style.display !== "none") {
        loadDashboard();
    }
});

// Sidebar Navigation Logic
document.querySelectorAll('.menuItem').forEach(item => {
    item.addEventListener('click', () => {
        if(item.id === 'logoutBtn' || item.innerText.trim().toLowerCase() === 'logout') return;
        document.querySelectorAll('.menuItem').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (item.id === 'hospitalsBtn') loadHospitals();
        else if (item.id === 'availabilityBtn') loadAvailability();
        else if (item.id === 'bookingsBtn') loadBookings();
        else if (item.id === 'paymentsBtn') loadPayments();
        else loadDashboard();
    });
});

// Close Hospital Modal
const closeHospitalModalBtn = document.getElementById("closeHospitalModal");
if(closeHospitalModalBtn){
    closeHospitalModalBtn.addEventListener("click", () => {
        document.getElementById("hospitalModal").style.display = "none";
    });
}

async function logout(event) {
    if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
    }
    try {
        const response = await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
        const result = await response.json();
        if (result.success) window.location.href = '/rg.html';
    } catch(error) {
        console.log(error);
    }
}

// ====== HOSPITAL FORM UI LOGIC ====== 

// ====== HOSPITAL FORM UI LOGIC ====== 

const addRoomBtn = document.getElementById('addRoomBtn');
if(addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
        const container = document.getElementById('roomsContainer');
        const roomBox = document.createElement('div');
        roomBox.className = 'roomBox';
        roomBox.style = 'border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative;';
        roomBox.innerHTML = `
            <button type="button" class="removeRoomBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Room Details</label>
                <input type="text" class="top-search room_details" placeholder="e.g. AC Room with TV" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Pricing</label>
                <input type="number" class="top-search room_pricing" placeholder="Price per night" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Type</label>
                <select class="top-search room_type">
                    <option value="General">General</option>
                    <option value="ICU">ICU</option>
                    <option value="Deluxe">Deluxe</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Total Beds</label>
                <input type="number" class="top-search room_total_beds" placeholder="Total Beds" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Availability</label>
                <select class="top-search room_availability">
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Images</label>
                <input type="file" class="top-search room_images" multiple accept="image/*">
            </div>
        `;
        roomBox.querySelector('.removeRoomBtn').addEventListener('click', () => { roomBox.remove(); });
        container.appendChild(roomBox);
    });
}

const addDoctorBtn = document.getElementById('addDoctorBtn');
if(addDoctorBtn) {
    addDoctorBtn.addEventListener('click', () => {
        const container = document.getElementById('doctorsContainer');
        const doctorBox = document.createElement('div');
        doctorBox.className = 'doctorBox';
        doctorBox.style = 'border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr; gap: 12px; position: relative;';
        doctorBox.innerHTML = `
            <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Doctor Name</label>
                <input type="text" class="top-search doctor_name" placeholder="Dr. John Doe" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600;">Qualification</label>
                    <input type="text" class="top-search doctor_qualification" placeholder="MBBS, MD" required>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 12px; font-weight: 600;">Experience</label>
                    <input type="text" class="top-search doctor_experience" placeholder="10 Years" required>
                </div>
            </div>
        `;
        doctorBox.querySelector('.removeDoctorBtn').addEventListener('click', () => { doctorBox.remove(); });
        container.appendChild(doctorBox);
    });
}

const importDoctorsCSVBtn = document.getElementById('importDoctorsCSVBtn');
const csvImportModal = document.getElementById('csvImportModal');
const closeCsvImportModal = document.getElementById('closeCsvImportModal');

if(importDoctorsCSVBtn && csvImportModal) {
    importDoctorsCSVBtn.addEventListener('click', () => {
        csvImportModal.style.display = 'flex';
    });
}
if(closeCsvImportModal && csvImportModal) {
    closeCsvImportModal.addEventListener('click', () => {
        csvImportModal.style.display = 'none';
    });
}

// Process CSV logic
const processCSVBtn = document.getElementById('uploadCsvBtn');
const cancelCsvImportBtn = document.getElementById('cancelCsvImportBtn');

if(cancelCsvImportBtn && csvImportModal) {
    cancelCsvImportBtn.addEventListener('click', () => {
        csvImportModal.style.display = 'none';
    });
}

if(processCSVBtn) {
    processCSVBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('csvFileInput');
        if(!fileInput.files.length) { alert('Please select a CSV file first.'); return; }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const lines = text.split('\n');
            if (lines.length === 0) return;
            
            let headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const nameIdx = headers.indexOf('doctor_name');
            const qualIdx = headers.indexOf('qualification');
            const expIdx = headers.indexOf('experience');
            
            if (nameIdx === -1) { alert('CSV must contain a column named doctor_name'); return; }
            
            const container = document.getElementById('doctorsContainer');
            
            for (let i = 1; i < lines.length; i++) {
                if(!lines[i].trim()) continue;
                const cols = lines[i].split(',').map(c => c.trim());
                
                const doctorBox = document.createElement('div');
                doctorBox.className = 'doctorBox';
                doctorBox.style = 'border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr; gap: 12px; position: relative;';
                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600;">Doctor Name</label>
                        <input type="text" class="top-search doctor_name" value="${cols[nameIdx] || ''}" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification</label>
                            <input type="text" class="top-search doctor_qualification" value="${qualIdx !== -1 ? cols[qualIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Experience</label>
                            <input type="text" class="top-search doctor_experience" value="${expIdx !== -1 ? cols[expIdx] : ''}" required>
                        </div>
                    </div>
                `;
                doctorBox.querySelector('.removeDoctorBtn').addEventListener('click', () => { doctorBox.remove(); });
                container.appendChild(doctorBox);
            }
            
            csvImportModal.style.display = 'none';
            fileInput.value = '';
            alert('Doctors imported successfully! You can review them before submitting.');
        };
        reader.readAsText(file);
    });
}


const profileSectionTrigger = document.getElementById("profileSectionTrigger");
if (profileSectionTrigger) {
    profileSectionTrigger.addEventListener("click", (event) => {
        if (event.target.closest("#logoutBtn")) return;
        openProfileModal();
    });
}
document.getElementById("closeProfileModal")?.addEventListener("click", closeProfileModal);

// Load user profile on page load
loadUserProfile();

document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const password = document.getElementById('profilePassword')?.value || '';
    const confirmPassword = document.getElementById('profileConfirmPassword')?.value || '';
    if (password && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    const formData = new FormData(form);
    if (!password) formData.delete('password');
    const response = await fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: formData });
    const result = await response.json();
    if (result.success) {
        alert('Profile updated successfully');
        closeProfileModal();
        await loadUserProfile();
    } else {
        alert(result.message || 'Profile update failed');
    }
});




