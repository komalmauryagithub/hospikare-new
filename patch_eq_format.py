import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_eq = r'<article class="equipmentCard">[\s\S]*?</article>'
replacement_eq = '''<article class="equipmentCard" style="display: flex; flex-direction: row; gap: 16px; align-items: center; padding: 16px; background: #ffffff; border-radius: 24px; box-shadow: 0 12px 36px -12px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer;">
    <div class="equipmentImage" style="width: 120px; height: 120px; flex-shrink: 0; border-radius: 18px; overflow: hidden; background: #f8fafc; border: 1px solid #f1f5f9; position: relative;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; padding: 12px; transition: transform 0.4s ease;">
    </div>
    <div class="equipmentContent" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <div style="display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
            <div class="equipmentCategory" style="font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
            ${equipment.status === "Available" ? `<div style="font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
        </div>
        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.2;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 12px;">${escapeHtml(brand)}</div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(price)}</div>
            <div style="display: flex; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 14px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="background: #0f172a; color: white; border-radius: 14px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(15,23,42,0.2);">
                    <i class="fa-solid fa-cart-shopping" style="font-size: 16px;"></i>
                </button>
            </div>
        </div>
    </div>
</article>'''
content = re.sub(pattern_eq, replacement_eq, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated equipmentCard format!")
