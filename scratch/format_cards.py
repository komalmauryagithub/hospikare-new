import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# --- MEDICINES ---
old_medicine = '''            container.innerHTML = data.medicines.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:12px;">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(item.product_name || item.medicine_name || 'Medicine')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(item.category || item.generic_name || '')}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(item.selling_price || item.price)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="medicine" data-id="${item.medicine_id || item.id}" data-name="${escapeHtml(item.product_name || item.medicine_name)}" data-price="${item.selling_price || item.price}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

new_medicine = '''            container.innerHTML = data.medicines.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="height: 160px; background: #f8fafc; display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #e2e8f0;">
                        ${item.medicine_image 
                            ? `<img src="/uploads/${item.medicine_image}" alt="${escapeHtml(item.medicine_name)}" style="width:100%; height:100%; object-fit:contain; padding: 12px;">` 
                            : `<i class="fa-solid fa-pills" style="font-size:48px; color:#94a3b8;"></i>`}
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1;">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a; font-weight:600; line-height:1.4;">${escapeHtml(item.product_name || item.medicine_name || 'Medicine')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 16px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.category || item.generic_name || '')}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                            <span class="price" style="font-weight:700; color:#2563eb; font-size:18px;">${formatMoney(item.selling_price || item.price)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="medicine" data-id="${item.medicine_id || item.id}" data-name="${escapeHtml(item.product_name || item.medicine_name)}" data-price="${item.selling_price || item.price}" style="border-radius:6px; font-weight:600; padding:6px 12px;">
                                <i class="fa-solid fa-cart-plus" style="margin-right:6px;"></i> Add
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

content = content.replace(old_medicine, new_medicine)


# --- EQUIPMENTS ---
old_equipment = '''            container.innerHTML = data.equipments.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:12px;">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(item.product_name || 'Equipment')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(item.category || '')}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(item.selling_price || item.price)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="equipment" data-id="${item.product_id || item.id}" data-name="${escapeHtml(item.product_name)}" data-price="${item.selling_price || item.price}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

new_equipment = '''            container.innerHTML = data.equipments.map(item => `
                <article class="card productCard" style="background:white; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="height: 160px; background: #f8fafc; display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #e2e8f0;">
                        ${item.thumbnail_image 
                            ? `<img src="/uploads/${item.thumbnail_image}" alt="${escapeHtml(item.product_name)}" style="width:100%; height:100%; object-fit:contain; padding: 12px;">` 
                            : `<i class="fa-solid fa-stethoscope" style="font-size:48px; color:#94a3b8;"></i>`}
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1;">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a; font-weight:600; line-height:1.4;">${escapeHtml(item.product_name || 'Equipment')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 16px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.category || item.brand_name || '')}</p>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                            <span class="price" style="font-weight:700; color:#2563eb; font-size:18px;">${formatMoney(item.selling_price || item.price)}</span>
                            <button class="btn btn-primary btn-sm" type="button" data-action="add-cart" data-type="equipment" data-id="${item.product_id || item.id}" data-name="${escapeHtml(item.product_name)}" data-price="${item.selling_price || item.price}" style="border-radius:6px; font-weight:600; padding:6px 12px;">
                                <i class="fa-solid fa-cart-plus" style="margin-right:6px;"></i> Add
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

content = content.replace(old_equipment, new_equipment)

# --- INSURANCES ---
old_insurance = '''            container.innerHTML = data.insurances.map(plan => `
                <article class="card productCard" style="background:white; border-radius:12px; padding:16px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:12px;">
                    <div class="cardContent">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a;">${escapeHtml(plan.policy_name || plan.comp_name || 'Insurance Plan')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 12px 0;">${escapeHtml(plan.policy_type || plan.comp_type || '')}</p>
                        <div class="cardMeta" style="font-size:12px; color:#475569; margin-bottom:12px;">
                            <span><i class="fa-solid fa-shield-halved" style="color:#10b981;"></i> Cover: ${formatMoney(plan.coverage_amount || 500000)}</span>
                        </div>
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="price" style="font-weight:700; color:#0f172a; font-size:15px;">${formatMoney(plan.premium_amount || plan.ins_price || 5000)}/yr</span>
                            <button class="btn btn-outline-blue btn-sm" type="button" data-action="buy-insurance" data-id="${plan.id}" data-name="${escapeHtml(plan.policy_name || plan.comp_name)}" data-price="${plan.premium_amount || plan.ins_price || 5000}">
                                Buy Plan
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

new_insurance = '''            container.innerHTML = data.insurances.map(plan => `
                <article class="card productCard" style="background:white; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; display:flex; flex-direction:column; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;">
                    <div style="height: 120px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); display:flex; align-items:center; justify-content:center; border-bottom: 1px solid #bfdbfe;">
                        <i class="fa-solid fa-shield-heart" style="font-size:48px; color:#3b82f6;"></i>
                    </div>
                    <div class="cardContent" style="padding:16px; display:flex; flex-direction:column; flex:1;">
                        <h3 style="font-size:16px; margin:0 0 6px 0; color:#0f172a; font-weight:600;">${escapeHtml(plan.policy_name || plan.comp_name || 'Insurance Plan')}</h3>
                        <p class="cardSubtitle" style="color:#64748b; font-size:13px; margin:0 0 16px 0;">${escapeHtml(plan.policy_type || plan.comp_type || '')}</p>
                        
                        <div class="cardMeta" style="font-size:13px; color:#475569; margin-bottom:16px; display:flex; flex-direction:column; gap:6px; background:#f8fafc; padding:10px; border-radius:8px;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748b;">Coverage:</span>
                                <strong style="color:#0f172a;">${formatMoney(plan.coverage_amount || 500000)}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748b;">Claim Time:</span>
                                <strong style="color:#0f172a;">${escapeHtml(plan.claim_time || '24 Hours')}</strong>
                            </div>
                        </div>
                        
                        <div class="cardBottom" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#64748b;">Premium</span>
                                <span class="price" style="font-weight:700; color:#2563eb; font-size:18px;">${formatMoney(plan.premium_amount || plan.ins_price || 5000)}<span style="font-size:12px; font-weight:500; color:#64748b;">/yr</span></span>
                            </div>
                            <button class="btn btn-primary btn-sm" type="button" data-action="buy-insurance" data-id="${plan.id}" data-name="${escapeHtml(plan.policy_name || plan.comp_name)}" data-price="${plan.premium_amount || plan.ins_price || 5000}" style="border-radius:6px; font-weight:600; padding:6px 12px;">
                                Buy Plan
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");'''

content = content.replace(old_insurance, new_insurance)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
