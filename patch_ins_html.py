import re

with open('ins.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add "Insurance Companies" menu item
new_menu = """
            <div class="menuItem" id="companiesBtn">
                <i class="fa-solid fa-building"></i>
                <span>Insurance Companies</span>
            </div>
            <div class="menuItem" id="plansBtn">
"""
html = re.sub(r'<div class="menuItem" id="plansBtn">', new_menu, html)

# 2. Add the Insurance Companies Section inside mainContainer
companies_section = """
          <!-- INSURANCE COMPANIES SECTION -->
          <div id="companiesSection" style="display:none; flex-direction:column; gap:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h2 style="font-family: var(--font-heading); font-size: 24px; font-weight: 700; color: var(--text-main);">Insurance Companies</h2>
                  <button id="addCompanyBtn" style="background:var(--primary, #2563eb); color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:600;"><i class="fa-solid fa-plus"></i> Add Company</button>
              </div>
              <div class="table-container">
                  <table class="hk-table">
                      <thead>
                          <tr>
                              <th>Company Name</th>
                              <th>Type</th>
                              <th>Contact Person</th>
                              <th>Mobile</th>
                              <th>Status</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="companiesTableBody">
                      </tbody>
                  </table>
              </div>
          </div>
"""
# Insert it after dashboardSection
html = re.sub(r'(<div id="plansSection".*?>)', companies_section + r'\1', html)

# 3. Add the Comprehensive Add/Edit Company Modal
company_modal = """
    <!-- ADD/EDIT INSURANCE COMPANY MODAL -->
    <div id="companyModal" class="modal-overlay" style="display:none;">
        <div id="companyModalBox" style="width: 800px; max-width: 95%;">
            <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="font-family: var(--font-heading);" id="companyModalTitle">Add Insurance Company</h2>
                <button onclick="document.getElementById('companyModal').style.display='none'" style="background: transparent; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="companyForm" enctype="multipart/form-data">
                <input type="hidden" name="company_id" id="company_id">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
                    
                    <h3 style="grid-column: span 2; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Basic Details</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Insurance Company Name <span style="color:red;">*</span></label>
                        <input type="text" name="company_name" class="top-search" style="border-radius: var(--rounded-sm);" required>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Company Type</label>
                        <input type="text" name="company_type" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Contact Person</label>
                        <input type="text" name="contact_person" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Mobile Number</label>
                        <input type="text" name="mobile_number" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Email</label>
                        <input type="email" name="email" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Website</label>
                        <input type="text" name="website" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px; grid-column: span 2;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Full Address</label>
                        <input type="text" name="full_address" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">City</label>
                        <input type="text" name="city" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">State</label>
                        <input type="text" name="state" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Pincode</label>
                        <input type="text" name="pincode" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>

                    <h3 style="grid-column: span 2; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Insurance Details</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Insurance/TPA Name</label>
                        <input type="text" name="insurance_tpa_name" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Policy Types</label>
                        <input type="text" name="policy_types" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Cashless Available</label>
                        <select name="cashless_available" class="top-search" style="border-radius: var(--rounded-sm);">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Claim Support</label>
                        <input type="text" name="claim_support" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Network Hospitals</label>
                        <input type="number" name="network_hospitals" class="top-search" style="border-radius: var(--rounded-sm);">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Status</label>
                        <select name="status" class="top-search" style="border-radius: var(--rounded-sm);">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Verification Status</label>
                        <select name="verification_status" class="top-search" style="border-radius: var(--rounded-sm);">
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <h3 style="grid-column: span 2; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Documents</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Company Registration Certificate</label>
                        <input type="file" name="company_registration_cert" style="font-size: 13px;">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">IRDAI Registration/License</label>
                        <input type="file" name="irdai_registration" style="font-size: 13px;">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Authorization/Agreement</label>
                        <input type="file" name="authorization_doc" style="font-size: 13px;">
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                    <button type="button" onclick="document.getElementById('companyModal').style.display='none'" style="padding: 10px 18px; border: 1px solid var(--border-color); background: var(--surface); border-radius: var(--rounded-md); cursor: pointer; color: var(--text-main); font-weight: 600;">Cancel</button>
                    <button type="submit" style="padding: 10px 24px; border: none; background: var(--primary); color: white; border-radius: var(--rounded-md); cursor: pointer; font-weight: 600;">Save</button>
                </div>
            </form>
        </div>
    </div>
"""
# Insert before insuranceModal
html = re.sub(r'(<!-- Modal for Adding Insurance -->)', company_modal + r'\n\1', html)

# 4. Modify existing addInsuranceModal to include Company Dropdown
new_company_dropdown = """
                    <h3 style="grid-column: span 2; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Link to Insurance Company</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; grid-column: span 2;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Select Company <span style="color:red;">*</span></label>
                        <select name="company_id" id="planCompanySelect" class="top-search" style="border-radius: var(--rounded-sm);" required>
                            <option value="">-- Select Company --</option>
                        </select>
                    </div>
"""
# We will inject this right after `<form id="insuranceForm" enctype="multipart/form-data"> <div style="...">`
html = re.sub(r'(<form id="insuranceForm".*?>\s*<div.*?>)', r'\1' + new_company_dropdown, html)

with open('ins.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("ins.html updated with insurance company modal and section.")
