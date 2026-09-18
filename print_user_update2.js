const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');
const s = serverJs.indexOf('app.put(\n  "/api/user/profile"');
console.log(serverJs.substring(s, s + 1000));
