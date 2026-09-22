with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# =================== MEDICINE CARD ===================
old_medicine = '''data.medicines.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(item.product_name || item.name || "Medicine")}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(item.brand_name || item.pharmacy_name || "Pharmacy")}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(item.price || item.unit_price || 100)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(item.id)}" data-name="${escapeAttr(item.product_name || 'Medicine')}" data-brand="${escapeAttr(item.brand_name || '')}" data-price="${escapeAttr(item.price || 100)}" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

new_medicine = '''data.medicines.map(item => `
                <article class="card productCard" style="background:white; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.10)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">
                    <div style="height: 160px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #e2e8f0; overflow:hidden; position:relative;">
                        ${item.medicine_image || item.image
                            ? `<img src="/uploads/${item.medicine_image || item.image}" alt="${escapeHtml(item.medicine_name || item.product_name || 'Medicine')}" style="width:100%; height:100%; object-fit:contain; padding: 12px;">`
                            : `<i class="fa-solid fa-pills" style="font-size:52px; color:#16a34a; opacity:0.7;"></i>`}
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1; gap:8px;">
                        <h3 style="font-size:15px; margin:0; color:#0f172a; font-weight:600; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.medicine_name || item.product_name || item.name || "Medicine")}</h3>
                        <p style="color:#64748b; font-size:12px; margin:0; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.brand_name || item.category || item.pharmacy_name || "Pharmacy")}</p>
                        ${item.generic_name ? `<span style="font-size:11px; color:#10b981; background:#f0fdf4; padding:2px 8px; border-radius:20px; width:fit-content;">${escapeHtml(item.generic_name)}</span>` : ''}
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:8px; border-top:1px solid #f1f5f9;">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#64748b;">Price</span>
                                <span class="price" style="font-weight:700; color:#16a34a; font-size:18px;">${formatMoney(item.selling_price || item.price || item.unit_price || 100)}</span>
                            </div>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(item.medicine_id || item.id)}" data-name="${escapeAttr(item.medicine_name || item.product_name || 'Medicine')}" data-brand="${escapeAttr(item.brand_name || '')}" data-price="${escapeAttr(item.selling_price || item.price || 100)}" style="background:#16a34a; color:white; border:none; padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; font-size:13px;">
                                <i class="fa-solid fa-cart-plus" style="margin-right:4px;"></i>Add
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

# =================== EQUIPMENT CARD ===================
old_equipment = '''data.equipments.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(item.product_name || item.name || "Medical Equipment")}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(item.vendor_name || item.company_name || "Supplier")}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(item.price || item.rental_price || 1500)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(item.id)}" data-name="${escapeAttr(item.product_name || 'Equipment')}" data-brand="${escapeAttr(item.vendor_name || '')}" data-price="${escapeAttr(item.price || 1500)}" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

new_equipment = '''data.equipments.map(item => `
                <article class="card productCard" style="background:white; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.10)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">
                    <div style="height: 160px; background: linear-gradient(135deg, #eff6ff, #dbeafe); display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #e2e8f0; overflow:hidden;">
                        ${item.thumbnail_image || item.image
                            ? `<img src="/uploads/${item.thumbnail_image || item.image}" alt="${escapeHtml(item.product_name || 'Equipment')}" style="width:100%; height:100%; object-fit:contain; padding: 12px;">`
                            : `<i class="fa-solid fa-stethoscope" style="font-size:52px; color:#3b82f6; opacity:0.7;"></i>`}
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1; gap:8px;">
                        <h3 style="font-size:15px; margin:0; color:#0f172a; font-weight:600; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.product_name || item.name || "Medical Equipment")}</h3>
                        <p style="color:#64748b; font-size:12px; margin:0; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.brand_name || item.category || item.vendor_name || item.company_name || "Supplier")}</p>
                        ${item.stock_status ? `<span style="font-size:11px; color:${item.stock_status === 'In Stock' ? '#16a34a' : '#ef4444'}; background:${item.stock_status === 'In Stock' ? '#f0fdf4' : '#fef2f2'}; padding:2px 8px; border-radius:20px; width:fit-content;">${escapeHtml(item.stock_status)}</span>` : ''}
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:8px; border-top:1px solid #f1f5f9;">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#64748b;">Price</span>
                                <span class="price" style="font-weight:700; color:#2563eb; font-size:18px;">${formatMoney(item.selling_price || item.price || item.rental_price || 1500)}</span>
                            </div>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(item.product_id || item.id)}" data-name="${escapeAttr(item.product_name || 'Equipment')}" data-brand="${escapeAttr(item.brand_name || item.vendor_name || '')}" data-price="${escapeAttr(item.selling_price || item.price || 1500)}" style="background:#2563eb; color:white; border:none; padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; font-size:13px;">
                                <i class="fa-solid fa-cart-plus" style="margin-right:4px;"></i>Add
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

# =================== INSURANCE CARD ===================
old_insurance = '''data.insurances.map(plan => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(plan.policy_name || plan.company_name || "Health Insurance")}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(plan.company_name || "Insurance Provider")}</p>
                        <div class="cardMeta" style="font-size:12px; color:#475569; margin-bottom:12px;">
                            <span><i class="fa-solid fa-shield-halved" style="color:#10b981;"></i> Cover: ${formatMoney(plan.coverage_amount || 500000)}</span>
                        </div>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(plan.premium_amount || 5000)}/yr</span>
                            <button class="btn btn-outline-blue btn-sm" type="button" data-action="buy-insurance" data-id="${escapeAttr(plan.id)}" data-name="${escapeAttr(plan.policy_name || 'Insurance')}" data-claim="${escapeAttr(plan.coverage_amount || 500000)}" data-price="${escapeAttr(plan.premium_amount || 5000)}" style="background:#10b981; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
                                Buy Plan
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

new_insurance = '''data.insurances.map(plan => `
                <article class="card productCard" style="background:white; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.10)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">
                    <div style="height: 130px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; position:relative; overflow:hidden;">
                        <div style="position:absolute; top:-20px; right:-20px; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.08);"></div>
                        <div style="position:absolute; bottom:-30px; left:-10px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.05);"></div>
                        <i class="fa-solid fa-shield-heart" style="font-size:36px; color:white; margin-bottom:6px;"></i>
                        <span style="color:rgba(255,255,255,0.9); font-size:12px; font-weight:600;">${escapeHtml(plan.comp_type || plan.policy_type || "Health Insurance")}</span>
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1; gap:10px;">
                        <h3 style="font-size:15px; margin:0; color:#0f172a; font-weight:700; line-height:1.4;">${escapeHtml(plan.comp_name || plan.policy_name || plan.company_name || "Health Insurance")}</h3>
                        <div style="display:flex; flex-direction:column; gap:6px; background:#f8fafc; padding:10px 12px; border-radius:8px; border:1px solid #f1f5f9;">
                            <div style="display:flex; justify-content:space-between; font-size:12px;">
                                <span style="color:#64748b;">Coverage</span>
                                <strong style="color:#0f172a;">${formatMoney(plan.coverage_amount || plan.claim_price || 500000)}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:12px;">
                                <span style="color:#64748b;">Claim Time</span>
                                <strong style="color:#0f172a;">${escapeHtml(plan.claim_time || plan.claim_approval_time || '24 Hours')}</strong>
                            </div>
                        </div>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                            <div>
                                <span style="font-size:11px; color:#64748b; display:block;">Annual Premium</span>
                                <span style="font-weight:700; color:#2563eb; font-size:18px;">${formatMoney(plan.premium_amount || plan.ins_price || 5000)}<span style="font-size:11px; color:#64748b; font-weight:400;">/yr</span></span>
                            </div>
                            <button type="button" data-action="buy-insurance" data-id="${escapeAttr(plan.id)}" data-name="${escapeAttr(plan.comp_name || plan.policy_name || 'Insurance')}" data-claim="${escapeAttr(plan.coverage_amount || plan.claim_price || 500000)}" data-price="${escapeAttr(plan.premium_amount || plan.ins_price || 5000)}" style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:white; border:none; padding:8px 14px; border-radius:8px; font-weight:600; cursor:pointer; font-size:13px;">
                                Buy Plan
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")'''

content = content.replace(old_medicine, new_medicine)
content = content.replace(old_equipment, new_equipment)
content = content.replace(old_insurance, new_insurance)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
