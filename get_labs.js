const fs = require("fs");
const code = fs.readFileSync("js/users.js", "utf8");
const start = code.indexOf(`async function loadLabs()`);
console.log(code.substring(start, start + 3000));

