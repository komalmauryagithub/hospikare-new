const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const regex = /<!-- VENDOR PROFILE MODAL -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;

const newProfileModal = `<!-- VENDOR PROFILE MODAL -->
  <div id="profileModal" style="display:none; position:fixed; inset:0; background:rgba(7,26,61,0.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:999999; align-items:center; justify-content:center; padding:20px; overflow-y:auto;">
    <div style="width:min(720px, 100%); max-height:90vh; background:var(--card-bg, #fff); border-radius:16px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden; display:flex; flex-direction:column; border:1px solid var(--border-color, #e2e8f0);">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid var(--border-color, #e2e8f0); flex-shrink:0; background:var(--card-bg, #f8faff);">
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:700; font-family:var(--font-heading); color:var(--text-main, #0f172a);">Profile Details</h3>
          <p style="margin:4px 0 0; font-size:12.5px; color:var(--text-muted, #64748b);">Manage your ambulance vendor credentials and business details</p>
        </div>
        <button type="button" id="closeProfileModal" style="border:none; background:transparent; font-size:22px; cursor:pointer; color:var(--text-muted, #475569); line-height:1;" onclick="document.getElementById('profileModal').style.display='none'"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form id="vendorProfileForm" enctype="multipart/form-data" style="padding:24px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; overflow-y:auto; max-height:calc(90vh - 90px);">
          <input type="hidden" name="profileEntityType" id="profileEntityType" value="vendor_ambulance">
          
          <div style="grid-column:1/-1; margin-bottom: 4px;">
              <h4 style="margin:0; font-size:15px; font-weight:700; color:var(--text-main, #101828); border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 8px;">1. Vendor / Business Details</h4>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Ambulance Service / Company Name *</label>
              <input type="text" name="company_name" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Owner / Authorized Person Name *</label>
              <input type="text" name="name" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Business Registration Number (if applicable)</label>
              <input type="text" name="business_reg_number" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;">
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Contact Number *</label>
              <input type="text" name="contact_number" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Email *</label>
              <input type="email" name="email" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px; grid-column:span 2;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Business Address *</label>
              <input type="text" name="business_address" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Service Area / Cities Covered *</label>
              <input type="text" name="service_area" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">24×7 Service Available</label>
              <select name="service_24x7" class="top-search" style="border-radius:var(--rounded-sm); width:100%; box-sizing:border-box;">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
              </select>
          </div>

          <div style="grid-column:1/-1; margin-top:8px; margin-bottom: 4px;">
              <h4 style="margin:0; font-size:15px; font-weight:700; color:var(--text-main, #101828); border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 8px;">2. Vendor Documents (Upload)</h4>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Business / Service Registration Certificate *</label>
              <input type="file" name="business_reg_cert" style="font-size:13px; color:var(--text-main);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">PAN Card *</label>
              <input type="file" name="pan_card" style="font-size:13px; color:var(--text-main);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">GST Certificate (if applicable)</label>
              <input type="file" name="gst_cert" style="font-size:13px; color:var(--text-main);">
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Authorized Person ID Proof *</label>
              <input type="file" name="auth_person_id" style="font-size:13px; color:var(--text-main);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:13px; font-weight:600; color:var(--text-muted, #334155);">Address Proof *</label>
              <input type="file" name="vendor_address_proof" style="font-size:13px; color:var(--text-main);" required>
          </div>

          <div style="grid-column:1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:12px;" id="profileModalActionButtons">
              <button type="button" id="closeProfileBtn" class="btn-base" style="border:1px solid var(--border-color); background:transparent; color:var(--text-main); padding:8px 18px; border-radius:8px; cursor:pointer;" onclick="document.getElementById('profileModal').style.display='none'">Close</button>
              <button type="submit" id="saveProfileBtn" class="btn-base" style="background:var(--primary); color:white; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-weight:600;">Save Profile</button>
          </div>
      </form>
    </div>
  </div>`;

ambHtml = ambHtml.replace(regex, newProfileModal);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Successfully updated vendor profile modal in amb.html');
