import re

with open('js/lt.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace vendorProfileForm lock UI
vendor_lock_pattern = r"""\s*let statusHtml = '';\s*if \(!isRequested\) \{.*?\}\s*bannerContainer\.innerHTML = statusHtml;\s*if \(actionBtns\) \{\s*actionBtns\.innerHTML = `<button type="button" onclick="closeProfileModal\(\)" style="[^"]*">Close</button>`;\s*\}"""

vendor_lock_replacement = """
        bannerContainer.innerHTML = '';
        if (actionBtns) {
            if (!isRequested) {
                actionBtns.innerHTML = `
                    <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                    <button type="button" id="reqAdminBtn" style="padding:10px 18px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Request Admin Edit</button>
                `;
                document.getElementById('reqAdminBtn').onclick = () => requestVendorProfileEdit(profile.id);
            } else {
                actionBtns.innerHTML = `
                    <button type="button" onclick="closeProfileModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                    <button type="button" disabled style="padding:10px 18px; border:none; background:#9ca3af; color:#fff; border-radius:10px; cursor:not-allowed; font-weight:600;">Edit Requested...</button>
                `;
            }
        }
"""

js = re.sub(vendor_lock_pattern, vendor_lock_replacement, js, flags=re.DOTALL)

# Replace labEntityForm lock UI
lab_lock_pattern = r"""\s*let statusHtml = '';\s*if \(!isRequested\) \{.*?\}\s*bannerContainer\.innerHTML = statusHtml;\s*if \(actionBtns\) \{\s*actionBtns\.innerHTML = `<button type="button" onclick="closeLabEntityModal\(\)" style="[^"]*">Close</button>`;\s*\}"""

lab_lock_replacement = """
                          bannerContainer.innerHTML = '';
                          if (actionBtns) {
                              if (!isRequested) {
                                  actionBtns.innerHTML = `
                                      <button type="button" onclick="closeLabEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                                      <button type="button" id="reqLabAdminBtn" style="padding:10px 18px; border:none; background:#d97706; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Request Admin Edit</button>
                                  `;
                                  document.getElementById('reqLabAdminBtn').onclick = () => requestLabEntityEdit(id);
                              } else {
                                  actionBtns.innerHTML = `
                                      <button type="button" onclick="closeLabEntityModal()" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;">Close</button>
                                      <button type="button" disabled style="padding:10px 18px; border:none; background:#9ca3af; color:#fff; border-radius:10px; cursor:not-allowed; font-weight:600;">Edit Requested...</button>
                                  `;
                              }
                          }
"""

js = re.sub(lab_lock_pattern, lab_lock_replacement, js, flags=re.DOTALL)

with open('js/lt.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched lt.js UI")
