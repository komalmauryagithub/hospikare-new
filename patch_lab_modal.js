const fs = require('fs');
let html = fs.readFileSync('users.html', 'utf8');

const modalHtml = `
<!-- LAB DETAILS MODAL -->
<div class="modal" id="labDetailsModal">
    <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
            <h2 id="labDetailsTitle">Lab Details</h2>
            <button id="closeLabDetailsModal" class="close-modal"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" id="labDetailsBody" style="padding-top: 0;">
            <!-- Dynamically populated -->
        </div>
    </div>
</div>

<!-- LAB TEST BOOKING MODAL -->`;

html = html.replace('<!-- LAB TEST BOOKING MODAL -->', modalHtml);
fs.writeFileSync('users.html', html);
console.log('Added labDetailsModal to users.html');
