const fs = require('fs');
let content = fs.readFileSync('amb.html', 'utf8');

const driverMenu = `
          <div class="menuItem" id="driversBtn" data-section="drivers">
              <i class="fa-solid fa-id-card"></i>
              <span>Drivers</span>
          </div>`;

content = content.replace('<div class="menuItem" id="ambulancesBtn" data-section="ambulances">', driverMenu + '\n          <div class="menuItem" id="ambulancesBtn" data-section="ambulances">');

const driversSection = `
        <!-- ================= DRIVERS ================= -->
        <div id="driversSection" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight: 700; color: var(--text-dark);">Drivers</h2>
                <div style="display: flex; gap: 12px;">
                    <button id="addDriverSectionBtn" class="btn-base" style="background-color: var(--primary); color: white; padding: 10px 16px; border-radius: 8px;">
                        <i class="fa-solid fa-plus"></i> Add Driver
                    </button>
                </div>
            </div>
            
            <div class="modern-card">
                <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 15px; font-weight: 600; color: var(--text-dark); margin: 0;">Driver Directory</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Name & ID</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="driversTableBody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
`;

content = content.replace('<!-- ================= DASHBOARD ================= -->', driversSection + '\n        <!-- ================= DASHBOARD ================= -->');

fs.writeFileSync('amb.html', content, 'utf8');
console.log('Modified amb.html');
