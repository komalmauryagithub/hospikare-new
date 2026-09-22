const fs = require("fs");
let code = fs.readFileSync("js/users.js", "utf8");

// Helper to replace the map arrow function contents for a specific function block
function replaceCardTemplate(fnName, newTemplate) {
    const fnRegex = new RegExp(`(async function ${fnName}\\(\\) \\{[\\s\\S]*?container\\.innerHTML = data\\.[a-zA-Z]+\\.map\\([a-zA-Z]+ => \\\`)([\\s\\S]*?)(?=\\\`\\)\\.join\\(\\"\\"\\);)`, "g");
    
    code = code.replace(fnRegex, (match, p1) => {
        return p1 + "\n" + newTemplate + "\n                ";
    });
}

// 1. Medicines
const medTemplate = `
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; background: #f8fafc; align-items: center; justify-content: center;">
                        \${item.medicine_image || item.image
                            ? \`<img src="\${(item.medicine_image || item.image).startsWith('http') || (item.medicine_image || item.image).startsWith('/') ? (item.medicine_image || item.image) : '/uploads/' + (item.medicine_image || item.image)}" alt="\${escapeHtml(item.medicine_name || 'Medicine')}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: contain; scroll-snap-align: start; padding: 16px;">\`
                            : \`<i class="fa-solid fa-pills" style="font-size: 64px; color: #cbd5e1;"></i>\`}
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">\${escapeHtml(item.medicine_name || item.product_name || item.name || "Medicine")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-building"></i>
                            <span>\${escapeHtml(item.brand_name || item.pharmacy_name || "Pharmacy")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            \${item.generic_name ? \`<span style="background: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(item.generic_name)}</span>\` : ''}
                            \${item.category ? \`<span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(item.category)}</span>\` : ''}
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="font-weight: 800; font-size: 16px; color: #0f172a;">
                                \${formatMoney(item.price)}
                            </div>
                            <button class="btn btn-primary" type="button" data-cart-action="add" data-id="\${escapeAttr(item.id)}" data-type="medicine" data-name="\${escapeAttr(item.medicine_name || item.product_name || item.name)}" data-price="\${escapeAttr(item.price)}" data-brand="\${escapeAttr(item.brand_name || item.pharmacy_name || 'Pharmacy')}">Add</button>
                        </div>
                    </div>
                </article>`;
replaceCardTemplate("loadMedicines", medTemplate);

// 2. Equipments
const equipTemplate = `
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; background: #f8fafc; align-items: center; justify-content: center;">
                        \${item.image
                            ? \`<img src="\${(item.image).startsWith('http') || (item.image).startsWith('/') ? item.image : '/uploads/' + item.image}" alt="\${escapeHtml(item.product_name || 'Equipment')}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: contain; scroll-snap-align: start; padding: 16px;">\`
                            : \`<i class="fa-solid fa-wheelchair" style="font-size: 64px; color: #cbd5e1;"></i>\`}
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">\${escapeHtml(item.product_name || "Equipment")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-store"></i>
                            <span>\${escapeHtml(item.vendor_name || "Vendor")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            \${item.category ? \`<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(item.category)}</span>\` : ''}
                            \${item.sub_category ? \`<span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(item.sub_category)}</span>\` : ''}
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="font-weight: 800; font-size: 16px; color: #0f172a;">
                                \${formatMoney(item.price)}
                            </div>
                            <button class="btn btn-primary" type="button" data-cart-action="add" data-id="\${escapeAttr(item.id)}" data-type="equipment" data-name="\${escapeAttr(item.product_name)}" data-price="\${escapeAttr(item.price)}" data-brand="\${escapeAttr(item.vendor_name || 'Vendor')}">Add</button>
                        </div>
                    </div>
                </article>`;
replaceCardTemplate("loadEquipments", equipTemplate);

// 3. Insurances
const insTemplate = `
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); align-items: center; justify-content: center;">
                        <i class="fa-solid fa-shield-heart" style="font-size: 64px; color: #a855f7;"></i>
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">\${escapeHtml(plan.plan_name || plan.policy_name || "Insurance Plan")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-building-shield"></i>
                            <span>\${escapeHtml(plan.comp_name || "Provider")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            \${plan.duration ? \`<span style="background: #f3e8ff; color: #9333ea; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(plan.duration)}</span>\` : ''}
                            \${plan.coverage_amount ? \`<span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px;">Cov: \${formatMoney(plan.coverage_amount)}</span>\` : ''}
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="display: flex; flex-direction: column;">
                                <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Premium</span>
                                <span style="font-weight: 800; color: #0f172a; font-size: 16px;">\${formatMoney(plan.ins_price || plan.premium_amount || 0)}</span>
                            </div>
                            <button class="btn btn-primary" style="background: #9333ea;" type="button" data-action="buy-insurance" data-id="\${escapeAttr(plan.id)}" data-plan="\${escapeAttr(plan.plan_name)}" data-price="\${escapeAttr(plan.ins_price)}">Buy</button>
                        </div>
                    </div>
                </article>`;
replaceCardTemplate("loadInsurances", insTemplate);

// 4. Labs
const labTemplate = `
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; background: linear-gradient(135deg, #e0f2fe, #bae6fd); align-items: center; justify-content: center;">
                        <i class="fa-solid fa-microscope" style="font-size: 64px; color: #0284c7;"></i>
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">\${escapeHtml(lab.test_name || lab.lab_name || "Lab Test")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-hospital-user"></i>
                            <span>\${escapeHtml(lab.lab_name || "Diagnostic Center")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            \${lab.test_type ? \`<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">\${escapeHtml(lab.test_type)}</span>\` : ''}
                            \${lab.sample_type ? \`<span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px;">Sample: \${escapeHtml(lab.sample_type)}</span>\` : ''}
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="display: flex; flex-direction: column;">
                                <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Price</span>
                                <span style="font-weight: 800; color: #0f172a; font-size: 16px;">\${formatMoney(lab.price || lab.base_chrge || 500)}</span>
                            </div>
                            <button class="btn btn-primary" type="button" data-action="book-lab" data-id="\${escapeAttr(lab.id)}" data-test="\${escapeAttr(lab.test_name)}" data-price="\${escapeAttr(lab.price || lab.base_chrge || 500)}">Book</button>
                        </div>
                    </div>
                </article>`;
replaceCardTemplate("loadLabs", labTemplate);

fs.writeFileSync("js/users.js", code, "utf8");
console.log("Unified the card styles to featuredHospitalCard.");
