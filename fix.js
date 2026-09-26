const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

content = content.replace(
    'const result = await response.json();',
    'const result = await response.json();\n        window.medicinesData = result.medicines;'
);

fs.writeFileSync('js/mdc.js', content);
console.log('Fixed');
