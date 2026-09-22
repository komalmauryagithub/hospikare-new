const fs = require('fs');

let code = fs.readFileSync('js/users.js', 'utf8');

// 1. Inject getImageUrl
if (!code.includes('function getImageUrl')) {
    code = code.replace('function renderLoading', `
    function getImageUrl(imgPath) {
        if (!imgPath) return '';
        let normalized = String(imgPath).replace(/\\\\\\\\/g, '/');
        if (normalized.startsWith('http')) return normalized;
        if (normalized.startsWith('uploads/')) return '/' + normalized;
        if (normalized.startsWith('/uploads/')) return normalized;
        if (normalized.startsWith('/')) return normalized;
        return '/uploads/' + normalized;
    }
    
    function renderLoading`);
}

// 2. Fix image rendering in all load functions
code = code.replace(/\$\{\(item\.medicine_image \|\| item\.image\)\.startsWith\('http'\).*?\}/g, '${getImageUrl(item.medicine_image || item.image)}');
code = code.replace(/\$\{\(item\.image\)\.startsWith\('http'\).*?\}/g, '${getImageUrl(item.image)}');
code = code.replace(/\$\{escapeAttr\(img\)\.includes\('fakepath'\) \? FALLBACK_IMAGE : \(escapeAttr\(img\)\.startsWith\('\/'\).*?\}/g, '${getImageUrl(img)}');
code = code.replace(/\$\{escapeAttr\(image\)\.includes\('fakepath'\) \? FALLBACK_IMAGE : \(escapeAttr\(image\)\.startsWith\('\/'\).*?\}/g, '${getImageUrl(image)}');

// 3. Update loadFeaturedHospitals button to match
code = code.replace(/<a href="\/hosp_data\.html\?id=\$\{escapeAttr\(hospital\.id\)\}" class="viewBtn" style=".*?>/g, 
    '<a href="/hosp_data.html?id=${escapeAttr(hospital.id)}" class="btn btn-primary" style="width: 100%; text-decoration: none; display: flex; justify-content: center;">');

// 4. Update loadAmbulances to actually fetch from /api/all-ambulances and render dynamically
const loadAmbulancesCode = `
    async function loadAmbulances() { 
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
                    { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500 },
                    { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000 },
                    { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000 },
                    { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000 }
                ];
            }
            
            container.innerHTML = ambulances.map(item => \`
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; background: #f8fafc; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-truck-medical" style="font-size: 64px; color: #cbd5e1; padding: 32px;"></i>
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="margin-bottom: 4px;">\${escapeHtml(item.ambulance_type || "Ambulance")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>\${escapeHtml(item.area || "Nearby")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            <span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">ETA: \${escapeHtml(item.eta || 'N/A')}</span>
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="font-weight: 800; font-size: 16px; color: #0f172a;">
                                \${item.base_chrge ? formatMoney(item.base_chrge) : 'Rates Vary'}
                            </div>
                            <button class="btn btn-primary" type="button" onclick="document.getElementById('emergencySosModal') ? document.getElementById('emergencySosModal').style.display='flex' : null">Book Now</button>
                        </div>
                    </div>
                </article>
            \`).join("");
        } catch(e) {
            console.error("Failed to load ambulances", e);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
    }
`;
code = code.replace(/async function loadAmbulances\(\) \{[\s\S]*?catch\(e\) \{[\s\S]*?\}[\s\S]*?\}/, loadAmbulancesCode.trim());

fs.writeFileSync('js/users.js', code);
console.log("Patched users.js successfully.");
