const fs = require('fs');
let ambHtml = fs.readFileSync('amb.html', 'utf8');

// Extract driverModal
const modalRegex = /<!-- DRIVER MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const match = ambHtml.match(modalRegex);
if(match) {
    const modalHtml = match[0];
    
    // Remove it from its current position
    ambHtml = ambHtml.replace(modalRegex, '');
    
    // Insert it before the scripts
    const scriptRegex = /<script src="\/js\/vendor-panel-controls\.js/;
    ambHtml = ambHtml.replace(scriptRegex, modalHtml + '\n\n  <script src="/js/vendor-panel-controls.js');
    
    fs.writeFileSync('amb.html', ambHtml, 'utf8');
    console.log('Moved driverModal above the script tags');
} else {
    console.log('driverModal not found!');
}
