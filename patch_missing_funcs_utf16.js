const fs = require('fs');

const oldCode = fs.readFileSync('scratch/users_full_old.js', 'utf16le');
let currentCode = fs.readFileSync('js/users.js', 'utf8');

const startRegex = /async function handleLabBooking/;
const endRegex = /async function loadMedicines\(\)/;

const startMatch = oldCode.match(startRegex);
const endMatch = oldCode.match(endRegex);

if (startMatch && endMatch) {
    const startIndex = startMatch.index;
    const endIndex = endMatch.index;
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const missingBlock = oldCode.substring(startIndex, endIndex);
        
        const currentEndMatch = currentCode.match(endRegex);
        if (currentEndMatch) {
            currentCode = currentCode.substring(0, currentEndMatch.index) + missingBlock + currentCode.substring(currentEndMatch.index);
            fs.writeFileSync('js/users.js', currentCode, 'utf8');
            console.log('Restored all missing functions using regex (UTF-16 fixed)!');
        } else {
            console.log('Could not find loadMedicines in current code.');
        }
    } else {
        console.log('Indices are weird: ' + startIndex + ' ' + endIndex);
    }
} else {
    console.log('Regex did not match.');
}
