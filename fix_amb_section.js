const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

// Add driversSection to hide list
ambJs = ambJs.replace(
    'document.getElementById("paymentsSection").style.display = "none";',
    'document.getElementById("paymentsSection").style.display = "none";\n    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";'
);

// Add driversSection to show list
ambJs = ambJs.replace(
    'else if (section === "payments") {\n        document.getElementById("paymentsSection").style.display = "block";\n        loadPayments();\n    }',
    'else if (section === "payments") {\n        document.getElementById("paymentsSection").style.display = "block";\n        loadPayments();\n    }\n    else if (section === "drivers") {\n        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";\n        loadDrivers();\n    }'
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed driversSection display toggle in openAmbulanceSection');
