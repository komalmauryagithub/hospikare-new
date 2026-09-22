const fs = require("fs");
let code = fs.readFileSync("js/amb.js", "utf8");
code = code.replace("loadDrivers();\r\n    }\r\n    }\r\n    else if (section === \"livemap\") {", "loadDrivers();\r\n    }\r\n    else if (section === \"livemap\") {");
code = code.replace("loadDrivers();\n    }\n    }\n    else if (section === \"livemap\") {", "loadDrivers();\n    }\n    else if (section === \"livemap\") {");
fs.writeFileSync("js/amb.js", code, "utf8");
console.log("Syntax fixed");
