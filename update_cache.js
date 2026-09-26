const fs = require('fs');
let content = fs.readFileSync('mdc.html', 'utf8');

content = content.replace(/\?v=1790154050/g, '?v=20260925_3');

fs.writeFileSync('mdc.html', content);
console.log('Updated cache buster in mdc.html');
