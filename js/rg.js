window.onload = function () {
    const hospitalFields = document.getElementById("hospitalFields");
    if (hospitalFields) {
        hospitalFields.classList.add("hidden");
    }

    const hospitalImageInput = document.getElementById("hospital_images");
    if (hospitalImageInput) {
        setupImageLimitValidation("hospital_images", "hospital_image_count", 4);
    }

    if (window.location.hash === "#register") {
        showRegister();
    }
    else {
        showLogin();
    }
};

function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
    document.body.classList.add("register-mode");
    window.history.replaceState(null, "", "#register");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
    document.body.classList.remove("register-mode");
    window.history.replaceState(null, "", "#login");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleusers_type(value) {
    const fields = [
        "hospitalFields",
        "ambulanceFields",
        "labFields",
        "insuranceFields",
        "medicineFields",
        "equipmentFields",
    ];

    fields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add("hidden");
        }
    });

    if (!value) {
        return;
    }

    const normalizedValue = value.toLowerCase();
    const fieldMap = {
        hospital: "hospitalFields",
        ambulance: "ambulanceFields",
        "lab test": "labFields",
        insurance: "insuranceFields",
        medicines: "medicineFields",
        "medical equipments": "equipmentFields",
    };

    const targetFieldId = fieldMap[normalizedValue];
    if (targetFieldId) {
        const targetField = document.getElementById(targetFieldId);
        if (targetField) {
            targetField.classList.remove("hidden");
        }
    }
}

function addRoom() {
    const container = document.getElementById("roomsContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Total Beds</label>
            <input type="number" class="room-total-beds">
        </div>
        <div class="input-group">
            <label>Room Type</label>
            <select class="room-type">
                <option>General</option>
                <option>ICU</option>
                <option>Deluxe</option>
            </select>
        </div>
        <div class="input-group">
            <label>Availability</label>
            <select class="room-availability">
                <option>Available</option>
                <option>Full</option>
            </select>
        </div>
        <div class="input-group">
            <label>Pricing</label>
            <input type="text" class="room-pricing">
        </div>
        <div class="input-group">
            <label>Details</label>
            <input type="text" class="room-details">
        </div>
        <div class="input-group">
            <label>Room Images (Max 4)</label>
            <input type="file" class="room-images" multiple accept="image/*" data-max-images="4">
            <small style="color: #666; font-size: 12px;">Maximum 4 images per room</small>
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove Room</button>
    `;
    container.appendChild(div);
}

function addDoctor() {
    const container = document.getElementById("doctorsContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Doctor Name</label>
            <input type="text" class="doctor-name">
        </div>
        <div class="input-group">
            <label>Doctor Image</label>
            <input type="file" class="doctor-image">
        </div>
        <div class="input-group">
            <label>Qualification</label>
            <input type="text" class="doctor-qualification">
        </div>
        <div class="input-group">
            <label>Experience</label>
            <input type="text" class="doctor-experience">
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove Doctor</button>
    `;
    container.appendChild(div);
}

function openPathologistCSVModal() {
    document.getElementById("pathologistCsvModal").style.display = "flex";
}

function closePathologistCSVModal() {
    document.getElementById("pathologistCsvModal").style.display = "none";
    document.getElementById("pathologistCsvFile").value = "";
}

async function uploadPathologistCSV() {
    const fileInput = document.getElementById("pathologistCsvFile");
    if (!fileInput.files[0]) {
        alert("Please select a CSV file");
        return;
    }
    
    try {
        const file = fileInput.files[0];
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        
        if (lines.length < 2) {
            alert("CSV must have header and at least one pathologist");
            return;
        }
        
        const headers = parseCsvLine(lines[0].replace(/^\uFEFF/, "")).map(h => 
            h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
        );
        const findHeader = (options) => headers.findIndex(h => options.some(opt => h === opt || h.includes(opt)));
        
        const nameIdx = findHeader(["pathologist_name", "name", "pathologist"]);
        const qualIdx = findHeader(["qualification", "qualifications", "qual"]);
        const expIdx = findHeader(["experience", "exp"]);
        
        if (nameIdx === -1 || qualIdx === -1 || expIdx === -1) {
            console.log("Parsed pathologist CSV headers:", headers);
            alert("CSV must have columns containing name, qualification, and experience");
            return;
        }
        
        let addedCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]).map(v => v.trim());
            if (!values[nameIdx]) continue;
            
            addPathologist(values[nameIdx], values[qualIdx] || "", values[expIdx] || "");
            addedCount++;
        }
        
        alert(`Successfully imported ${addedCount} pathologists from CSV`);
        closePathologistCSVModal();
    } catch (error) {
        console.error(error);
        alert("Error parsing CSV file. Please check format.");
    }
}

function addPathologist(name = '', qualification = '', experience = '') {
    const container = document.getElementById("pathologistContainer");
    const div = document.createElement("div");
    div.classList.add("dynamic-box");
    div.innerHTML = `
        <div class="input-group">
            <label>Name</label>
            <input type="text" class="pathologist-name" value="${escapeHtml(name)}">
        </div>
        <div class="input-group">
            <label>Qualification</label>
            <input type="text" class="pathologist-qualification" value="${escapeHtml(qualification)}">
        </div>
        <div class="input-group">
            <label>Experience</label>
            <input type="text" class="pathologist-experience" value="${escapeHtml(experience)}">
        </div>
        <div class="input-group">
            <label>Medical Registration Proof</label>
            <input type="file" class="pathologist-proof">
        </div>
        <div class="input-group">
            <label>Pathologist Certificate</label>
            <input type="file" class="pathologist-cert">
        </div>
        <div class="input-group">
            <label>Pathologist Image</label>
            <input type="file" class="pathologist-image" accept="image/*">
        </div>
        <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

document.querySelector("#registerForm form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", document.querySelector("#registerForm input[placeholder='Enter name']").value.trim());
    formData.append(
        "email_or_contact",
        document.querySelector("#registerForm input[placeholder='Enter email or phone']").value.trim()
    );
    const users_type = document.getElementById("userType")
        .value
        .toLowerCase()
        .trim();
    formData.append("user_type", users_type);
    const passwords = document.querySelectorAll("#registerForm input[type='password']");
    const setPassword = passwords[0]?.value.trim() || "";
    const confirmPassword = passwords[1]?.value.trim() || "";
    if (setPassword.length < 4) {
        alert("Password should be at least 4 characters long!");
        return;
    }
    if (setPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    formData.append("password", setPassword);

    const bankInput = document.querySelector("input[placeholder='Account Number']");
    const ifscInput = document.querySelector("input[placeholder='IFSC Code']");
    if (bankInput) formData.append("bank_account", bankInput.value.trim());
    if (ifscInput) formData.append("ifsc", ifscInput.value.trim());

    const allFiles = document.querySelectorAll("#registerForm input[type='file']");
    if (allFiles[0]?.files[0]) formData.append("identity_proof", allFiles[0].files[0]);
    if (allFiles[1]?.files[0]) formData.append("profile_photo", allFiles[1].files[0]);
    if (allFiles[2]?.files[0]) formData.append("cheque", allFiles[2].files[0]);

if (users_type === "hospital" && document.getElementById("hospitalFields")) {
        const hospitalNameInput = document.querySelector("#hospitalFields input[name='hospital_name']");
        const hospitalAddressInput = document.getElementById("address");
        const hospitalFacilitiesInput = document.querySelector("#hospitalFields input[placeholder='Oxygen, ICU, Ventilator']");

        if (hospitalNameInput) formData.append("hospital_name", hospitalNameInput.value);
        if (hospitalAddressInput) formData.append("address", hospitalAddressInput.value);
        if (hospitalFacilitiesInput) formData.append("facilities", hospitalFacilitiesInput.value);

        const rooms = [];
        document.querySelectorAll("#roomsContainer .dynamic-box").forEach(box => {
            const roomImages = box.querySelector(".room-images");
            const maxImages = Math.min(roomImages?.files?.length || 0, 4);

            if (roomImages && roomImages.files.length > 0) {
                for (let i = 0; i < maxImages; i++) {
                    formData.append("room_images", roomImages.files[i]);
                }
            }

            rooms.push({
                total_beds: box.querySelector(".room-total-beds")?.value || "",
                room_type: box.querySelector(".room-type")?.value || "",
                availability: box.querySelector(".room-availability")?.value || "",
                pricing: box.querySelector(".room-pricing")?.value || "",
                details: box.querySelector(".room-details")?.value || "",
                imageCount: maxImages
            });
        });
        formData.append("rooms", JSON.stringify(rooms));

        const doctors = [];
        document.querySelectorAll("#doctorsContainer .dynamic-box").forEach(box => {
            const doctorImage = box.querySelector(".doctor-image");
            const docData = {
                doctor_name: box.querySelector(".doctor-name")?.value || "",
                qualification: box.querySelector(".doctor-qualification")?.value || "",
                experience: box.querySelector(".doctor-experience")?.value || "",
                hasImage: !!(doctorImage && doctorImage.files[0])
            };
            doctors.push(docData);

            if (doctorImage && doctorImage.files[0]) {
                formData.append("doctor_images", doctorImage.files[0]);
            }
        });
        formData.append("doctors", JSON.stringify(doctors));

        const hospImages = document.querySelector("#hospitalFields input[multiple]");
        if (hospImages?.files?.length > 0) {
            const maxHospImages = Math.min(hospImages.files.length, 4);
            for (let i = 0; i < maxHospImages; i++) {
                formData.append("hospital_images", hospImages.files[i]);
            }
        }
    }

    else if (users_type === "ambulance" && document.getElementById("ambulanceFields")) {
        const ambInputs = document.querySelectorAll("#ambulanceFields input");
        const ambSelects = document.querySelectorAll("#ambulanceFields select");

        if (ambSelects[0]) formData.append("ambulance_type", ambSelects[0].value || "");
        if (ambInputs[0]) formData.append("base_chrge", ambInputs[0].value || "");
        if (ambInputs[1]) formData.append("min_chrge", ambInputs[1].value || "");
        if (ambInputs[2]) formData.append("night_chrg", ambInputs[2].value || "");
        if (ambInputs[3]) formData.append("wait_chrg", ambInputs[3].value || "");
        if (ambSelects[1]) formData.append("status", ambSelects[1].value || "");
        if (ambInputs[4]) formData.append("eta", ambInputs[4].value || "");
        if (ambInputs[5]) formData.append("book_time_slot", ambInputs[5].value || "");
        if (ambInputs[6]) formData.append("area", ambInputs[6].value || "");
        if (ambInputs[7]) formData.append("description", ambInputs[7].value || "");
        if (ambInputs[8]) formData.append("driver_exp", ambInputs[8].value || "");

        const ambFiles = document.querySelectorAll("#ambulanceFields input[type='file']");
        if (ambFiles[0]?.files[0]) formData.append("lic", ambFiles[0].files[0]);
        if (ambFiles[1]?.files[0]) formData.append("rc", ambFiles[1].files[0]);
        if (ambFiles[2]?.files[0]) formData.append("veh_ins", ambFiles[2].files[0]);
    }

    else if ((users_type === "lab test" || users_type === "lab") && document.getElementById("labFields")) {
        if (document.getElementById("lab_name")) formData.append("lab_name", document.getElementById("lab_name").value);
        if (document.getElementById("labAddress")) formData.append("address", document.getElementById("labAddress").value);
        if (document.getElementById("description")) formData.append("description", document.getElementById("description").value);
        if (document.getElementById("location")) formData.append("location", document.getElementById("location").value || "");

        const labTypes = [], tests = [];
        document.querySelectorAll("#labFields input[type='checkbox']:checked").forEach(cb => {
            const label = cb.parentElement.textContent.trim();
            if (["Pathology","Radiology","Diagnostic"].includes(label)) labTypes.push(label);
            else tests.push(label);
        });
        formData.append("lab_type", JSON.stringify(labTypes));
        formData.append("test", JSON.stringify(tests));

        const labSelects = document.querySelectorAll("#labFields select");
        formData.append("home_coll", labSelects[0]?.value || "");
        formData.append("extra_chrg", document.getElementById("ext_chrg").value || 0);
        formData.append("available_areas", document.getElementById("alb_area").value);
        formData.append("lab_hrs", document.getElementById("lab_open").value);
        formData.append("test_time", document.getElementById("test_time").value || "");
        formData.append("test_price", document.getElementById("test_price").value || 0);
        formData.append("emergency_test", labSelects[1]?.value || "No");
        formData.append("adv_equipment", labSelects[2]?.value || "No");

        const pathologists = [];
        document.querySelectorAll("#pathologistContainer .dynamic-box").forEach(box => {
            const proofInput = box.querySelector(".pathologist-proof");
            const certInput = box.querySelector(".pathologist-cert");
            const imageInput = box.querySelector(".pathologist-image");
            
            const hasProof = !!(proofInput && proofInput.files[0]);
            const hasCert = !!(certInput && certInput.files[0]);
            const hasImage = !!(imageInput && imageInput.files[0]);
            
            pathologists.push({
                name: box.querySelector(".pathologist-name")?.value || "",
                qualification: box.querySelector(".pathologist-qualification")?.value || "",
                experience: box.querySelector(".pathologist-experience")?.value || "",
                hasProof,
                hasCert,
                hasImage
            });
            
            if (hasProof) {
                formData.append("pathologist_proofs", proofInput.files[0]);
            }
            if (hasCert) {
                formData.append("pathologist_certs", certInput.files[0]);
            }
            if (hasImage) {
                formData.append("pathologist_images", imageInput.files[0]);
            }
        });
        formData.append("pathologist", JSON.stringify(pathologists));

        const labRegFile = document.getElementById("lab_reg_cert");
        const nablFile = document.getElementById("nabl_cert");
        if (labRegFile?.files[0]) formData.append("lab_reg", labRegFile.files[0]);
        if (nablFile?.files[0]) formData.append("nabl", nablFile.files[0]);
    }

    else if (users_type === "insurance") {
        if (document.getElementById("company_name")) formData.append("comp_name", document.getElementById("company_name").value);
        if (document.getElementById("company_type")) formData.append("comp_type", document.getElementById("company_type").value);
        if (document.getElementById("ins_description")) formData.append("description", document.getElementById("ins_description").value);
        if (document.getElementById("irdai_number")) formData.append("irdai", document.getElementById("irdai_number").value);
        if (document.getElementById("company_pan")) formData.append("comp_pan", document.getElementById("company_pan").value);
        if (document.getElementById("gst_number")) formData.append("gst", document.getElementById("gst_number").value);
        if (document.getElementById("ins_address")) formData.append("offc_add", document.getElementById("ins_address").value);
        const claimType = document.getElementById("claim_type");
        const claimTime = document.getElementById("claim_approval_time");
        if (claimType) formData.append("claim_type", claimType.value || "");
        if (claimTime) formData.append("claim_time", claimTime.value || "");
        if (document.getElementById("required_docs")) formData.append("doc_req", document.getElementById("required_docs").value);
        if (document.getElementById("contact_number")) formData.append("cust_sup_num", document.getElementById("contact_number").value);
        if (document.getElementById("ins_email")) formData.append("email_sup", document.getElementById("ins_email").value);
        if (document.getElementById("contact_person")) formData.append("contact_person", document.getElementById("contact_person").value);
        if (document.getElementById("website")) formData.append("website", document.getElementById("website").value);
        if (document.getElementById("ins_price")) formData.append("ins_price", document.getElementById("ins_price").value);
        if (document.getElementById("claim_price")) formData.append("claim_price", document.getElementById("claim_price").value);
        const regDoc = document.getElementById("reg_doc");
        const policyDoc = document.getElementById("policy_doc");
        if (regDoc?.files[0]) {
            formData.append("incorp_cert", regDoc.files[0]);
        }
        if (policyDoc?.files[0]) {
            formData.append("add_proof", policyDoc.files[0]);
        }
    }

    else if (users_type === "medicines") {
        if (document.getElementById("pharm_shop_name")) formData.append("pharm_name", document.getElementById("pharm_shop_name").value);
        if (document.getElementById("own_name")) formData.append("owner_name", document.getElementById("own_name").value);
        if (document.getElementById("shop_type")) formData.append("shop_type", document.getElementById("shop_type").value);
        if (document.getElementById("pharm_desc")) formData.append("description", document.getElementById("pharm_desc").value);
        if (document.getElementById("issued_by")) formData.append("issued_by", document.getElementById("issued_by").value);
        if (document.getElementById("pharm_address")) formData.append("address", document.getElementById("pharm_address").value);
        if (document.getElementById("pharm_lcn")) formData.append("location", document.getElementById("pharm_lcn").value);
        if (document.getElementById("pharmacist_name")) formData.append("pharmacist_name", document.getElementById("pharmacist_name").value);
        if (document.getElementById("state_pharmacy_registration")) formData.append("phar_counc_reg", document.getElementById("state_pharmacy_registration").value);
        const availableProducts = [];
        document.querySelectorAll(
            "#medicineFields .checkbox-grid input[type='checkbox']"
        ).forEach((checkbox) => {
            if (checkbox.checked) {
                availableProducts.push(
                    checkbox.parentElement.textContent.trim()
                );
            }
        });
        formData.append("prod_avb",
            JSON.stringify(availableProducts)
        );
        formData.append("home_dev",
            document.getElementById("pharm_home_delivery").value
        );
        formData.append("dev_area",
            document.getElementById("pharm_dev_area").value
        );
        formData.append("dev_chrg",
            document.getElementById("pharm_dev_charges").value
        );
        formData.append("shop_hrs",
            document.getElementById("pharm_opening_hours").value
        );
        formData.append("avlblty",
            document.getElementById("pharm_availability").value
        );
        const medicineFiles = document.querySelectorAll(
            "#medicineFields input[type='file']"
        );
        if (medicineFiles[0]?.files[0]) {
            formData.append("drug_lic", medicineFiles[0].files[0]);
        }
        if (medicineFiles[1]?.files[0]) {
            formData.append("address_proof", medicineFiles[1].files[0]);
        }
        if (medicineFiles[2]?.files[0]) {
            formData.append("gst_cer", medicineFiles[2].files[0]);
        }
        if (medicineFiles[3]?.files[0]) {
            formData.append("pharm_cer", medicineFiles[3].files[0]);
        }
    }

    else if (users_type === "medical equipments") {
        if (document.getElementById("me_vn")) formData.append("ven_bus_name", document.getElementById("me_vn").value);
        if (document.getElementById("me_on")) formData.append("owner_name", document.getElementById("me_on").value);
        if (document.getElementById("me_bt")) formData.append("business_type", document.getElementById("me_bt").value);
        if (document.getElementById("me_desc")) formData.append("description", document.getElementById("me_desc").value);
        if (document.getElementById("me_address")) formData.append("address", document.getElementById("me_address").value);
        if (document.getElementById("me_location")) formData.append("location", document.getElementById("me_location").value);
        const addressProof = document.getElementById("me_address_proof");
        const qualityCertificates = document.getElementById("me_quality_certificates");
        const approvalCompliance = document.getElementById("me_approval_compliance");
        if (addressProof?.files[0]) {
            formData.append("address_proof", addressProof.files[0]);
        }
        if (qualityCertificates?.files[0]) {
            formData.append("qual_cer", qualityCertificates.files[0]);
        }
        if (approvalCompliance?.files[0]) {
            formData.append("app_comp", approvalCompliance.files[0]);
        }
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert("Registration successful! Please log in to complete your vendor profile details.");
            showLogin();
        } else {
            alert("Registration Failed: " + (result.message || "Please try again"));
        }
    } catch (error) {
        console.error(error);
        alert("Server connection error. Please try again.");
    }
});

document.querySelector("#loginForm form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.querySelector("#loginForm input[type='text']").value;
    const password = document.querySelector("#loginForm input[type='password']").value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_or_contact: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // 🔥 REDIRECT
            window.location.href = result.redirect;
        } else {
            alert(result.message);
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

// ===== CSV IMPORT FOR DOCTORS AND ROOMS =====

// Doctor CSV Modal Functions
function openDoctorCSVModal() {
    document.getElementById("doctorCsvModal").style.display = "flex";
}

function closeDoctorCSVModal() {
    document.getElementById("doctorCsvModal").style.display = "none";
    document.getElementById("doctorCsvFile").value = "";
}

// Upload and Parse Doctor CSV
async function uploadDoctorCSV() {
    const fileInput = document.getElementById("doctorCsvFile");
    if (!fileInput.files[0]) {
        alert("Please select a CSV file");
        return;
    }
    
    try {
        const file = fileInput.files[0];
        const text = await file.text();
        const lines = text
            .replace(/\r/g, "")
            .trim()
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);
        
        if (lines.length < 2) {
            alert("CSV must have header and at least one doctor");
            return;
        }
        
        // Parse header with BOM removal and quoted-field support
        const headers = parseCsvLine(lines[0].replace(/^\uFEFF/, "")).map(h => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
        const findHeader = (options) => headers.findIndex(h => options.some(opt => h === opt || h.includes(opt)));
        const nameIdx = findHeader(["doctor_name", "doctorname", "doctor", "name"]);
        const qualIdx = findHeader(["qualification", "qual"]);
        const expIdx = findHeader(["experience", "exp"]);
        
        if (nameIdx === -1 || qualIdx === -1 || expIdx === -1) {
            console.log("Parsed doctor CSV headers:", headers);
            alert("CSV must have columns: doctor_name, qualification, experience");
            return;
        }
        
        const container = document.getElementById("doctorsContainer");
        let addedCount = 0;
        
        // Parse rows
        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]).map(v => v.trim());
            if (!values[nameIdx]) continue;
            
            const div = document.createElement("div");
            div.classList.add("dynamic-box");
            div.innerHTML = `
                <div class="input-group">
                    <label>Doctor Name</label>
                    <input type="text" class="doctor-name" value="${escapeHtml(values[nameIdx])}">
                </div>
                <div class="input-group">
                    <label>Doctor Image</label>
                    <input type="file" class="doctor-image">
                </div>
                <div class="input-group">
                    <label>Qualification</label>
                    <input type="text" class="doctor-qualification" value="${escapeHtml(values[qualIdx] || '')}">
                </div>
                <div class="input-group">
                    <label>Experience</label>
                    <input type="text" class="doctor-experience" value="${escapeHtml(values[expIdx] || '')}">
                </div>
                <button type="button" class="btn small remove-btn" onclick="this.parentElement.remove()">Remove Doctor</button>
            `;
            container.appendChild(div);
            addedCount++;
        }
        
        alert(`Successfully imported ${addedCount} doctors from CSV`);
        closeDoctorCSVModal();
    } catch (error) {
        console.error(error);
        alert("Error parsing CSV file. Please check format.");
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
            continue;
        }

        current += char;
    }

    result.push(current);
    return result;
}
// Image Validation Function - Limit to max images and show counter
function setupImageLimitValidation(inputId, counterId, maxImages = 4) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    
    if (!input) return;
    
    input.addEventListener("change", function() {
        const files = this.files;
        if (files.length > maxImages) {
            alert(`Maximum ${maxImages} images allowed. Only first ${maxImages} will be used.`);
            const dt = new DataTransfer();
            for (let i = 0; i < maxImages; i++) {
                dt.items.add(files[i]);
            }
            this.files = dt.files;
        }
        if (counter) {
            counter.textContent = `(${Math.min(files.length, maxImages)}/${maxImages})`;
        }
    });
}