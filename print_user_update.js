const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');
const s = serverJs.indexOf('const updates = [];\n        const values = [];');
console.log(serverJs.substring(s, s + 500));
