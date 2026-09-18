const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

const regex = /<form id="vendorProfileForm"[\s\S]*?<\/form>/;

const newForm = `<form id="vendorProfileForm" enctype="multipart/form-data" style="padding:24px 26px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; overflow-y:auto; max-height:calc(90vh - 92px);">
          <input type="hidden" id="profileEntityType" value="vendor_ambulance">
          
          <div style="grid-column:1/-1; margin-bottom: 8px;">
              <h4 style="margin:0; font-size:16px; color:var(--hk-text-main, #101828); border-bottom: 1px solid var(--hk-border); padding-bottom: 8px;">1. Vendor / Business Details</h4>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Ambulance Service / Company Name</label>
              <input type="text" name="company_name" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Owner / Authorized Person Name</label>
              <input type="text" name="name" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Business Registration Number (if applicable)</label>
              <input type="text" name="business_reg_number" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);">
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Contact Number</label>
              <input type="text" name="contact_number" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Email</label>
              <input type="email" name="email" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; grid-column: span 2;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Business Address</label>
              <input type="text" name="business_address" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Service Area / Cities Covered</label>
              <input type="text" name="service_area" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">24×7 Service Available</label>
              <select name="service_24x7" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
              </select>
          </div>

          <div style="grid-column:1/-1; margin-top:10px; margin-bottom: 8px;">
              <h4 style="margin:0; font-size:16px; color:var(--hk-text-main, #101828); border-bottom: 1px solid var(--hk-border); padding-bottom: 8px;">2. Vendor Documents (Upload)</h4>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Business / Service Registration Certificate</label>
              <input type="file" name="business_reg_cert" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">PAN Card</label>
              <input type="file" name="pan_card" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">GST Certificate (if applicable)</label>
              <input type="file" name="gst_cert" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);">
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Authorized Person ID Proof</label>
              <input type="file" name="auth_person_id" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="font-size:13px; font-weight:600; color:var(--hk-text-main, #334155);">Address Proof</label>
              <input type="file" name="vendor_address_proof" style="padding:10px 12px; border:1px solid var(--hk-border, #cbd5e1); border-radius:10px; background:var(--hk-surface, #fff); color:var(--hk-text-main, #101828);" required>
          </div>

          <div style="grid-column:1 / -1; display:flex; justify-content:flex-end; gap:12px; margin-top:8px;" id="profileModalActionButtons">
              <button type="button" id="closeProfileBtn" style="padding:10px 18px; border:1px solid var(--hk-border, #cbd5e1); background:var(--hk-surface, #fff); border-radius:10px; cursor:pointer; color:var(--hk-text-main, #101828); font-weight:600;" onclick="document.getElementById('profileModalBox').style.display='none'">Close</button>
              <button type="submit" id="saveProfileBtn" style="padding:10px 18px; border:none; background:var(--hk-primary-blue, #2563eb); color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Save Profile</button>
          </div>
      </form>`;

ambHtml = ambHtml.replace(regex, newForm);
fs.writeFileSync('amb.html', ambHtml, 'utf8');
console.log('Replaced vendorProfileForm in amb.html');
