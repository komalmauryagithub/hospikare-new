import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_ins = r'<article class="insuranceCard.*?>[\s\S]*?</article>'
replacement_ins = '''<article class="insuranceCard ${index === 1 ? "popularPlan" : ""}" style="display: flex; flex-direction: column; padding: 24px; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; position: relative; color: #0f172a; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
    ${index === 1 ? `<div style="position: absolute; top: 0; right: 0; background: linear-gradient(135deg, #ef4444, #e8174a); color: white; font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 0 20px 0 16px; text-transform: uppercase; letter-spacing: 1px;">Most Popular</div>` : ""}
    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(37,99,235,0.04); border-radius: 50%;"></div>
    
    <div style="font-size: 12px; color: #3b82f6; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">${escapeHtml(insurance.comp_type || "Health Cover")}</div>
    <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.2;">${escapeHtml(insurance.comp_name || "Insurance Plan")}</h3>
    
    <div class="insurancePrice" style="font-size: 28px; font-weight: 900; color: #1e293b; margin-bottom: 16px; letter-spacing: -0.5px;">${formatMoney(insurance.claim_price || insurance.ins_price)}</div>
    
    <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 20px;">${escapeHtml(insurance.description || "Coverage details available with the provider.")}</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Claim Type</span>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.claim_type || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Claim Time</span>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.claim_time || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">IRDAI</span>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.irdai || "N/A")}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Support</span>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.cust_sup_num || "N/A")}</span>
        </div>
    </div>
    
    <button class="buyPlanBtn" type="button" data-action="buy-insurance" data-id="${escapeAttr(insurance.id)}" data-name="${escapeAttr(insurance.comp_name || "Insurance Plan")}" data-claim="${escapeAttr(parseMoney(insurance.claim_price))}" data-price="${escapeAttr(parseMoney(insurance.ins_price))}" style="width: 100%; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; margin-top: auto;">
        Buy Plan
    </button>
</article>'''

content = re.sub(pattern_ins, replacement_ins, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated insuranceCard to light theme!")
