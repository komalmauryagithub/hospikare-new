let appliedLabDateFrom = "";
let appliedLabDateTo = "";
let appliedLabRangeLabel = "All Time";

function parseLabDate(value) {
    if (!value) {
        return null;
    }

    if (
        typeof value === "string"
        && /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
        const [year, month, day] =
            value.slice(0, 10).split("-").map(Number);

        return new Date(year, month - 1, day);
    }

    const parsedDate =
        new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
    );
}

function formatLabDate(value) {
    const date =
        parseLabDate(value);

    if (!date) {
        return "";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatLabMonth(value) {
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

function padLabDatePart(value) {
    return String(value).padStart(2, "0");
}

function getLabMonthRange(value) {
    const [year, month] =
        value.split("-").map(Number);

    const lastDay =
        new Date(year, month, 0).getDate();

    return {
        from:
            `${year}-${padLabDatePart(month)}-01`,
        to:
            `${year}-${padLabDatePart(month)}-${padLabDatePart(lastDay)}`
    };
}

function getLabRecordDate(record, keys) {
    for (const key of keys) {
        const date =
            parseLabDate(record?.[key]);

        if (date) {
            return date;
        }
    }

    return null;
}

function filterLabRecords(records, dateKeys) {
    if (!Array.isArray(records)) {
        return [];
    }

    if (!appliedLabDateFrom && !appliedLabDateTo) {
        return records;
    }

    const fromDate =
        parseLabDate(appliedLabDateFrom);
    const toDate =
        parseLabDate(appliedLabDateTo);

    return records.filter(record => {
        const recordDate =
            getLabRecordDate(record, dateKeys);

        if (!recordDate) {
            return false;
        }

        if (fromDate && recordDate < fromDate) {
            return false;
        }

        if (toDate && recordDate > toDate) {
            return false;
        }

        return true;
    });
}

function getLabDateRangeLabel(from, to) {
    if (from && to) {
        return from === to
            ? formatLabDate(from)
            : `${formatLabDate(from)} - ${formatLabDate(to)}`;
    }

    if (from) {
        return `From ${formatLabDate(from)}`;
    }

    if (to) {
        return `Up to ${formatLabDate(to)}`;
    }

    return "All Time";
}

function isLabSectionVisible(id) {
    const section =
        document.getElementById(id);

    return section
        && section.style.display !== "none";
}

function refreshActiveLabSection() {
    if (isLabSectionVisible("dashboardSection")) {
        loadDashboard();
    }
    else if (isLabSectionVisible("labSection")) {
        loadLabs();
    }
    else if (isLabSectionVisible("bookingSection")) {
        loadLabBookings();
    }
    else if (isLabSectionVisible("patientsSection")) {
        loadPatients();
    }
    else if (isLabSectionVisible("reportsSection")) {
        loadReports();
    }
    else if (isLabSectionVisible("paymentsSection")) {
        loadPayments();
    }
}

function setupLabDateFilter() {
    const filterBtn =
        document.getElementById("labDateFilterBtn");
    const filterPanel =
        document.getElementById("labDateFilterPanel");
    const filterText =
        document.getElementById("labDateFilterText");
    const dateFrom =
        document.getElementById("labDateFrom");
    const dateTo =
        document.getElementById("labDateTo");
    const monthInput =
        document.getElementById("labDateMonth");
    const yearSelect =
        document.getElementById("labDateYear");
    const errorText =
        document.getElementById("labDateFilterError");
    const modeInputs =
        document.querySelectorAll(
            "input[name='labDateFilterMode']"
        );
    const modeFields =
        document.querySelectorAll(
            "#labDateFilterPanel [data-date-mode-field]"
        );

    if (!filterBtn || !filterPanel) {
        return;
    }

    const currentYear =
        new Date().getFullYear();

    yearSelect.innerHTML =
        `<option value="">Select year</option>`;

    for (
        let year = currentYear + 1;
        year >= currentYear - 8;
        year--
    ) {
        yearSelect.innerHTML +=
            `<option value="${year}">${year}</option>`;
    }

    const getSelectedMode = () => {
        const selected =
            document.querySelector(
                "input[name='labDateFilterMode']:checked"
            );

        return selected ? selected.value : "date";
    };

    const setMode = mode => {
        modeFields.forEach(field => {
            field.hidden =
                field.dataset.dateModeField !== mode;
        });
        errorText.innerText = "";
    };

    const setPanelOpen = isOpen => {
        filterPanel.hidden = !isOpen;
        filterBtn.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    };

    const updateLabel = () => {
        filterText.innerText =
            appliedLabRangeLabel;
    };

    const applyFilter = () => {
        const mode =
            getSelectedMode();
        let nextFrom = "";
        let nextTo = "";
        let nextLabel = "All Time";

        if (mode === "date") {
            if (
                dateFrom.value
                && dateTo.value
                && dateFrom.value > dateTo.value
            ) {
                errorText.innerText =
                    "From Date cannot be after To Date.";
                return;
            }

            nextFrom = dateFrom.value;
            nextTo = dateTo.value;
            nextLabel =
                getLabDateRangeLabel(nextFrom, nextTo);
        }
        else if (mode === "month") {
            if (!monthInput.value) {
                errorText.innerText =
                    "Please select a month.";
                return;
            }

            const range =
                getLabMonthRange(monthInput.value);

            nextFrom = range.from;
            nextTo = range.to;
            nextLabel =
                formatLabMonth(monthInput.value);
        }
        else if (mode === "year") {
            if (!yearSelect.value) {
                errorText.innerText =
                    "Please select a year.";
                return;
            }

            nextFrom =
                `${yearSelect.value}-01-01`;
            nextTo =
                `${yearSelect.value}-12-31`;
            nextLabel =
                `Year ${yearSelect.value}`;
        }

        appliedLabDateFrom = nextFrom;
        appliedLabDateTo = nextTo;
        appliedLabRangeLabel = nextLabel;
        errorText.innerText = "";
        updateLabel();
        setPanelOpen(false);
        refreshActiveLabSection();
    };

    filterBtn.addEventListener(
        "click",
        () => {
            setPanelOpen(filterPanel.hidden);
        }
    );

    modeInputs.forEach(input => {
        input.addEventListener(
            "change",
            () => setMode(input.value)
        );
    });

    document.getElementById(
        "applyLabDateFilter"
    ).addEventListener(
        "click",
        applyFilter
    );

    document.getElementById(
        "clearLabDateFilter"
    ).addEventListener(
        "click",
        () => {
            dateFrom.value = "";
            dateTo.value = "";
            monthInput.value = "";
            yearSelect.value = "";
            appliedLabDateFrom = "";
            appliedLabDateTo = "";
            appliedLabRangeLabel = "All Time";
            errorText.innerText = "";
            updateLabel();
            setPanelOpen(false);
            refreshActiveLabSection();
        }
    );

    [
        dateFrom,
        dateTo,
        monthInput,
        yearSelect
    ].forEach(input => {
        input.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    applyFilter();
                }
            }
        );
    });

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    ".lab-date-filter"
                )
            ) {
                setPanelOpen(false);
            }
        }
    );

    setMode(getSelectedMode());
    updateLabel();
}

loadDashboard();

setInterval(() => {

    loadDashboard();

},5000);

document.getElementById("labSection").style.display = "none";
document.getElementById("patientsSection").style.display = "none";
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
            const vendorName = result.user?.name || result.details?.lab_name || "Vendor";
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
        const response = await fetch('/api/user/logout',{
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

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });
            item.classList.add("active");
            const text =  item.innerText.trim().toLowerCase();

            document.getElementById("labSection").style.display = "none";
            document.getElementById("bookingSection").style.display = "none";
            document.getElementById("patientsSection").style.display = "none";
            document.getElementById("reportsSection").style.display = "none";
            document.getElementById("paymentsSection").style.display = "none";
            document.getElementById("dashboardSection").style.display = "none";

            if(text.includes("dashboard")){
                document.getElementById("dashboardSection").style.display="block";
                loadDashboard();
            }
            else if(text.includes("lab tests")){
                document.getElementById("labSection").style.display = "block";
                loadLabs();
            }
            else if(text.includes("bookings")){
                document.getElementById("bookingSection").style.display = "block";
                loadLabBookings();
            }
            else if(text.includes("patients")){
                document.getElementById("patientsSection").style.display = "block";
                loadPatients();
            }
            else if(text.includes("reports")){
                document.getElementById("reportsSection").style.display = "block";
                loadReports();
            }
            else if(text.includes("payments")){
                document.getElementById("paymentsSection").style.display = "block";
                loadPayments();
            }
        }
    );

});

function setupDashboardCardLinks(){
    const cardLinks = {
        totalTests: "labsBtn",
        totalBookings: "bookingsBtn",
        totalEarnings: "paymentsBtn",
        totalPayouts: "paymentsBtn"
    };

    Object.entries(cardLinks).forEach(([metricId, targetId]) => {
        const card =
            document.getElementById(metricId)
            ?.closest(".dashCard");
        const target =
            document.getElementById(targetId);

        if(!card || !target){
            return;
        }

        card.classList.add("clickable-card");
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const openTarget = () => target.click();

        card.addEventListener("click", openTarget);
        card.addEventListener("keydown", event => {
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

setupDashboardCardLinks();
setupLabDateFilter();

async function loadLabs() {
    try {
        const response = await fetch('/api/labs');
        const result = await response.json();

        const tbody = document.getElementById("labTableBody");
        tbody.innerHTML = "";

        if (result.success) {
            const labs = filterLabRecords(
                result.labs,
                ["created_at"]
            );

            if (labs.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="noLabData">
                            No Labs Found
                        </td>
                    </tr>
                `;
                return;
            }

            labs.forEach(lab => {
                tbody.innerHTML += `
                    <tr>
                        <td>${lab.id}</td>
                        <td>${lab.lab_name}</td>
                        <td>${lab.address}</td>
                        <td>${lab.home_coll}</td>
                        <td>${lab.emergency_test}</td>
                        <td>${lab.lab_hrs}</td>
                        <td>${new Date(lab.created_at).toLocaleDateString()}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Load Labs Error:", error);
    }
}

// ============================================================
// LAB MODAL CONTROLS
// ============================================================
document.getElementById("addLabBtn").addEventListener("click", () => {
    document.getElementById("labModal").style.display = "flex";
});

document.getElementById("closeLabModal").addEventListener("click", () => {
    document.getElementById("labModal").style.display = "none";
});

// ============================================================
// PATHOLOGIST HELPERS
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function addPathologist(name = '', qualification = '', experience = '') {
    const container = document.getElementById("pathologistContainer");
    const div = document.createElement("div");
    div.classList.add("pathologistBox");
    div.style.cssText = "border:1px solid #e2e8f0; padding:15px; border-radius:8px; margin-bottom:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px;";

    div.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Name</label>
            <input type="text" placeholder="Name" class="path_name" value="${escapeHtml(name)}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;">
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Qualification</label>
            <input type="text" placeholder="Qualification" class="path_qualification" value="${escapeHtml(qualification)}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;">
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Experience</label>
            <input type="text" placeholder="Experience" class="path_experience" value="${escapeHtml(experience)}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;">
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Medical Registration Proof</label>
            <input type="file" class="path_proof" style="font-size:11px;">
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Pathologist Certificate</label>
            <input type="file" class="path_cert" style="font-size:11px;">
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
            <label style="font-size:11px;font-weight:600;color:var(--text-muted);">Pathologist Image</label>
            <input type="file" class="path_image" accept="image/*" style="font-size:11px;">
        </div>
        <div style="grid-column:span 2;display:flex;justify-content:flex-end;">
            <button type="button" onclick="this.closest('.pathologistBox').remove()" style="padding:4px 12px;font-size:11px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;">Remove</button>
        </div>
    `;
    container.appendChild(div);
}

document.getElementById("addPathologistBtn").addEventListener("click", () => addPathologist());

// CSV modal
document.getElementById("importPathologistCSVBtn")?.addEventListener("click", () => {
    document.getElementById("pathologistDashboardCsvModal").style.display = "flex";
});
document.getElementById("closePathologistDashboardCsvBtn")?.addEventListener("click", () => {
    document.getElementById("pathologistDashboardCsvModal").style.display = "none";
    document.getElementById("pathologistDashboardCsvFile").value = "";
});
document.getElementById("cancelPathologistDashboardCsvBtn")?.addEventListener("click", () => {
    document.getElementById("pathologistDashboardCsvModal").style.display = "none";
    document.getElementById("pathologistDashboardCsvFile").value = "";
});
document.getElementById("uploadPathologistDashboardCsvBtn")?.addEventListener("click", async () => {
    const fileInput = document.getElementById("pathologistDashboardCsvFile");
    if (!fileInput.files[0]) { alert("Please select a CSV file"); return; }
    try {
        const text = await fileInput.files[0].text();
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
        if (lines.length < 2) { alert("CSV must have header and at least one row"); return; }
        const headers = parseCsvLine(lines[0].replace(/^\uFEFF/, "")).map(h => h.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,""));
        const find = (opts) => headers.findIndex(h => opts.some(o => h === o || h.includes(o)));
        const ni = find(["name","pathologist_name"]);
        const qi = find(["qualification","qualifications","qual"]);
        const ei = find(["experience","exp"]);
        if (ni===-1||qi===-1||ei===-1) { alert("CSV must have columns: name, qualification, experience"); return; }
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
            const vals = parseCsvLine(lines[i]).map(v => v.trim());
            if (!vals[ni]) continue;
            addPathologist(vals[ni], vals[qi]||"", vals[ei]||"");
            count++;
        }
        alert(`Imported ${count} pathologists from CSV`);
        document.getElementById("pathologistDashboardCsvModal").style.display = "none";
        document.getElementById("pathologistDashboardCsvFile").value = "";
    } catch(err) { console.error(err); alert("Error parsing CSV"); }
});

// ============================================================
// ADD LAB FORM SUBMIT
// ============================================================
document.getElementById("labForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("lab_name", document.getElementById("lab_name").value);
    formData.append("address", document.getElementById("lab_address").value);
    formData.append("location", document.getElementById("lab_location").value);
    formData.append("description", document.getElementById("lab_description").value);
    formData.append("test_price", document.getElementById("test_price").value);

    const labTypes = [];
    document.querySelectorAll("#labTypeGrid input:checked").forEach(item => labTypes.push(item.value));
    formData.append("lab_type", JSON.stringify(labTypes));

    const tests = [];
    document.querySelectorAll("#labTestGrid input:checked").forEach(item => tests.push(item.value));
    formData.append("test", JSON.stringify(tests));

    const pathologists = [];
    document.querySelectorAll(".pathologistBox").forEach(box => {
        const proofInput = box.querySelector(".path_proof");
        const certInput = box.querySelector(".path_cert");
        const imageInput = box.querySelector(".path_image");
        const hasProof = !!(proofInput && proofInput.files[0]);
        const hasCert = !!(certInput && certInput.files[0]);
        const hasImage = !!(imageInput && imageInput.files[0]);
        pathologists.push({
            name: box.querySelector(".path_name")?.value || "",
            qualification: box.querySelector(".path_qualification")?.value || "",
            experience: box.querySelector(".path_experience")?.value || "",
            hasProof,
            hasCert,
            hasImage
        });
        if (hasProof) formData.append("pathologist_proofs", proofInput.files[0]);
        if (hasCert) formData.append("pathologist_certs", certInput.files[0]);
        if (hasImage) formData.append("pathologist_images", imageInput.files[0]);
    });
    formData.append("pathologist", JSON.stringify(pathologists));

    formData.append("home_coll", document.getElementById("home_coll").value);
    formData.append("extra_chrg", document.getElementById("extra_chrg").value);
    formData.append("available_areas", document.getElementById("available_areas").value);
    formData.append("adv_equipment", document.getElementById("adv_equipment").value);
    formData.append("lab_hrs", document.getElementById("lab_hrs").value);
    formData.append("test_time", document.getElementById("test_time").value);
    formData.append("emergency_test", document.getElementById("emergency_test").value);

    const labRegFile = document.getElementById("lab_reg");
    const nablFile = document.getElementById("nabl");
    if (labRegFile?.files[0]) formData.append("lab_reg", labRegFile.files[0]);
    if (nablFile?.files[0]) formData.append("nabl", nablFile.files[0]);

    try {
        const response = await fetch('/api/add/lab', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
            alert("Lab Added");
            document.getElementById("labModal").style.display = "none";
            loadLabs();
        } else {
            alert(result.message || "Failed to add lab");
        }
    } catch (error) {
        console.error("Add Lab Error:", error);
    }
});

// loadInsuranceBookings removed
async function loadPatients(){
    try{
        const response = await fetch('/api/lab/patients');
        const result = await response.json();
        const tbody =
            document.getElementById(
                "patientsTableBody"
            );
        tbody.innerHTML = "";
        if(result.success){
            const patients =
                filterLabRecords(
                    result.patients,
                    ["booking_date", "created_at"]
                );

            if(
                patients.length === 0
            ){
                tbody.innerHTML = `
                <tr>
                    <td
                        colspan="12"
                        class="noLabData"
                    >
                        No Patients Found
                    </td>
                </tr>
                `;
                return;
            }
            patients.forEach(
                patient => {
                const formattedDate = patient.booking_date
                    ? new Date(patient.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';

                const collectionType = String(patient.sample_collection_type || '').toLowerCase();
                const collectionBadge = collectionType.includes('home')
                    ? '<span class="status-badge" style="background:#EDF4FF; color:#246BFD; font-weight:600; font-size:12px; padding:4px 10px; border-radius:12px;"><i class="fa-solid fa-house-medical"></i> Home</span>'
                    : '<span class="status-badge" style="background:#F0FDFA; color:#0D9488; font-weight:600; font-size:12px; padding:4px 10px; border-radius:12px;"><i class="fa-solid fa-hospital"></i> Center</span>';

                const bStatus = String(patient.booking_status || '').toLowerCase();
                const bookingBadge = bStatus === 'completed'
                    ? '<span class="status-badge status-active">Completed</span>'
                    : bStatus === 'pending'
                    ? '<span class="status-badge status-pending">Pending</span>'
                    : '<span class="status-badge status-danger">Cancelled</span>';

                const pStatus = String(patient.payment_status || '').toLowerCase();
                const paymentBadge = (pStatus === 'paid' || pStatus === 'completed')
                    ? '<span class="status-badge status-active">Paid</span>'
                    : '<span class="status-badge status-pending">Pending</span>';

                tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 700; color: #64748B;">#${patient.id}</td>
                    <td style="font-weight: 600; color: #0F172A;">${patient.full_name || 'N/A'}</td>
                    <td style="color: #475569;">${patient.email || 'N/A'}</td>
                    <td style="color: #475569;">${patient.phone || 'N/A'}</td>
                    <td style="font-weight: 600; color: #0F172A;">${patient.patient_name || 'N/A'}</td>
                    <td style="color: #0F172A; font-weight: 600;">${patient.test_name || 'Lab Test'}</td>
                    <td>${collectionBadge}</td>
                    <td style="font-weight: 600; color: #334155;">${formattedDate}</td>
                    <td style="font-weight: 700; color: #0F172A;">₹${Number(patient.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td>${bookingBadge}</td>
                    <td>${paymentBadge}</td>
                    <td style="color: #64748B; font-size: 12px;">${patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                </tr>
                `;
            });
        }
    }
    catch(error){

        console.log(error);
    }
}

async function loadReports(){

    try{

        const response =
            await fetch(
                '/api/lab/reports'
            );

        const result =
            await response.json();

        const tbody =
            document.getElementById(
                "reportsTableBody"
            );

        tbody.innerHTML = "";

        if(result.success){
            const reports =
                filterLabRecords(
                    result.reports,
                    ["booking_date", "created_at"]
                );

            if(
                reports.length === 0
            ){

                tbody.innerHTML = `
                <tr>
                    <td colspan="10">
                        No Reports Found
                    </td>
                </tr>
                `;

                return;
            }

            reports.forEach(
                report => {

                tbody.innerHTML += `
                <tr>

                    <td>
                        ${report.id}
                    </td>

                    <td>
                        ${report.full_name}
                    </td>

                    <td>
                        ${report.email}
                    </td>

                    <td>
                        ${report.phone}
                    </td>

                    <td>
                        ${report.patient_name}
                    </td>

                    <td>
                        ${report.test_name}
                    </td>

                    <td>

                        ${
                            report.report_file
                            ?

                            `
                            <a
                                href="/uploads/${report.report_file}"
                                target="_blank"
                            >
                                View
                            </a>
                            `

                            :

                            'No Report'
                        }

                    </td>

                    <td>

                        <input
                            type="file"
                            onchange="
                                uploadReport(
                                    ${report.id},
                                    this.files[0]
                                )
                            "
                        >

                    </td>

                    <td>

                        <a
                            href="
https://wa.me/91${report.phone}?text=Your Lab Report : ${window.location.origin}/uploads/${report.report_file}
                            "
                            target="_blank"
                        >

                            <i
                                class="fa-brands fa-whatsapp"
                                style="
                                    color:green;
                                    font-size:24px;
                                "
                            ></i>

                        </a>

                    </td>

                    <td>

                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=${report.email}&su=Lab%20Report&body=Your%20Report%20:%20${window.location.origin}/uploads/${report.report_file}"
                            target="_blank"
                        >

                            <i
                                class="fa-solid fa-envelope"
                                style="
                                    color:red;
                                    font-size:24px;
                                "
                            ></i>

                        </a>

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

async function uploadReport(
    bookingId,
    file
){

    try{

        const formData =
            new FormData();

        formData.append(
            "report",
            file
        );

        formData.append(
            "booking_id",
            bookingId
        );

        const response =
            await fetch(
                '/api/upload/report',
                {
                    method:'POST',
                    body:formData
                }
            );

        const result =
            await response.json();

        if(result.success){

            alert(
                "Report Uploaded Successfully"
            );

            loadReports();
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

async function loadVendorPayments(){

    try{

        const response =
        await fetch(
            '/api/vendor/payouts'
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
                filterLabRecords(
                    result.payments,
                    ["created_at", "paid_at"]
                );

            if(
                payments.length === 0
            ){

                tbody.innerHTML = `
                <tr>

                    <td colspan="8">

                        No Vendor Payouts Found

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
                        #${payment.booking_id}
                    </td>

                    <td>
                        ${payment.full_name}
                    </td>

                    <td>
                        ₹${payment.vendor_amount}
                    </td>

                    <td>
                        ₹${payment.admin_commission}
                    </td>

                    <td>

                        <span
                            style="
                                color:green;
                                font-weight:600;
                            "
                        >
                            Paid
                        </span>

                    </td>

                    <td>
                        ${payment.razorpay_payment_id}
                    </td>

                    <td>
                        ${
                            new Date(
                                payment.created_at
                            ).toLocaleDateString()
                        }
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
                filterLabRecords(
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

        const bookingsResponse = await fetch('/api/lab/patients');
        const bookingsResult = await bookingsResponse.json();

        const payoutsResponse = await fetch('/api/vendor/payouts');
        const payoutsResult = await payoutsResponse.json();

        const labsResponse = await fetch('/api/labs');
        const labsResult = await labsResponse.json();

        let totalBookings = 0;
        let totalEarnings = 0;
        let totalPayouts = 0;
        let totalTests = 0;

        if(labsResult.success && labsResult.labs){
            totalTests = labsResult.labs.length;
        }

        if(bookingsResult.success){
            const patients = filterLabRecords(bookingsResult.patients, ["booking_date", "created_at"]);
            totalBookings = patients.length;
            patients.forEach(patient => {
                totalEarnings += Number(patient.total_amount || 0);
            });
        }

        if(payoutsResult.success && payoutsResult.payouts){
            const payouts = filterLabRecords(payoutsResult.payouts, ["paid_at", "created_at"]);
            payouts.forEach(payment => {
                totalPayouts += Number(payment.paid || payment.amount || 0);
            });
        }

        document.getElementById("totalTests").innerText = totalTests;
        document.getElementById("totalBookings").innerText = totalBookings;

        initDashboardCharts();

        document.getElementById(
            "totalEarnings"
        ).innerText =
        `₹${totalEarnings}`;

        document.getElementById(
            "totalPayouts"
        ).innerText =
        `₹${totalPayouts}`;

        const bookingBody =
        document.getElementById(
            "dashboardBookingsBody"
        );

        bookingBody.innerHTML = "";

        if(bookingsResult.success){
            const patients =
                filterLabRecords(
                    bookingsResult.patients,
                    ["booking_date", "created_at"]
                );

            patients
            .slice(0,5)
            .forEach(patient => {

                bookingBody.innerHTML += `
                <tr>

                    <td>
                        #${patient.id}
                    </td>

                    <td>
                        ${patient.patient_name}
                    </td>

                    <td>
                        ${patient.test_name}
                    </td>

                    <td>
                        ₹${patient.total_amount}
                    </td>

                    <td>

                        <span
                            class="
                            ${
                                patient.booking_status === 'completed'
                                ?
                                'completedStatus'
                                :
                                'pendingStatus'
                            }
                            "
                        >

                            ${patient.booking_status}

                        </span>

                    </td>

                </tr>
                `;

            });

        }

        const paymentBody =
        document.getElementById(
            "dashboardPaymentsBody"
        );

        paymentBody.innerHTML = "";

        if(paymentsResult.success){
            const payments =
                filterLabRecords(
                    paymentsResult.payments,
                    ["paid_at", "created_at"]
                );

            payments
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

                        <span
                            class="
                            completedStatus
                            "
                        >

                            Paid

                        </span>

                    </td>

                </tr>
                `;

            });

        }

        const now =
        new Date();

        const dashboardDate =
        document.getElementById(
            "dashboardDate"
        );

        if(dashboardDate){
            dashboardDate.innerText =
            now.toLocaleDateString(
                'en-IN',
                {
                    day:'2-digit',
                    month:'short',
                    year:'numeric'
                }
            );
        }

    }
    catch(error){

        console.log(error);

    }

}

async function loadLabBookings(){
    try{
        const response = await fetch('/api/lab/bookings');
        const result = await response.json();
        const tbody = document.getElementById("bookingTableBody");
        tbody.innerHTML = "";
        
        if(result.success){
            const bookings =
                filterLabRecords(
                    result.bookings,
                    ["booking_date", "created_at"]
                );

            if(bookings.length === 0){
                tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="noLabData" style="text-align:center; padding:20px;">
                        No Bookings Found
                    </td>
                </tr>`;
                return;
            }
            
            bookings.forEach(booking => {
                let actionHtml = '';
                if(booking.booking_status === 'pending') {
                    actionHtml = `
                        <button class="add-btn" style="background-color:#10b981; padding: 6px 12px; font-size:12px; margin-right:5px;" onclick="updateLabBookingStatus(${booking.id}, 'completed')">Complete</button>
                        <button class="add-btn" style="background-color:#ef4444; padding: 6px 12px; font-size:12px;" onclick="updateLabBookingStatus(${booking.id}, 'cancelled')">Cancel</button>
                    `;
                } else {
                    actionHtml = `<span style="text-transform: capitalize; font-weight: bold; color: var(--text-muted);">${booking.booking_status}</span>`;
                }

                tbody.innerHTML += `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.full_name || 'N/A'}</td>
                    <td>${booking.test_name}</td>
                    <td>${booking.sample_collection_type}</td>
                    <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>₹${booking.total_amount}</td>
                    <td>
                        <span class="status-badge ${booking.booking_status === 'completed' ? 'status-active' : (booking.booking_status === 'cancelled' ? 'status-rejected' : 'status-pending')}">
                            ${booking.booking_status}
                        </span>
                    </td>
                    <td>${booking.payment_status}</td>
                    <td>${actionHtml}</td>
                </tr>`;
            });
        }
    }
    catch(error){
        console.log(error);
    }
}

async function updateLabBookingStatus(bookingId, status) {
    if(!confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    
    try {
        const response = await fetch('/api/lab/booking/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ booking_id: bookingId, status: status })
        });
        
        const result = await response.json();
        if(result.success) {
            alert(`Booking successfully marked as ${status}!`);
            loadLabBookings(); 
        } else {
            alert('Failed to update booking status.');
        }
    } catch(err) {
        console.log(err);
    }
}

let earningsChartInstance = null;
let bookingsPieChartInstance = null;
let globalBookingsData = [];

async function initDashboardCharts() {
    try {
        const response = await fetch('/api/lab/bookings'); 
        const result = await response.json();
        if(result.success) {
            globalBookingsData =
                filterLabRecords(
                    result.bookings || [],
                    ["booking_date", "created_at"]
                );
            renderEarningsChart();
            renderPieChart("All");
        }
    } catch(err) {
        console.log(err);
    }
}

function renderEarningsChart() {
    const monthlyEarnings = new Array(12).fill(0);
    globalBookingsData.forEach(booking => {
        if(booking.total_amount) {
            const dateStr = booking.booking_date || booking.created_at;
            const month = new Date(dateStr).getMonth();
            if(!isNaN(month)) {
                monthlyEarnings[month] += Number(booking.total_amount);
            }
        }
    });

    const ctx = document.getElementById('earningsBarChart');
    if(!ctx) return;
    
    if(earningsChartInstance) {
        earningsChartInstance.destroy();
        earningsChartInstance = null;
    }

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94A3B8" : "#64748B";
    const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9";

    const chartCtx = ctx.getContext('2d');
    let gradientBlue = chartCtx.createLinearGradient(0, 0, 0, 260);
    gradientBlue.addColorStop(0, '#246BFD');
    gradientBlue.addColorStop(1, isDark ? 'rgba(36, 107, 253, 0.25)' : 'rgba(36, 107, 253, 0.15)');
    
    earningsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Earnings (₹)',
                data: monthlyEarnings,
                backgroundColor: gradientBlue,
                borderColor: '#246BFD',
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 34,
                barPercentage: 0.52
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 8, right: 8, top: 10, bottom: 5 }
            },
            animation: {
                duration: 1100,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#0F172A' : '#172033',
                    titleColor: '#FFFFFF',
                    bodyColor: '#E2E8F0',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderWidth: 1,
                    titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: '700' },
                    bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: function(context) {
                            return ` Revenue: ₹${Number(context.parsed.y).toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }, color: textColor, padding: 6 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    border: { dash: [4, 4], display: false },
                    ticks: {
                        callback: function(value) {
                            if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                            if (value >= 1000) return '₹' + (value / 1000) + 'k';
                            return '₹' + value;
                        },
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
                        color: textColor,
                        padding: 8
                    }
                }
            }
        }
    });
}

function renderPieChart(monthFilter) {
    let completed = 0;
    let pending = 0;
    let cancelled = 0;

    globalBookingsData.forEach(booking => {
        const dateStr = booking.booking_date || booking.created_at;
        const bookingMonth = new Date(dateStr).getMonth().toString();
        
        if(monthFilter === "All" || monthFilter === bookingMonth) {
            const st = (booking.booking_status || '').toLowerCase();
            if(st === 'completed') completed++;
            else if(st === 'pending') pending++;
            else if(st === 'cancelled') cancelled++;
        }
    });

    const ctx = document.getElementById('bookingsPieChart');
    if(!ctx) return;

    if(bookingsPieChartInstance) {
        bookingsPieChartInstance.destroy();
        bookingsPieChartInstance = null;
    }

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94A3B8" : "#475569";
    const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

    const totalCount = completed + pending + cancelled;
    const chartData = totalCount > 0 ? [completed, pending, cancelled] : [1, 0, 0];
    const chartColors = totalCount > 0 ? ['#12B76A', '#F79009', '#F04438'] : ['#64748B', '#64748B', '#64748B'];

    bookingsPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Cancelled'],
            datasets: [{
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
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
                        boxWidth: 10,
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
                    callbacks: {
                        label: function(context) {
                            if (totalCount === 0) return ' No data available';
                            const val = context.parsed;
                            const pct = ((val / totalCount) * 100).toFixed(1);
                            return ` ${context.label}: ${val} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Re-render lab charts on theme toggle
window.addEventListener("hk-theme-change", () => {
    renderEarningsChart();
    const monthSelect = document.getElementById('monthSelect');
    renderPieChart(monthSelect ? monthSelect.value : 'All');
});

function updatePieChart() {
    const monthSelect = document.getElementById('monthSelect').value;
    renderPieChart(monthSelect);
}

function addCustomLabTestOption() {
    const input =
        document.getElementById("customLabTestInput");
    const grid =
        document.getElementById("labTestGrid");
    const testName =
        input?.value.trim().replace(/\s+/g, " ");

    if (!input || !grid) {
        return;
    }

    if (!testName) {
        input.focus();
        return;
    }

    const existing =
        Array.from(
            grid.querySelectorAll("input[type='checkbox']")
        ).find(item =>
            item.value.toLowerCase()
                === testName.toLowerCase()
        );

    if (existing) {
        existing.checked = true;
        input.value = "";
        input.focus();
        return;
    }

    const label =
        document.createElement("label");
    label.className = "customLabTestOption";

    const checkbox =
        document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = testName;
    checkbox.checked = true;

    label.appendChild(checkbox);
    label.appendChild(
        document.createTextNode(` ${testName}`)
    );

    grid.appendChild(label);
    input.value = "";
    input.focus();
}

document.getElementById("addCustomLabTestBtn")?.addEventListener("click", () => {
    const panel =
        document.getElementById("customLabTestPanel");
    const input =
        document.getElementById("customLabTestInput");

    panel?.classList.toggle("is-open");
    input?.focus();
});

document.getElementById("saveCustomLabTestBtn")?.addEventListener(
    "click",
    addCustomLabTestOption
);

document.getElementById("customLabTestInput")?.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            event.preventDefault();
            addCustomLabTestOption();
        }
    }
);

// Add Booking Modal Logic
document.getElementById('addBookingBtn')?.addEventListener('click', async () => {
    document.getElementById('addBookingModal').style.display = 'flex';
    // Fetch labs to populate dropdown
    try {
        const response = await fetch('/api/labs');
        const result = await response.json();
        const select = document.getElementById('bookingLabId');
        select.innerHTML = '';
        if(result.success && result.labs.length > 0) {
            result.labs.forEach(lab => {
                select.innerHTML += `<option value="${lab.id}">${lab.lab_name} (${lab.address})</option>`;
            });
        } else {
            select.innerHTML = '<option value="">No Lab Centers Available</option>';
        }
    } catch(err) {
        console.error('Error loading labs for booking modal', err);
    }
});

document.getElementById('closeBookingModalBtn')?.addEventListener('click', () => {
    document.getElementById('addBookingModal').style.display = 'none';
    document.getElementById('addBookingForm').reset();
});

document.getElementById('addBookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lab_vendor_id = document.getElementById('bookingLabId').value;
    const patient_name = document.getElementById('bookingPatientName').value;
    const test_name = document.getElementById('bookingTestName').value;
    const sample_collection_type = document.getElementById('bookingCollectionType').value;
    const booking_date = document.getElementById('bookingDate').value;
    const total_amount = document.getElementById('bookingAmount').value;
    const booking_status = document.getElementById('bookingStatus').value;
    const payment_status = document.getElementById('bookingPaymentStatus').value;

    if(!lab_vendor_id) {
        alert('Please select a Lab Center.');
        return;
    }

    try {
        const response = await fetch('/api/lab/bookings/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lab_vendor_id,
                patient_name,
                test_name,
                sample_collection_type,
                booking_date,
                total_amount,
                booking_status,
                payment_status
            })
        });
        const result = await response.json();
        if(result.success) {
            alert('Booking added successfully!');
            document.getElementById('addBookingModal').style.display = 'none';
            document.getElementById('addBookingForm').reset();
            loadLabBookings(); // Refresh the table
            loadDashboard(); // Refresh metrics
        } else {
            alert('Failed to add booking: ' + (result.message || 'Unknown error'));
        }
    } catch(err) {
        console.error('Error adding booking', err);
        alert('An error occurred while adding the booking.');
    }
});



