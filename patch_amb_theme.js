const fs = require('fs');

let code = fs.readFileSync('js/users.js', 'utf8');

// Find the function start and end
const startTag = 'async function loadAmbulances() {';
const nextFuncTag = 'async function loadLabs() {';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(nextFuncTag);

if (startIndex !== -1 && endIndex !== -1) {
    const oldFuncStr = code.substring(startIndex, endIndex);

    const newFuncStr = `async function loadAmbulances() { 
        const container = $("#ambulanceContainer");
        if (!container) return;
        renderLoading(container, "Loading ambulances...");
        try {
            const data = await apiGet('/api/all-ambulances');
            let ambulances = [];
            if (data && data.success && Array.isArray(data.ambulances) && data.ambulances.length > 0) {
                ambulances = data.ambulances;
            } else {
                ambulances = [
                    { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500, driver_exp: "5 yrs" },
                    { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000, driver_exp: "7 yrs" },
                    { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000, driver_exp: "3 yrs" },
                    { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000, driver_exp: "8 yrs" }
                ];
            }
            
            container.innerHTML = ambulances.map(item => \`
                <article class="ambulanceCard">
                    <div class="ambulanceContent">
                        <h3>\${escapeHtml(item.ambulance_type || "Emergency")} Ambulance</h3>
                        <div class="ambulanceLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>\${escapeHtml(item.area || "Nearby")}</span>
                        </div>
                        <div class="ambulanceFeatures">
                            <span>\${escapeHtml(item.status || "Available")}</span>
                            <span>ETA: \${escapeHtml(item.eta || "N/A")}</span>
                            <span>Driver: \${escapeHtml(item.driver_exp || "N/A")}</span>
                        </div>
                        <p class="ambulanceDescription">\${escapeHtml(item.description || "Emergency support ambulance.")}</p>
                        <div class="ambulanceBottom">
                            <div class="driverName">
                                <i class="fa-solid fa-indian-rupee-sign"></i>
                                Base: \${formatMoney(item.base_chrge || 0)}
                            </div>
                            <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="\${escapeAttr(item.id)}" data-type="\${escapeAttr(item.ambulance_type)}" data-amount="\${escapeAttr(item.base_chrge || 1500)}">
                                Book Now
                            </button>
                        </div>
                    </div>
                </article>
            \`).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
    }

    `;

    code = code.replace(oldFuncStr, newFuncStr);
    fs.writeFileSync('js/users.js', code);
    console.log('Restored old ambulance theme');
} else {
    console.log('Could not find loadAmbulances() or loadLabs()');
}
