const fs = require('fs');
let html = fs.readFileSync('lt.html', 'utf8');

const modalHtml = `
<!-- VENDOR LAB DETAILS MODAL -->
<div class="modal" id="vendorLabDetailsModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); z-index: 10050; align-items: center; justify-content: center; padding: 20px;">
    <div class="modal-content" style="max-width: 600px; background: white; padding: 20px; border-radius: 8px;">
        <div class="modal-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <h2 id="vendorLabDetailsTitle" style="margin: 0; color: #0f172a; font-size: 20px;">Lab Details</h2>
            <button id="closeVendorLabDetailsModal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" id="vendorLabDetailsBody" style="padding-top: 0;">
            <!-- Dynamically populated -->
        </div>
    </div>
</div>

<!-- Add Booking Modal -->`;

html = html.replace('<!-- Add Booking Modal -->', modalHtml);
fs.writeFileSync('lt.html', html);
console.log('Added vendorLabDetailsModal to lt.html');
