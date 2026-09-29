import re

with open('mdc.html', 'r', encoding='utf-8') as f:
    html = f.read()

vendor_details_html = """
          <div style="grid-column:1/-1; margin-top:10px;">
              <h4 style="margin:0; font-size:15px; color:var(--hk-text-main, #101828); border-bottom:1px dashed #cbd5e1; padding-bottom:6px;">Basic Information</h4>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Full Name <span style="color:red;">*</span></label>
              <input type="text" name="full_name" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Email Address <span style="color:red;">*</span></label>
              <input type="email" name="email_address" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Profile Photo <span style="color:red;">*</span></label>
              <input type="file" name="profile_photo" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          
          <div style="grid-column:1/-1; margin-top:10px;">
              <h4 style="margin:0; font-size:15px; color:var(--hk-text-main, #101828); border-bottom:1px dashed #cbd5e1; padding-bottom:6px;">Pharmacy Details</h4>
          </div>
"""

bank_details_html = """
          <div style="grid-column:1/-1; margin-top:10px;">
              <h4 style="margin:0; font-size:15px; color:var(--hk-text-main, #101828); border-bottom:1px dashed #cbd5e1; padding-bottom:6px;">Bank Account Details</h4>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Account Holder Name <span style="color:red;">*</span></label>
              <input type="text" name="account_holder_name" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Bank Name <span style="color:red;">*</span></label>
              <input type="text" name="bank_name" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Account Number <span style="color:red;">*</span></label>
              <input type="text" name="bank_account_number" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">IFSC Code <span style="color:red;">*</span></label>
              <input type="text" name="ifsc_code" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Cancelled Cheque / Bank Proof <span style="color:red;">*</span></label>
              <input type="file" name="cancelled_cheque_file" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          
          <div style="grid-column:1/-1; margin-top:10px;">
              <h4 style="margin:0; font-size:15px; color:var(--hk-text-main, #101828); border-bottom:1px dashed #cbd5e1; padding-bottom:6px;">Status</h4>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Profile Status <span style="color:red;">*</span></label>
              <select name="profile_status" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
              </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Verification Status <span style="color:red;">*</span></label>
              <select name="verification_status" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);">
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
              </select>
          </div>
"""

# Insert Vendor Basic details after the Pharmacy Selection Dropdown
js = re.sub(
    r"(<div style=\"grid-column:1/-1; display:flex; flex-direction:column; gap:8px;\">\s*<label[^>]*>Select Pharmacy to Complete Profile</label>\s*<select id=\"entitySelect\".*?</select>\s*</div>)",
    r"\1" + "\n" + vendor_details_html,
    html,
    flags=re.DOTALL
)

# Insert Bank Details and Status just before the Action Buttons
js = re.sub(
    r"(<div style=\"grid-column:1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:8px;\" id=\"profileModalActionButtons\">)",
    bank_details_html + "\n" + r"\1",
    js,
    flags=re.DOTALL
)

with open('mdc.html', 'w', encoding='utf-8') as f:
    f.write(js)
print("mdc.html updated with KYC details.")
