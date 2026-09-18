const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

ambJs = ambJs.replace(
    /document\.getElementById\("paymentsSection"\)\.style\.display = "none";/g,
    'document.getElementById("paymentsSection").style.display = "none";\n    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";'
);

// We need to clean up any duplicate injections from the previous run
ambJs = ambJs.replace(
    /if\(document\.getElementById\("driversSection"\)\) document\.getElementById\("driversSection"\)\.style\.display = "none";\s*if\(document\.getElementById\("driversSection"\)\) document\.getElementById\("driversSection"\)\.style\.display = "none";/g,
    'if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";'
);

fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Fixed missing /g flag in replace');
