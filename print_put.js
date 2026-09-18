const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');
const startIndex = serverJs.indexOf('app.put(\n  "/api/user/profile"');
const endIndex = serverJs.indexOf('res.json({', startIndex);
console.log(serverJs.substring(startIndex, endIndex));
