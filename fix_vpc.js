const fs = require('fs');
let vpc = fs.readFileSync('js/vendor-panel-controls.js', 'utf8');

vpc = vpc.replace(/inputs\.forEach\(input => input\.disabled = true\);/g, '// inputs.forEach(input => input.disabled = true);');

fs.writeFileSync('js/vendor-panel-controls.js', vpc, 'utf8');
console.log('Updated vendor-panel-controls.js');
