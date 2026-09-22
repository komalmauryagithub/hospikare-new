
const fs = require("fs");
let code = fs.readFileSync("js/amb.js", "utf8");

// We need to inject the "livemap" section logic into openAmbulanceSection.
// Let us use regex to find where "drivers" block ends.
const regex = /else if \(section === "drivers"\) \{[\s\S]*?loadDrivers\(\);\s*\}/;

const match = code.match(regex);
if (match) {
    const replacement = match[0] + `
    }
    else if (section === "livemap") {
        if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "flex";
        if(typeof initFleetMap === "function") initFleetMap();
`;
    code = code.replace(regex, replacement);
    fs.writeFileSync("js/amb.js", code, "utf8");
    console.log("Successfully injected livemap route.");
} else {
    console.log("Could not find drivers block!");
}

