const fs = require('fs');
const files = {
    'js/amb.js': 'Select Ambulance...',
    'js/lt.js': 'Select Lab Name...',
    'js/mdc.js': 'Select Pharmacy Name...',
    'js/mdeq.js': 'Select Equipment Source...',
    'js/ins.js': 'Select Insurance Company...'
};

for (const [file, text] of Object.entries(files)) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace('<option value="">Select entity...</option>', '<option value="">' + text + '</option>');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    } catch(e) { console.log(e); }
}
