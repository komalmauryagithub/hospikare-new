import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<article class="ambulanceCard".*?>[\s\S]*?</article>'

replacement = '''<article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    
    <!-- Top Urgent Header -->
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
    
    <!-- Quick Specs -->
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
    
    <!-- Pricing & Action -->
    <div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; flex-direction: column;">
            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
            <div style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
        </div>
        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; padding: 0 24px; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
            Book Now <i class="fa-solid fa-arrow-right"></i>
        </button>
    </div>
</article>'''

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ambulance card layout to Uber-style!")
