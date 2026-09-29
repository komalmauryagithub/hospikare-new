with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_amb = '''
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
                    { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500, driver_exp: "5 yrs" },
                    { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000, driver_exp: "7 yrs" },
                    { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000, driver_exp: "3 yrs" },
                    { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000, driver_exp: "8 yrs" }
                ];
            }
            
            container.innerHTML = ambulances.map(item => `
                <article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
                    <div style="padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></span>
                                <span style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">Ready for Dispatch</span>
                            </div>
                            <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2; font-family: var(--font-heading);">${escapeHtml(item.ambulance_type || "Emergency")}</h3>
                        </div>
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
                            <i class="fa-solid fa-truck-medical"></i>
                        </div>
                    </div>
                    <div style="padding: 0 24px 20px 24px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                                <i class="fa-solid fa-clock" style="color: #94a3b8;"></i> ETA: ${escapeHtml(item.eta || "10 mins")}
                            </div>
                            <div style="width: 4px; height: 4px; border-radius: 50%; background: #cbd5e1;"></div>
                            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                                <i class="fa-solid fa-location-crosshairs" style="color: #94a3b8;"></i> ${escapeHtml(item.area || "Nearby")}
                            </div>
                        </div>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">Fully equipped medical transport unit with experienced paramedics.</p>
                    </div>
                    <div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
                            <div style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                        </div>
                        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; padding: 0 24px; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                            Book Now <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </article>
            `).join("");
        } catch(e) {
            console.error("Failed to load ambulances", e);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
    }
'''

# Find loadEquipments and place it right above it
insert_point = content.find('    async function loadEquipments() {')
if insert_point != -1:
    content = content[:insert_point] + new_amb + '\n' + content[insert_point:]
    with open('js/users.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added loadAmbulances back to the top block!")
else:
    print("Could not find loadEquipments!")
