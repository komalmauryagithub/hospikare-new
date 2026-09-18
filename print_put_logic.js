const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');
const match = serverJs.match(/app\.put\([\s\S]*?\"\/api\/user\/profile\"[\s\S]*?req\.session\.user = \{/);
if(match) console.log(match[0]);
