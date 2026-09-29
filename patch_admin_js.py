import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify the editRequestHtml condition and logic
target = """                let editRequestHtml = '';
                if (details && details.edit_requested) {
                    editRequestHtml = `
                        <div class="admin-edit-request-card">
                            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                                <div class="admin-edit-request-icon-box" style="background: rgba(217,119,6,0.15); color: #D97706; padding: 8px; border-radius: 8px;">
                                    <i class="fa-solid fa-unlock-keyhole" style="font-size: 18px;"></i>
                                </div>
                                <div>
                                    <h4 class="admin-edit-request-title">Profile Edit Permission Requested</h4>
                                    <p class="admin-edit-request-desc">Vendor has requested permission to modify and update their profile details & documents.</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button type="button" style="padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; background: #059669; color: #fff; border: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(5,150,105,0.25);" onclick="approveVendorProfileEdit('${normalizedEntityType}', ${details.id}, ${user.id})">
                                    <i class="fa-solid fa-check"></i> Approve Edit
                                </button>
                                <button type="button" style="padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; background: #DC2626; color: #fff; border: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;" onclick="rejectVendorProfileEdit('${normalizedEntityType}', ${details.id}, ${user.id})">
                                    <i class="fa-solid fa-xmark"></i> Reject Request
                                </button>
                            </div>
                        </div>
                    `;
                } else if (details && details.edit_allowed) {
                    editRequestHtml = `
                        <div class="admin-edit-request-card" style="border-left-color: #059669; background: #f0fdf4;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="admin-edit-request-icon-box" style="background: #059669; color: #fff; padding: 6px 8px; border-radius: 6px;">
                                        <i class="fa-solid fa-lock-open" style="font-size: 14px;"></i>
                                    </div>
                                    <div>
                                        <h4 class="admin-edit-allowed-title" style="margin: 0;">Edit Permission Currently Active</h4>
                                        <p class="admin-edit-allowed-desc">Vendor is granted access to modify profile details.</p>
                                    </div>
                                </div>
                                <button type="button" style="padding: 7px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer; background: #E11D48; color: #fff; border: none; border-radius: 6px;" onclick="revokeVendorProfileEdit('${normalizedEntityType}', ${details.id}, ${user.id})">
                                    Revoke Edit Access
                                </button>
                            </div>
                        </div>
                    `;
                }"""

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
                        <div class="admin-edit-request-card">
                            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                                <div class="admin-edit-request-icon-box" style="background: rgba(217,119,6,0.15); color: #D97706; padding: 8px; border-radius: 8px;">
                                    <i class="fa-solid fa-unlock-keyhole" style="font-size: 18px;"></i>
                                </div>
                                <div>
                                    <h4 class="admin-edit-request-title">Profile Edit Permission Requested</h4>
                                    <p class="admin-edit-request-desc">Vendor has requested permission to modify and update their profile details & documents.</p>
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
                        <div class="admin-edit-request-card" style="border-left-color: #059669; background: #f0fdf4;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="admin-edit-request-icon-box" style="background: #059669; color: #fff; padding: 6px 8px; border-radius: 6px;">
                                        <i class="fa-solid fa-lock-open" style="font-size: 14px;"></i>
                                    </div>
                                    <div>
                                        <h4 class="admin-edit-allowed-title" style="margin: 0;">Edit Permission Currently Active</h4>
                                        <p class="admin-edit-allowed-desc">Vendor is granted access to modify profile details.</p>
                                    </div>
                                </div>
                                <button type="button" style="padding: 7px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer; background: #E11D48; color: #fff; border: none; border-radius: 6px;" onclick="revokeVendorProfileEdit('${revokeEntityType}', ${revokeEntityId}, ${user.id})">
                                    Revoke Edit Access
                                </button>
                            </div>
                        </div>
                    `;
                }"""

js = js.replace(target, replacement)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated admin.js to handle user table edit requests")
