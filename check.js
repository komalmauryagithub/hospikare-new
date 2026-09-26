const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.match(/app\.get\(\s*['\"\]\/['\"\]\s*,/)) {
        console.log(i + ': ' + l.trim());
    }
});
