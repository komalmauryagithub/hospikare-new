import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the old editRequestHtml block which starts at "let editRequestHtml = '';" and ends before "const html = `"
replacement = """                let editRequestHtml = '';
                const isUserEditReq = Boolean(user.edit_requested);
                const isDetailEditReq = Boolean(details && details.edit_requested);
                const isUserEditAllowed = Boolean(user.edit_allowed);
                const isDetailEditAllowed = Boolean(details && details.edit_allowed);
                
                const hasEditReq = isUserEditReq || isDetailEditReq;
                const hasEditAllowed = isUserEditAllowed || isDetailEditAllowed;
                
                const approveEntityType = isUserEditReq ? 'user' : normalizedEntityType;
                const approveEntityId = isUserEditReq ? user.id : (details ? details.id : user.id);

                if (hasEditReq) {
                    editRequestHtml = `
                        <div class="admin-edit-request-card" style="margin-bottom:20px; background:#fff8f1; border-left:4px solid #D97706; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div class="admin-edit-request-icon-box" style="background: rgba(217,119,6,0.15); color: #D97706; padding: 8px 12px; border-radius: 8px;">
                                    <i class="fa-solid fa-unlock-keyhole" style="font-size: 18px;"></i>
                                </div>
                                <div>
                                    <h4 class="admin-edit-request-title" style="margin:0 0 4px 0; color:#b45309;">Profile Edit Permission Requested</h4>
                                    <p class="admin-edit-request-desc" style="margin:0; font-size:13px; color:#78350f;">Vendor has requested permission to modify and update their profile details & documents.</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button type="button" style="padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; background: #059669; color: #fff; border: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(5,150,105,0.25);" onclick="approveVendorProfileEdit('${approveEntityType}', ${approveEntityId}, ${user.id})">
                                    <i class="fa-solid fa-check"></i> Approve Edit
                                </button>
                                <button type="button" style="padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; background: #DC2626; color: #fff; border: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;" onclick="rejectVendorProfileEdit('${approveEntityType}', ${approveEntityId}, ${user.id})">
                                    <i class="fa-solid fa-xmark"></i> Reject Request
                                </button>
                            </div>
                        </div>
                    `;
                } else if (hasEditAllowed) {
                    const revokeEntityType = isUserEditAllowed ? 'user' : normalizedEntityType;
                    const revokeEntityId = isUserEditAllowed ? user.id : (details ? details.id : user.id);
                    editRequestHtml = `
                        <div class="admin-edit-request-card" style="margin-bottom:20px; border-left:4px solid #059669; background: #f0fdf4; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="admin-edit-request-icon-box" style="background: #059669; color: #fff; padding: 6px 8px; border-radius: 6px;">
                                    <i class="fa-solid fa-lock-open" style="font-size: 14px;"></i>
                                </div>
                                <div>
                                    <h4 class="admin-edit-allowed-title" style="margin: 0; color:#065f46;">Edit Permission Currently Active</h4>
                                    <p class="admin-edit-allowed-desc" style="margin: 4px 0 0 0; font-size:13px; color:#064e3b;">Vendor is granted access to modify profile details.</p>
                                </div>
                            </div>
                            <button type="button" style="padding: 7px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer; background: #E11D48; color: #fff; border: none; border-radius: 6px;" onclick="revokeVendorProfileEdit('${revokeEntityType}', ${revokeEntityId}, ${user.id})">
                                Revoke Edit Access
                            </button>
                        </div>
                    `;
                }

                const html = `"""

js = re.sub(
    r"let editRequestHtml = '';.*?const html = `", 
    replacement, 
    js, 
    flags=re.DOTALL
)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated admin.js to handle user table edit requests correctly")
