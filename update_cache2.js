const fs = require('fs');
let html = fs.readFileSync('mdc.html', 'utf8');
html = html.replace(/\?v=\d+/g, '?v=' + Date.now());
fs.writeFileSync('mdc.html', html);
console.log('Cache buster updated!');
