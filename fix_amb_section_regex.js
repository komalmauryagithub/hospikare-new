const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// Hide driversSection
ambJs = ambJs.replace(
    /document\.getElementById\("paymentsSection"\)\.style\.display = "none";/,
    'document.getElementById("paymentsSection").style.display = "none";\n    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";'
);

// Show driversSection
ambJs = ambJs.replace(
    /else if\s*\(\s*section === "payments"\s*\)\s*\{\s*document\.getElementById\("paymentsSection"\)\.style\.display = "block";\s*loadPayments\(\);\s*\}/,
    `else if (section === "payments") {
        document.getElementById("paymentsSection").style.display = "block";
        loadPayments();
    }
    else if (section === "drivers") {
        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";
        loadDrivers();
    }`
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed driversSection display toggle using regex');
