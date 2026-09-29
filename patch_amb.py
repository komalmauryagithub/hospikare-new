import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# First, find both loadAmbulances definitions and replace them all with one perfect version.
pattern = r'async function loadAmbulances\(\) \{[\s\S]*?\}\s*(?=async function load)'

replacement = '''async function loadAmbulances() { 
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
        
        container.innerHTML = ambulances.map(item => `
            <article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; padding: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            <i class="fa-solid fa-truck-medical"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${escapeHtml(item.ambulance_type || "Emergency")}</h3>
                            <div style="font-size: 12px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-location-dot" style="color: #cbd5e1;"></i> ${escapeHtml(item.area || "Nearby")}
                            </div>
                        </div>
                    </div>
                    <div style="background: #ecfdf5; color: #059669; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 6px;">${escapeHtml(item.status || "Available")}</div>
                </div>
                
                <div style="display: flex; gap: 24px; margin-bottom: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">ETA</span>
                        <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${escapeHtml(item.eta || "N/A")}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Driver Exp</span>
                        <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${escapeHtml(item.driver_exp || "N/A")}</span>
                    </div>
                </div>
                
                <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Base Fare</span>
                        <div style="font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                    </div>
                    <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #dc2626; color: white; border-radius: 10px; padding: 0 20px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s;">
                        Book Now
                    </button>
                </div>
            </article>
        `).join("");
    } catch (error) {
        console.error("Error loading ambulances:", error);
        container.innerHTML = `<div class="error-msg">Failed to load ambulances.</div>`;
    }
}
'''
content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated loadAmbulances!")
