const fs = require("fs");
const code = fs.readFileSync("js/users.js", "utf8");

const renderFuncs = ["renderMedicines", "renderInsurances", "renderEquipments", "renderLabs"];
renderFuncs.forEach(fn => {
    const idx = code.indexOf(`function ${fn}`);
    if (idx !== -1) {
        console.log(`\n\n--- ${fn} ---`);
        console.log(code.substring(idx, idx + 1000));
    }
});

