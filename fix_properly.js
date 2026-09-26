const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

const targetStr = `        const response = await fetch("/api/medicines");
        const result = await response.json();

        tbody.innerHTML = "";`;

const replacementStr = `        const response = await fetch("/api/medicines");
        const result = await response.json();
        window.medicinesData = result.medicines;

        tbody.innerHTML = "";`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('js/mdc.js', content);
console.log('Fixed loadStock properly');
