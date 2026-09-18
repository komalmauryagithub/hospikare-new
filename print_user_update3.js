const fs = require('fs');
const serverJs = fs.readFileSync('server.js', 'utf8');
const s = serverJs.indexOf('"/api/user/profile"');
console.log(serverJs.substring(s, s + 3000));
