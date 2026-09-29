import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">[\s\S]*?</div>[\s\S]*?</button>\s*</div>'

replacement = '''<div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
                            <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                        </div>
                        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; width: 100%; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Book Now <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>'''

content = re.sub(pattern, replacement, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ambulance card footer to full width button!")
