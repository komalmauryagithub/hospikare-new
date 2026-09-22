const fs = require("fs");
const code = fs.readFileSync("js/users.js", "utf8");

const funcs = ["renderHospitals", "renderMedicines", "renderInsurances", "renderLabs", "renderEquipments"];
funcs.forEach(fn => {
    const regex = new RegExp(`function ${fn}\\([\\s\\S]*?\\}\\s*\\}`, "g");
    const match = code.match(regex);
    if(match) {
        console.log("=== " + fn + " ===");
        console.log(match[0].substring(0, 500) + "...\n");
    }
});

