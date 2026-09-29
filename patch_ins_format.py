import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_ins = r'<article class="insuranceCard.*?>[\s\S]*?</article>'
replacement_ins = '''<article class="insuranceCard ${index === 1 ? "popularPlan" : ""}" style="display: flex; flex-direction: column; padding: 24px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; box-shadow: 0 16px 32px -8px rgba(15,23,42,0.3); border: 1px solid rgba(255,255,255,0.1); position: relative; color: white; overflow: hidden; transition: transform 0.3s ease;">
    ${index === 1 ? `<div style="position: absolute; top: 0; right: 0; background: linear-gradient(135deg, #ef4444, #e8174a); color: white; font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 0 24px 0 16px; text-transform: uppercase; letter-spacing: 1px;">Most Popular</div>` : ""}
    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.03); border-radius: 50%;"></div>
    
    <div style="font-size: 13px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">${escapeHtml(insurance.comp_type || "Health Cover")}</div>
    <h3 style="font-size: 22px; font-weight: 800; color: white; margin: 0 0 16px 0; font-family: var(--font-heading);">${escapeHtml(insurance.comp_name || "Insurance Plan")}</h3>
    
    <div class="insurancePrice" style="font-size: 32px; font-weight: 900; color: white; margin-bottom: 16px;">${formatMoney(insurance.claim_price || insurance.ins_price)}</div>
    
    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px;">${escapeHtml(insurance.description || "Coverage details available with the provider.")}</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Claim Type</span>
            <span style="font-size: 13px; font-weight: 600;">${escapeHtml(insurance.claim_type || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Claim Time</span>
            <span style="font-size: 13px; font-weight: 600;">${escapeHtml(insurance.claim_time || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">IRDAI</span>
            <span style="font-size: 13px; font-weight: 600;">${escapeHtml(insurance.irdai || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Support</span>
            <span style="font-size: 13px; font-weight: 600;">${escapeHtml(insurance.cust_sup_num || "N/A")}</span>
        </div>
    </div>
    
    <button class="buyPlanBtn" type="button" data-action="buy-insurance" data-id="${escapeAttr(insurance.id)}" data-name="${escapeAttr(insurance.comp_name || "Insurance Plan")}" data-claim="${escapeAttr(parseMoney(insurance.claim_price))}" data-price="${escapeAttr(parseMoney(insurance.ins_price))}" style="width: 100%; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;">
        Buy Plan
    </button>
</article>'''
content = re.sub(pattern_ins, replacement_ins, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated insuranceCard format!")
