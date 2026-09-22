const fs = require("fs");
const code = fs.readFileSync("js/users.js", "utf8");
const lines = code.split("\n");
lines.forEach((line, i) => {
    if(line.includes("function") && line.includes("render")) {
        console.log(i + ": " + line.trim());
    }
});
