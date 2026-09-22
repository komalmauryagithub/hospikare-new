const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');

// Store labs globally in users.js inside loadLabs
code = code.replace(
    'container.innerHTML = data.labs.map(lab => {',
    'window.hk_labsData = data.labs;\n            container.innerHTML = data.labs.map(lab => {'
);

// Change the button on the lab card
code = code.replace(
    '<button class="btn btn-primary" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test="${escapeAttr(lab.lab_name)}" data-price="${escapeAttr(lab.test_price || 500)}">Book</button>',
    '<button class="btn btn-primary" type="button" data-action="view-lab" data-id="${escapeAttr(lab.id)}">View Details</button>'
);

// Add the modal event listeners to wireCartAndModals or similar
const viewLabLogic = `
        // Lab Details View
        document.addEventListener("click", e => {
            if (e.target.closest('[data-action="view-lab"]')) {
                const btn = e.target.closest('[data-action="view-lab"]');
                const labId = btn.dataset.id;
                const lab = (window.hk_labsData || []).find(l => String(l.id) === String(labId));
                if (lab) {
                    $("#labDetailsTitle").textContent = lab.lab_name || "Lab Details";
                    
                    let testGrid = '<div style="margin-top: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">No tests listed.</div>';
                    if (lab.tests && lab.tests.length > 0) {
                        testGrid = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">' + 
                            lab.tests.map(t => \`<div style="background: #e0f2fe; color: #0369a1; padding: 8px 12px; border-radius: 6px; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-vial" style="opacity: 0.5;"></i> \${escapeHtml(t)}</div>\`).join('') +
                        '</div>';
                    }

                    $("#labDetailsBody").innerHTML = \`
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin: 0 0 5px 0; color: #0f172a; font-size: 16px;">\${escapeHtml(lab.lab_name)}</h4>
                            <p style="margin: 0; color: #475569; font-size: 14px;"><i class="fa-solid fa-location-dot" style="margin-right: 5px;"></i>\${escapeHtml(lab.address || "Location not specified")}</p>
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                            <span style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 13px; color: #334155;">
                                <i class="fa-solid fa-house-medical" style="margin-right: 4px;"></i> Home Collection: \${lab.home_coll === 'yes' ? 'Yes' : 'No'}
                            </span>
                            <span style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 13px; color: #334155;">
                                <i class="fa-solid fa-truck-fast" style="margin-right: 4px;"></i> Emergency: \${lab.emergency_test === 'yes' ? 'Available' : 'No'}
                            </span>
                        </div>
                        \${lab.description ? \`<p style="font-size: 14px; color: #475569; margin-bottom: 20px; line-height: 1.5;">\${escapeHtml(lab.description)}</p>\` : ''}
                        
                        <h4 style="margin: 0; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">Available Tests</h4>
                        \${testGrid}

                        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 12px; color: #64748b; display: block; text-transform: uppercase; font-weight: 600;">Test Price Starting at</span>
                                <span style="font-size: 20px; font-weight: 800; color: #0f172a;">\${formatMoney(lab.test_price || 500)}</span>
                            </div>
                            <button class="btn btn-primary" id="bookLabFromDetailsBtn" data-id="\${escapeAttr(lab.id)}" data-test="\${escapeAttr(lab.lab_name)}" data-price="\${escapeAttr(lab.test_price || 500)}">Proceed to Book</button>
                        </div>
                    \`;
                    $("#labDetailsModal").style.display = "flex";
                }
            }
        });

        document.getElementById("closeLabDetailsModal")?.addEventListener("click", () => {
            $("#labDetailsModal").style.display = "none";
        });
        
        document.addEventListener("click", e => {
            if (e.target.closest('#bookLabFromDetailsBtn')) {
                const btn = e.target.closest('#bookLabFromDetailsBtn');
                $("#labDetailsModal").style.display = "none";
                
                // Show booking modal
                $("#labBookingForm").reset();
                $("#labBookingModal").style.display = "flex";
                $("#labBookingForm").dataset.id = btn.dataset.id;
                $("#labBookingForm").dataset.test = btn.dataset.test;
                $("#labBookingForm").dataset.price = btn.dataset.price;
            }
        });
`;

if (!code.includes('labDetailsModal')) {
    code = code.replace('function wireCartAndModals() {', 'function wireCartAndModals() {\n' + viewLabLogic);
}

fs.writeFileSync('js/users.js', code);
console.log("Patched users.js with lab modal logic.");
