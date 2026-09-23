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
    else if (activeId === "hospitalDetailsBtn") {
        if (typeof loadHospitalProfiles === 'function') loadHospitalProfiles();
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
    if (emailField) emailField.value = profile.email || profile.emailorcontact || "";
    if (userTypeField && profile.users_type) userTypeField.value = profile.users_type;
    if (bankField) bankField.value = profile.bank_account || "";
    if (ifscField) ifscField.value = profile.ifsc || "";

    // Fill the vendor profile modal form
    const form = document.getElementById('vendorProfileForm');
    if (form) {
        // Map top-level profile fields to form inputs
        const profileMap = {
            'company_name': profile.company_name,
            'name': profile.name,
            'contact_number': profile.contact_number,
            'email': profile.email || profile.emailorcontact,
            'business_address': profile.business_address,
            'bank_account': profile.bank_account,
            'ifsc': profile.ifsc
        };
        for (const [key, val] of Object.entries(profileMap)) {
            const input = form.querySelector('[name="' + key + '"]');
            if (input && input.type !== 'file') {
                input.value = val || "";
            }
        }
    }

    // Additional entity details mapping if needed
    if (details) {
        for (const [key, value] of Object.entries(details)) {
            const input = document.querySelector('#vendorProfileForm [name="' + key + '"]');
            if (input && input.type !== 'file' && !input.value) { // only if not already filled
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
            const vendorName = result.user?.name || result.details?.hospital_name || "Vendor";
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
        formData.append("hospital_type", document.getElementById("add_hospital_type")?.value || "");
        formData.append("hospital_ownership", document.getElementById("add_hospital_ownership")?.value || "");
        formData.append("hospital_registration_number", document.getElementById("add_hospital_registration_number")?.value || "");
        formData.append(
            "live_api_url",
            document.getElementById("hospital_live_api_url").value
        );

        const hospitalImages = document.getElementById("hospital_images");
        const maxHospitalImages = hospitalImages && hospitalImages.files ? Math.min(hospitalImages.files.length, 4) : 0;
        for(let i = 0; i < maxHospitalImages; i++){
            formData.append("hospital_images", hospitalImages.files[i]);
        }
        const rooms = [];
        document.querySelectorAll(".roomBox").forEach(room => {
            const roomImgInput = room.querySelector(".room_images");
            const roomImgs = roomImgInput ? roomImgInput.files : [];
            const maxRoomImages = roomImgs ? Math.min(roomImgs.length, 4) : 0;
            for(let j=0; j < maxRoomImages; j++){
                formData.append("room_images", roomImgs[j]);
            }
            rooms.push({
                room_type: room.querySelector(".room_type").value,
                bed_type: room.querySelector(".room_bed_type").value,
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
        document.querySelectorAll(".doctorBox").forEach((doc, idx) => {
            const specSelect = doc.querySelector(".doctor_specialization");
            const specializations = Array.from(specSelect.selectedOptions).map(opt => opt.value);
            
            doctors.push({
                doctor_name: doc.querySelector(".doctor_name")?.value,
                gender: doc.querySelector(".doctor_gender")?.value,
                dob_age: doc.querySelector(".doctor_dob_age")?.value,
                mobile: doc.querySelector(".doctor_mobile")?.value,
                email: doc.querySelector(".doctor_email")?.value,
                specialization: specializations,
                qualification: doc.querySelector(".doctor_qualification")?.value,
                medical_reg_no: doc.querySelector(".doctor_reg_no")?.value,
                experience: doc.querySelector(".doctor_experience")?.value,
                department: doc.querySelector(".doctor_department")?.value,
                consultation_fee: doc.querySelector(".doctor_fee")?.value,
                available_days: doc.querySelector(".doctor_days")?.value,
                available_time: doc.querySelector(".doctor_time")?.value,
                status: doc.querySelector(".doctor_status")?.value
            });
        });
        formData.append(
            "doctors",
            JSON.stringify(doctors)
        );
        const hospitalReg = document.getElementById("hospital_reg_certificate");
        if(hospitalReg && hospitalReg.files[0]){
            formData.append("hospital_reg_certificate", hospitalReg.files[0]);
        }
        const shopLicense = document.getElementById("shop_license");
        if(shopLicense && shopLicense.files[0]){
            formData.append("shop_license", shopLicense.files[0]);
        }
        const medicalCouncil = document.getElementById("medical_council_registration");
        if(medicalCouncil && medicalCouncil.files[0]){
            formData.append("medical_council_registration", medicalCouncil.files[0]);
        }
        const electricityBill = document.getElementById("electricity_bill");
        if(electricityBill && electricityBill.files[0]){
            formData.append("electricity_bill", electricityBill.files[0]);
        }
        const bankCheque = document.getElementById("bank_cancelled_cheque");
        if(bankCheque && bankCheque.files[0]){
            formData.append("bank_cancelled_cheque", bankCheque.files[0]);
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
            formData.append("bed_type", document.getElementById("room_bed_type").value);
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
                            <th style="width:60px;">ID</th>
                            <th>Hospital Name</th>
                            <th>Type</th>
                            <th>Ownership</th>
                            <th>Address</th>
                            <th>Rooms</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="hospitalsTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("hospitalsTableBody");

        if(!result.success || !result.hospitals || result.hospitals.length === 0){
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">No Hospitals Found</td></tr>';
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
                <td><span style="font-weight:700; color:var(--text-main, #1e293b); font-size:14px;">${hospital.hospital_name || ''}</span></td>
                <td><span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${hospital.hospital_type || 'General Hospital'}</span></td>
                <td><span style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${hospital.hospital_ownership || 'Private'}</span></td>
                <td>${hospital.address || '-'}</td>
                <td>${roomCount} rooms</td>
                <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#16a34a;">${hospital.status || 'Active'}</span></td>
                <td>
                    <i class="fa-solid fa-pen-to-square" onclick="editHospitalAction(${hospital.id})" title="Edit Hospital" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-right: 15px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    <i class="fa-solid fa-trash" onclick="deleteHospitalAction(${hospital.id})" title="Delete Hospital" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                </td>
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
            <div style="margin-bottom: 25px; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="font-size: 24px; color: var(--text-main, #1e293b); font-weight: 700;">Room Availability</h2>
                <button id="openAddRoomModalBtn" style="padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; background-color: var(--sidebar-active-bg, #2563eb); color: white; border: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    <i class="fa-solid fa-plus"></i> Add Room
                </button>
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
                    <td>${room.room_type || '-'} <br><small style="color:#64748b;">${room.bed_type || '-'}</small></td>
                    <td>${room.total_beds || '-'}</td>
                    <td style="font-weight:600; color:#16a34a;">₹${room.pricing || '0'}</td>
                    <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; ${badgeStyle}">${room.availability || 'N/A'}</span></td>
                </tr>
                `;
            });
        });
        
        const openAddRoomBtn = document.getElementById("openAddRoomModalBtn");
        if (openAddRoomBtn) {
            openAddRoomBtn.addEventListener("click", async () => {
                await loadHospitalDropdown();
                document.getElementById("roomModal").style.display = "flex";
            });
        }
        
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
                            <th>User</th>
                            <th>Age/Gender</th>
                            <th>Hospital</th>
                            <th>Room/Bed</th>
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
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No Bookings Found</td></tr>`;
            return;
        }

        bookings.forEach(booking => {
            let paymentBadge = '';
            let paymentDetails = '';
            
            const totalAmt = parseFloat(booking.total_amount || 0);
            const paidAmt = parseFloat(booking.paid_amount || totalAmt); // fallback if null
            const isPart = booking.payment_type === 'Part';
            const balance = isPart ? Math.max(0, totalAmt - paidAmt) : 0;
            
            if (isPart) {
                paymentBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background:#fff7ed; color:#ea580c;">Part Payment</span>`;
                paymentDetails = `
                    <div style="font-size: 12px; margin-top: 4px;">
                        <div style="color: #64748b;">Total: <span style="color:#0f172a; font-weight:600;">₹${totalAmt}</span></div>
                        <div style="color: #64748b;">Paid: <span style="color:#16a34a; font-weight:600;">₹${paidAmt}</span></div>
                        <div style="color: #64748b;">Balance: <span style="color:#dc2626; font-weight:600;">₹${balance}</span></div>
                    </div>
                `;
            } else {
                paymentBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; background:#f0fdf4; color:#16a34a;">Full Payment</span>`;
                paymentDetails = `
                    <div style="font-size: 12px; margin-top: 4px;">
                        <div style="color: #64748b;">Total Paid: <span style="color:#16a34a; font-weight:600;">₹${totalAmt}</span></div>
                    </div>
                `;
            }

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
        const response = await fetch('/api/hospital/bookings');
        const result = await response.json();

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 24px; color: #1e293b; font-weight: 700;">User Payments</h2>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>User Name</th>
                            <th>Hospital</th>
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

        const tbody = document.getElementById("paymentsTableBody");
        if(result.success && result.bookings) {
            if(result.bookings.length === 0){
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No Payments Found</td></tr>`;
                return;
            }

            // We will show all bookings since they all have some payment info
            result.bookings.forEach(booking => {
                const totalAmt = parseFloat(booking.total_amount || 0);
                const paidAmt = parseFloat(booking.paid_amount || totalAmt);
                const isPart = booking.payment_type === 'Part';
                const balance = isPart ? Math.max(0, totalAmt - paidAmt) : 0;
                
                let paymentBadge = '';
                if (isPart) {
                    paymentBadge = `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#fff7ed; color:#ea580c;">Part Payment</span>`;
                } else {
                    paymentBadge = `<span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background:#f0fdf4; color:#16a34a;">Full Payment</span>`;
                }

                tbody.innerHTML += `
                <tr>
                    <td>${booking.id}</td>
                    <td><span style="font-weight:600; color:var(--text-main, #1e293b);">${booking.patient_name || '-'}</span></td>
                    <td>${booking.hospital_name || '-'}</td>
                    <td><span style="font-weight:600;">&#8377;${totalAmt}</span></td>
                    <td><span style="font-weight:600; color:#16a34a;">&#8377;${paidAmt}</span></td>
                    <td><span style="font-weight:600; color:#dc2626;">&#8377;${balance}</span></td>
                    <td>${paymentBadge}</td>
                </tr>
                `;
            });
            applyHospitalPanelSearch();
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No Payments Found</td></tr>`;
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
            payoutsResult.payments.forEach(p => {
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
                                    <th>User</th>
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
        else if (item.id === 'hospitalDetailsBtn') {
            if (typeof loadHospitalProfiles === 'function') loadHospitalProfiles();
        }
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
                <label style="font-size: 12px; font-weight: 600;">Room Type</label>
                <select class="top-search room_type">
                    <option value="General Ward">General Ward</option>
                    <option value="Semi-Private Room">Semi-Private Room</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency Room">Emergency Room</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Bed Type</label>
                <select class="top-search room_bed_type">
                    <option value="Single Bed">Single Bed</option>
                    <option value="Twin Bed">Twin Bed</option>
                    <option value="Double Bed">Double Bed</option>
                    <option value="Electric/Hospital Bed">Electric/Hospital Bed</option>
                    <option value="ICU Bed">ICU Bed</option>
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
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer; font-size:16px;" title="Remove Doctor"><i class="fa-solid fa-trash"></i></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Name <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_name" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Profile Photo</label>
                            <input type="file" class="doctor_photo" accept="image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Gender <span style="color:red;">*</span></label>
                            <select class="doctor_gender" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="">Select...</option>
                                <option value="Male" >Male</option>
                                <option value="Female" >Female</option>
                                <option value="Other" >Other</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Date of Birth / Age</label>
                            <input type="text" class="doctor_dob_age" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Mobile Number <span style="color:red;">*</span></label>
                            <input type="tel" class="doctor_mobile" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Email</label>
                            <input type="email" class="doctor_email" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization (Multi-select) <span style="color:red;">*</span></label>
                            <select class="doctor_specialization" multiple style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff; min-height: 120px;" required>
                                ${['General Physician','Cardiologist','Neurologist','Neurosurgeon','Orthopedic','Gynecologist','Obstetrician','Pediatrician','Dermatologist','Ophthalmologist','ENT Specialist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Nephrologist','Urologist','Oncologist','Endocrinologist','General Surgeon','Anesthesiologist','Radiologist','Pathologist','Physiotherapist','Emergency Medicine Specialist'].map(spec => 
                                    `<option value="${spec}" >${spec}</option>`
                                ).join('')}
                            </select>
                            <small style="color:var(--text-muted); font-size:11px; margin-top:-2px;">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_qualification" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Number <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_reg_no" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Years of Experience <span style="color:red;">*</span></label>
                            <input type="text" class="doctor_experience" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Department</label>
                            <input type="text" class="doctor_department" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Consultation Fee</label>
                            <input type="number" class="doctor_fee" value="" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Days</label>
                            <input type="text" class="doctor_days" value="" placeholder="e.g. Mon-Fri" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Time / Shift</label>
                            <input type="text" class="doctor_time" value="" placeholder="e.g. 10 AM - 4 PM" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Status <span style="color:red;">*</span></label>
                            <select class="doctor_status" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                                <option value="Active" >Active</option>
                                <option value="Inactive" >Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top:16px; margin-top:8px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_reg" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Degree Certificate <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_degree" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization Certificate</label>
                            <input type="file" class="doctor_doc_spec" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Government ID Proof <span style="color:red;">*</span></label>
                            <input type="file" class="doctor_doc_id" accept=".pdf,image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
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
            const genderIdx = headers.indexOf('gender');
            const dobIdx = headers.indexOf('dob_age');
            const mobileIdx = headers.indexOf('mobile');
            const emailIdx = headers.indexOf('email');
            const specIdx = headers.indexOf('specialization');
            const qualIdx = headers.indexOf('qualification');
            const regNoIdx = headers.indexOf('medical_reg_no');
            const expIdx = headers.indexOf('experience');
            const deptIdx = headers.indexOf('department');
            const feeIdx = headers.indexOf('consultation_fee');
            const daysIdx = headers.indexOf('available_days');
            const timeIdx = headers.indexOf('available_time');
            const statusIdx = headers.indexOf('status');
            
            if (nameIdx === -1) { alert('CSV must contain a column named doctor_name'); return; }
            
            const container = document.getElementById('doctorsContainer');
            
            for (let i = 1; i < lines.length; i++) {
                if(!lines[i].trim()) continue;
                const cols = lines[i].split(',').map(c => c.trim());
                
                const doctorBox = document.createElement('div');
                doctorBox.className = 'doctorBox';
                doctorBox.style = 'border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr; gap: 12px; position: relative;';
                const parseMulti = (val) => val ? val.split('|').map(s=>s.trim()) : [];
                doctorBox.innerHTML = `
                    <button type="button" class="removeDoctorBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Name</label>
                            <input type="text" class="top-search doctor_name" value="${nameIdx !== -1 ? cols[nameIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Profile Photo</label>
                            <input type="file" class="top-search doctor_photo" accept="image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Gender</label>
                            <select class="top-search doctor_gender" required>
                                <option value="">Select...</option>
                                <option value="Male" ${(genderIdx!==-1 && cols[genderIdx]==='Male')?'selected':''}>Male</option>
                                <option value="Female" ${(genderIdx!==-1 && cols[genderIdx]==='Female')?'selected':''}>Female</option>
                                <option value="Other" ${(genderIdx!==-1 && cols[genderIdx]==='Other')?'selected':''}>Other</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Date of Birth / Age</label>
                            <input type="text" class="top-search doctor_dob_age" value="${dobIdx !== -1 ? cols[dobIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Mobile Number</label>
                            <input type="tel" class="top-search doctor_mobile" value="${mobileIdx !== -1 ? cols[mobileIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Email</label>
                            <input type="email" class="top-search doctor_email" value="${emailIdx !== -1 ? cols[emailIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization (Multi-select, separated by |)</label>
                            <select class="top-search doctor_specialization" multiple style="height: auto; min-height: 100px; padding:8px;" required>
                                ${['General Physician','Cardiologist','Neurologist','Neurosurgeon','Orthopedic','Gynecologist','Obstetrician','Pediatrician','Dermatologist','Ophthalmologist','ENT Specialist','Dentist','Psychiatrist','Pulmonologist','Gastroenterologist','Nephrologist','Urologist','Oncologist','Endocrinologist','General Surgeon','Anesthesiologist','Radiologist','Pathologist','Physiotherapist','Emergency Medicine Specialist'].map(spec => 
                                    `<option value="${spec}" ${(specIdx!==-1 && parseMulti(cols[specIdx]).includes(spec))?'selected':''}>${spec}</option>`
                                ).join('')}
                            </select>
                            <small style="color:var(--text-muted); font-size:10px;">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Qualification</label>
                            <input type="text" class="top-search doctor_qualification" value="${qualIdx !== -1 ? cols[qualIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Number</label>
                            <input type="text" class="top-search doctor_reg_no" value="${regNoIdx !== -1 ? cols[regNoIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Years of Experience</label>
                            <input type="text" class="top-search doctor_experience" value="${expIdx !== -1 ? cols[expIdx] : ''}" required>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Department</label>
                            <input type="text" class="top-search doctor_department" value="${deptIdx !== -1 ? cols[deptIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Consultation Fee</label>
                            <input type="number" class="top-search doctor_fee" value="${feeIdx !== -1 ? cols[feeIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Days</label>
                            <input type="text" class="top-search doctor_days" value="${daysIdx !== -1 ? cols[daysIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Available Time / Shift</label>
                            <input type="text" class="top-search doctor_time" value="${timeIdx !== -1 ? cols[timeIdx] : ''}">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Doctor Status</label>
                            <select class="top-search doctor_status" required>
                                <option value="Active" ${(statusIdx!==-1 && cols[statusIdx]==='Active')?'selected':''}>Active</option>
                                <option value="Inactive" ${(statusIdx!==-1 && cols[statusIdx]==='Inactive')?'selected':''}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border-color); padding-top:12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Reg Certificate ⭐⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_reg" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Medical Degree Certificate ⭐⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_degree" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Specialization Certificate ⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_spec" accept=".pdf,image/*">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <label style="font-size: 12px; font-weight: 600;">Government ID Proof ⭐⭐</label>
                            <input type="file" class="top-search doctor_doc_id" accept=".pdf,image/*">
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


    






// ====== NEW PROFILE FLOW LOGIC ======
function openProfileModal() {
    const modal = document.getElementById("profileModal") || document.getElementById("profileModalBox");
    if (modal) modal.style.display = "flex";
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


async function loadHospitalProfiles(){
    try{
        const response = await fetch('/api/hospitals');
        const result = await response.json();

        const mainContent = document.getElementById("mainContent");
        mainContent.innerHTML = `
            <div style="margin-bottom: 25px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="font-size: 24px; color: var(--text-main, #1e293b); font-weight: 700;">Hospital Details</h2>
                    <p style="color: var(--text-muted);">Click on a hospital to view and edit its profile details.</p>
                </div>
                <button id="addHospitalDetailsBtn" style="padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; background-color: var(--sidebar-active-bg, #2563eb); color: white; border: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    <i class="fa-solid fa-plus"></i> Add Hospital Details
                </button>
            </div>
            <div class="table-container">
                <table class="adminTable">
                    <thead>
                        <tr>
                            <th style="width:60px;">ID</th>
                            <th>Hospital Name</th>
                            <th>Type</th>
                            <th>Ownership</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="hospitalProfilesTableBody">
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("hospitalProfilesTableBody");

        if(!result.success || !result.hospitals || result.hospitals.length === 0){
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">No Hospitals Found</td></tr>';
            return;
        }

        result.hospitals.forEach(hospital => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.innerHTML = `
                <td>${hospital.id}</td>
                <td><span style="font-weight:700; color:var(--text-main, #1e293b); font-size:14px;">${hospital.hospital_name || ''}</span></td>
                <td><span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${hospital.hospital_type || 'General Hospital'}</span></td>
                <td><span style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${hospital.hospital_ownership || 'Private'}</span></td>
                <td>${hospital.address || '-'}</td>
                <td><span style="padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; background:#dcfce7; color:#16a34a;">${hospital.status || 'Active'}</span></td>
                <td>
                    <i class="fa-solid fa-pen-to-square" onclick="event.stopPropagation(); editHospitalAction(${hospital.id})" title="Edit Hospital" style="color: #3b82f6; font-size: 16px; cursor: pointer; transition: transform 0.2s; margin-right: 15px;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                    <i class="fa-solid fa-trash" onclick="event.stopPropagation(); deleteHospitalAction(${hospital.id})" title="Delete Hospital" style="color: #ef4444; font-size: 16px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></i>
                </td>
            `;
            tr.addEventListener("click", () => {
                openHospitalProfileModal(hospital.id);
            });
            tbody.appendChild(tr);
        });
        if (typeof applyHospitalPanelSearch === 'function') applyHospitalPanelSearch();
        
        const addDetailsBtn = document.getElementById("addHospitalDetailsBtn");
        if (addDetailsBtn) {
            addDetailsBtn.addEventListener("click", () => {
                openHospitalProfileModal(null);
            });
        }
    }
    catch(error){
        console.log(error);
    }
}

async function openHospitalProfileModal(hospitalId) {
    const modal = document.getElementById("hospitalEntityModal");
    const entitySelect = document.getElementById('hospitalEntitySelect');
    
    if (entitySelect) {
        if (entitySelect.options.length <= 1) {
            try {
                const res = await fetch('/api/vendor/my-entities/hospital');
                const result = await res.json();
                if (result.success && result.data) {
                    entitySelect.innerHTML = '<option value="">Select Hospital...</option>';
                    let count = 0;
                    result.data.forEach(ent => {
                        if (!ent.profile_completed || ent.edit_allowed) {
                            entitySelect.innerHTML += `<option value="${ent.id}">${ent.name}</option>`;
                            count++;
                        }
                    });
                    if (count === 0) {
                        entitySelect.innerHTML = '<option value="">No hospitals available</option>';
                    }
                }
            } catch(e) {}
        }
        
        if (hospitalId) {
            if (!Array.from(entitySelect.options).some(opt => opt.value == hospitalId)) {
                entitySelect.innerHTML += `<option value="${hospitalId}">Loading...</option>`;
            }
            entitySelect.parentElement.style.display = 'none';
            entitySelect.value = hospitalId;
        } else {
            entitySelect.parentElement.style.display = 'flex';
            entitySelect.value = '';
        }
        
        // Trigger data fetch for the selected hospital
        await handleHospitalEntitySelect(entitySelect.value);
    }
    
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeHospitalEntityModal() {
    const modal = document.getElementById("hospitalEntityModal");
    if (modal) modal.style.display = "none";
}

async function handleHospitalEntitySelect(entityId) {
    const bannerContainer = document.getElementById('hospitalStatusBannerContainer');
    const actionButtons = document.getElementById('hospitalEntityActionButtons');
    const form = document.getElementById('hospitalEntityForm');
    
    if (!entityId) {
        if (bannerContainer) bannerContainer.innerHTML = '';
        form.reset();
        if (actionButtons) {
            actionButtons.innerHTML = `
                <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Details</button>
            `;
        }
        return;
    }
    
    try {
        const res = await fetch('/api/vendor/entity-details/hospital/' + entityId);
        const result = await res.json();
        if (result.success && result.data) {
            const entityData = result.data;
            
            // Populate text & number fields
            const textFields = ['hospital_registration_number', 'address', 'contact_number', 'number_of_beds', 'facilities'];
            textFields.forEach(field => {
                if (form.elements[field]) {
                    form.elements[field].value = entityData[field] || '';
                }
            });
            
            // Explicit matching for dropdowns
            ['hospital_type', 'hospital_ownership'].forEach(field => {
                if (entityData[field]) {
                    const select = form.querySelector(`select[name="${field}"]`);
                    if (select) {
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value.toLowerCase() === entityData[field].toLowerCase() || select.options[i].text.toLowerCase() === entityData[field].toLowerCase()) {
                                select.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
            });
            
            const fileInputs = form.querySelectorAll('input[type="file"]');
            const allInputs = form.querySelectorAll('input, select, textarea');
            
            if (!entityData.profile_completed) {
                // Not completed
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '#fff';
                });
                fileInputs.forEach(input => input.setAttribute('required', 'required'));
                // GST is optional
                const gst = form.querySelector('[name="gst_certificate"]');
                if(gst) gst.removeAttribute('required');
                
                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="padding:12px 16px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:10px; font-size:13px; color:#1d4ed8; font-weight:500; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-circle-info" style="font-size:16px;"></i>
                            <div>Please complete the required details and upload your hospital registration documents below to verify your hospital.</div>
                        </div>
                    `;
                }
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                        <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 22px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-floppy-disk"></i> Save Details</button>
                    `;
                }
            } else if (!entityData.edit_allowed) {
                // Completed & Locked
                allInputs.forEach(input => {
                    if (input.id !== 'hospitalEntitySelect' && input.name !== 'hospitalEntityType') {
                        input.disabled = true;
                        input.style.backgroundColor = '#f8fafc';
                    }
                });
                fileInputs.forEach(input => input.removeAttribute('required'));
                
                if (!entityData.edit_requested) {
                    if (bannerContainer) {
                        let statusHtml = '';
                        if (entityData.status === 'pending') {
                            statusHtml = `
                            <div style="background:rgba(245, 158, 11, 0.1); color:#d97706; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(245, 158, 11, 0.2);">
                                <i class="fa-solid fa-clock"></i>
                                <div style="font-size:13px;">
                                    <strong style="display:block; margin-bottom:2px;">Under Review</strong>
                                    Hospital details are currently being reviewed by our admin team.
                                </div>
                            </div>`;
                        } else if (entityData.status === 'approved') {
                            statusHtml = `
                            <div style="background:rgba(16, 185, 129, 0.1); color:#059669; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(16, 185, 129, 0.2);">
                                <i class="fa-solid fa-circle-check"></i>
                                <div style="font-size:13px; display:flex; justify-content:space-between; align-items:center; width:100%;">
                                    <div>
                                        <strong style="display:block; margin-bottom:2px;">Hospital Verified</strong>
                                        Hospital details are verified and active on the platform.
                                    </div>
                                    <button type="button" onclick="requestHospitalEdit(${entityId})" style="background:#059669; color:#fff; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                                        Request Edit <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                </div>
                            </div>`;
                        }
                        bannerContainer.innerHTML = statusHtml;
                    }
                } else {
                    if (bannerContainer) {
                        bannerContainer.innerHTML = `
                            <div style="padding:12px 16px; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; font-size:13px; color:#92400e; font-weight:500; display:flex; align-items:center; gap:10px;">
                                <i class="fa-solid fa-shield-halved" style="color:#d97706; font-size:18px;"></i>
                                <div style="flex:1;">
                                    <strong>Edit Requested.</strong> Pending admin approval to update hospital details.
                                </div>
                            </div>
                        `;
                    }
                }
                
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                    `;
                }
            } else {
                // Edit Mode Unlocked
                allInputs.forEach(input => {
                    input.disabled = false;
                    input.style.backgroundColor = '#fff';
                });
                fileInputs.forEach(input => input.removeAttribute('required'));
                
                if (bannerContainer) {
                    bannerContainer.innerHTML = `
                        <div style="background:rgba(59, 130, 246, 0.1); color:#2563eb; padding:12px 16px; border-radius:10px; margin-bottom:0; display:flex; align-items:center; gap:12px; border:1px solid rgba(59, 130, 246, 0.2);">
                            <i class="fa-solid fa-unlock"></i>
                            <div style="font-size:13px;">
                                <strong style="display:block; margin-bottom:2px;">Edit Mode Unlocked</strong>
                                You can now update hospital details.
                            </div>
                        </div>
                    `;
                }
                
                if (actionButtons) {
                    actionButtons.innerHTML = `
                        <button type="button" onclick="closeHospitalEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Cancel</button>
                        <button type="submit" id="saveHospitalEntityBtn" style="padding:10px 22px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px;"><i class="fa-solid fa-paper-plane"></i> Submit Updates</button>
                    `;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching entity details:', e);
    }
}

document.getElementById('hospitalEntitySelect')?.addEventListener('change', (e) => {
    handleHospitalEntitySelect(e.target.value);
});

async function requestHospitalEdit(entityId) {
    try {
        const reqRes = await fetch('/api/vendor/request-profile-edit/hospital/' + entityId, { method: 'POST' });
        const reqData = await reqRes.json();
        if (reqData.success) {
            alert('Edit request sent to Admin successfully! Once Admin approves, you can update details.');
            handleHospitalEntitySelect(entityId);
        } else {
            alert(reqData.message || 'Failed to submit request.');
        }
    } catch(err) {
        alert('Network error while requesting edit.');
    }
}

document.getElementById('hospitalEntityForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const entityId = document.getElementById('hospitalEntitySelect')?.value;
    if (!entityId) {
        alert("Please select a hospital first.");
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const btn = document.getElementById('saveHospitalEntityBtn');
    if(btn) { btn.disabled = true; btn.innerHTML = 'Saving...'; }
    
    try {
        const res = await fetch('/api/vendor/complete-profile/hospital/' + entityId, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message || 'Hospital details saved successfully!');
            closeHospitalEntityModal();
            const entitySelect = document.getElementById('hospitalEntitySelect');
            if (entitySelect) entitySelect.innerHTML = '<option value="">Select Hospital...</option>';
            loadHospitalProfiles(); // Refresh the list
        } else {
            alert(data.message || 'Failed to save details.');
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    } finally {
        if(btn) { btn.disabled = false; btn.innerHTML = 'Save Details'; }
    }
});

document.getElementById("hospitalDetailsBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
    document.getElementById("hospitalDetailsBtn").classList.add("active");
    loadHospitalProfiles();
});


window.editHospitalAction = function(id) {
    if (typeof openHospitalProfileModal === 'function') {
        openHospitalProfileModal(id);
    }
};
window.deleteHospitalAction = async function(id) {
    if (confirm("Are you sure you want to delete this hospital? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/hospital/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Hospital deleted successfully.");
                if (typeof loadHospitals === 'function') loadHospitals();
                if (typeof loadHospitalProfiles === 'function') loadHospitalProfiles();
            } else {
                alert(result.message || "Failed to delete hospital.");
            }
        } catch(e) {
            console.error(e);
            alert("Error deleting hospital.");
        }
    }
};
