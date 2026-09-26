const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

// Fix 1: Remove the wrong assignment in loadUserProfile
content = content.replace(
    'const result = await response.json();\r\n        window.medicinesData = result.medicines;',
    'const result = await response.json();'
);
content = content.replace(
    'const result = await response.json();\n        window.medicinesData = result.medicines;',
    'const result = await response.json();'
);

// Fix 2: Add to loadStock properly.
// The code in loadStock is around line 1157:
// const response = await fetch("/api/medicines");
// const result = await response.json();
// 
// tbody.innerHTML = "";

const stockTarget1 = `const response = await fetch("/api/medicines");\r\n        const result = await response.json();\r\n\r\n        tbody.innerHTML = "";`;
const stockTarget2 = `const response = await fetch("/api/medicines");\n        const result = await response.json();\n\n        tbody.innerHTML = "";`;

const stockReplacement = `const response = await fetch("/api/medicines");\n        const result = await response.json();\n        window.medicinesData = result.medicines;\n\n        tbody.innerHTML = "";`;

if (content.includes(stockTarget1)) {
    content = content.replace(stockTarget1, stockReplacement);
} else if (content.includes(stockTarget2)) {
    content = content.replace(stockTarget2, stockReplacement);
} else {
    // regex fallback
    content = content.replace(
        /const response = await fetch\("\/api\/medicines"\);\s*const result = await response\.json\(\);\s*tbody\.innerHTML = "";/g,
        'const response = await fetch("/api/medicines");\n        const result = await response.json();\n        window.medicinesData = result.medicines;\n\n        tbody.innerHTML = "";'
    );
}

fs.writeFileSync('js/mdc.js', content);
console.log('Fixed js/mdc.js properly.');
