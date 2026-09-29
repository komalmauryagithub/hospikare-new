import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_eq = r'<article class="equipmentCard".*?>[\s\S]*?</article>'
replacement_eq = '''<article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>'''
content = re.sub(pattern_eq, replacement_eq, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated equipmentCard vertical format!")
