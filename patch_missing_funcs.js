const fs = require('fs');

const oldCode = fs.readFileSync('scratch/users_old.js', 'utf8');
let currentCode = fs.readFileSync('js/users.js', 'utf8');

// The block starts exactly at:
// async function handleLabBooking(event) {
// and ends exactly before:
// async function loadMedicines() {

const startString = 'async function handleLabBooking(event) {';
const endString = 'async function loadMedicines() {';

const startIndex = oldCode.indexOf(startString);
const endIndex = oldCode.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
    const missingBlock = oldCode.substring(startIndex, endIndex);
    
    // Now we insert it into currentCode right before loadMedicines()
    if (!currentCode.includes('async function handleLabBooking(event)')) {
        currentCode = currentCode.replace(endString, missingBlock + '\n    ' + endString);
        fs.writeFileSync('js/users.js', currentCode);
        console.log('Restored all missing functions!');
    } else {
        console.log('Functions already seem to be restored.');
    }
} else {
    console.log('Could not find markers in old code.');
}
