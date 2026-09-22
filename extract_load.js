const fs = require("fs");
const code = fs.readFileSync("js/users.js", "utf8");

const funcs = ["loadLabs", "loadInsurances", "loadMedicines", "loadEquipments"];
funcs.forEach(fn => {
    const start = code.indexOf(`async function ${fn}()`);
    if(start !== -1) {
        console.log(`\n--- ${fn} ---`);
        console.log(code.substring(start, start + 1000));
    }
});

