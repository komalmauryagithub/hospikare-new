const fs = require('fs');
let code = fs.readFileSync('js/lt.js', 'utf8');
const viewFn = `
window.viewLabVendorDetails = function(labId) {
    const lab = (window.hk_vendorLabs || []).find(l => l.id == labId);
    if (!lab) return;
    
    const titleEl = document.getElementById("vendorLabDetailsTitle");
    if(titleEl) titleEl.textContent = lab.lab_name || "Lab Details";
    
    let tests = [];
    try { tests = JSON.parse(lab.test || "[]"); } catch(e) {}
    
    let testGrid = '<div style="margin-top: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">No tests listed.</div>';
    if (tests && tests.length > 0) {
        testGrid = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">' + 
            tests.map(t => \`<div style="background: #e0f2fe; color: #0369a1; padding: 8px 12px; border-radius: 6px; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-vial" style="opacity: 0.5;"></i> \${t}</div>\`).join('') +
        '</div>';
    }

    const bodyEl = document.getElementById("vendorLabDetailsBody");
    if(bodyEl) {
        bodyEl.innerHTML = \`
            <div style="margin-bottom: 15px;">
                <p style="margin: 0; color: #475569; font-size: 14px;"><i class="fa-solid fa-location-dot" style="margin-right: 5px;"></i>\${lab.address || "N/A"}</p>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <span style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 13px; color: #334155;">
                    Home Collection: \${lab.home_coll}
                </span>
                <span style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 13px; color: #334155;">
                    Emergency: \${lab.emergency_test}
                </span>
            </div>
            <h4 style="margin: 0; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">Available Tests</h4>
            \${testGrid}
        \`;
    }
    const modal = document.getElementById("vendorLabDetailsModal");
    if(modal) modal.style.display = "flex";
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closeVendorLabDetailsModal")?.addEventListener("click", () => {
        const m = document.getElementById("vendorLabDetailsModal");
        if(m) m.style.display = "none";
    });
});
`;
if (!code.includes('window.viewLabVendorDetails = function')) {
    fs.appendFileSync('js/lt.js', '\n' + viewFn);
    console.log('Appended viewLabVendorDetails');
} else {
    console.log('Already there');
}
