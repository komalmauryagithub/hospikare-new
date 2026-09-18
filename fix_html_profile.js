const fs = require('fs');
let html = fs.readFileSync('amb.html', 'utf8');

// Fix onclick for close buttons in profile modal
html = html.replace(/onclick="document\.getElementById\('profileModalBox'\)\.style\.display='none'"/g, "onclick=\"document.getElementById('profileModal').style.display='none'\"");

// Fix character encoding in label if any (e.g. 24?7 -> 24×7)
html = html.replace(/24\?7 Service Available/g, "24×7 Service Available");
html = html.replace(/247 Service Available/g, "24×7 Service Available");

fs.writeFileSync('amb.html', html, 'utf8');
console.log('Fixed amb.html close buttons and label');
