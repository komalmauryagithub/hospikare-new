import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern_lab = r'<article class="labCard">[\s\S]*?</article>'
replacement_lab = '''<article class="labCard" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 20px; background: #ffffff; border-radius: 20px; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s ease;">
    <div style="display: flex; gap: 16px; align-items: center; min-width: 0;">
        <div style="width: 56px; height: 56px; border-radius: 14px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            <i class="fa-solid fa-microscope"></i>
        </div>
        <div class="labLeft" style="min-width: 0; display: flex; flex-direction: column; gap: 4px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(lab.lab_name || "Diagnostic Lab")}</h3>
            <div style="font-size: 13px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-location-dot" style="color: #94a3b8;"></i> ${escapeHtml(lab.address || "Local")}
            </div>
            <div style="font-size: 13px; color: #2563eb; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-vial"></i> ${escapeHtml(testName)}
            </div>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
        <div class="labPrice" style="font-size: 20px; font-weight: 900; color: #0f172a;">${formatMoney(lab.test_price || 0)}</div>
        <button class="bookLabBtn" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test-name="${escapeAttr(testName)}" data-amount="${escapeAttr(lab.test_price || 0)}" style="background: #1e40af; color: white; border-radius: 10px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;">
            Book Test
        </button>
    </div>
</article>'''
content = re.sub(pattern_lab, replacement_lab, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated labCard format!")
