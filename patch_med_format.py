import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace medicineCard HTML structure
pattern_med = r'<article class="medicineCard">[\s\S]*?</article>'
replacement_med = '''<article class="medicineCard" style="display: flex; flex-direction: row; gap: 16px; align-items: center; padding: 16px; background: #ffffff; border-radius: 24px; box-shadow: 0 12px 36px -12px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer;">
    <div class="medicineImage" style="width: 110px; height: 110px; flex-shrink: 0; border-radius: 18px; overflow: hidden; background: #f8fafc; border: 1px solid #f1f5f9;">
        <img src="" alt="" onerror="this.src=''" style="width: 100%; height: 100%; object-fit: contain; padding: 12px; transition: transform 0.4s ease;">
    </div>
    <div class="medicineContent" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <div class="medicineCategory" style="font-size: 11px; color: #2563eb; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px; align-self: flex-start; margin-bottom: 6px;"></div>
        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.2;"></h3>
        <div class="medicineCompany" style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 12px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;"></div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="" data-name="" data-brand="" data-price="" style="background: #0f172a; color: white; border-radius: 14px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(15,23,42,0.2);">
                <i class="fa-solid fa-plus" style="font-size: 18px;"></i>
            </button>
        </div>
    </div>
</article>'''
content = re.sub(pattern_med, replacement_med, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated medicineCard format!")
