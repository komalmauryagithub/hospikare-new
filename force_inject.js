const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

const loadStockIndex = content.indexOf('async function loadStock()');
if (loadStockIndex !== -1) {
    const nextFetchResultIndex = content.indexOf('const result = await response.json();', loadStockIndex);
    if (nextFetchResultIndex !== -1) {
        const insertPosition = nextFetchResultIndex + 'const result = await response.json();'.length;
        
        // Ensure we don't insert it multiple times if it's already there
        const nextChars = content.substring(insertPosition, insertPosition + 50);
        if (!nextChars.includes('window.medicinesData')) {
            content = content.substring(0, insertPosition) + '\n        window.medicinesData = result.medicines;' + content.substring(insertPosition);
            fs.writeFileSync('js/mdc.js', content);
            console.log('Successfully injected window.medicinesData');
        } else {
            console.log('window.medicinesData is already there.');
        }
    } else {
        console.log('Could not find const result = await response.json() inside loadStock');
    }
} else {
    console.log('Could not find loadStock()');
}
