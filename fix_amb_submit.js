const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const oldSubmitRegex = /document\.getElementById\(\s*"ambulanceForm"\s*\)\.addEventListener\(\s*"submit",\s*async\s*\(e\)\s*=>\s*\{[\s\S]*?loadAmbulances\(\);\s*\}\s*\}\s*catch\(error\)\{\s*console\.log\(error\);\s*\}\s*\}\);/;

const newSubmit = `document.getElementById("ambulanceForm")?.addEventListener("submit", async (e) => {
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
});`;

ambJs = ambJs.replace(oldSubmitRegex, newSubmit);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed ambulanceForm submit handler');
