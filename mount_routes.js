const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const regexPool = /(const pool = mysql\.createPool\(\{[\s\S]*?\}\);\r?\n)/;

const replacement = `$1\nrequire("./routes_vendor_profile")(app, pool, upload);\n`;

if (regexPool.test(serverJs)) {
    serverJs = serverJs.replace(regexPool, replacement);
    fs.writeFileSync('server.js', serverJs, 'utf8');
    console.log('Mounted routes_vendor_profile in server.js');
} else {
    console.log('regexPool did not match');
}
