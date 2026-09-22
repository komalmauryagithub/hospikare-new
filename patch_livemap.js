const fs = require("fs");
let code = fs.readFileSync("js/amb.js", "utf8");

code = code.replace(
    /document\.getElementById\("paymentsSection"\)\.style\.display = "none";\s*if\(document\.getElementById\("driversSection"\)\)/,
    `document.getElementById("paymentsSection").style.display = "none";
    if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "none";
    if(document.getElementById("driversSection"))`
);

code = code.replace(
    /else if \(section === "drivers"\) \{\s*if\(document\.getElementById\("driversSection"\)\) document\.getElementById\("driversSection"\)\.style\.display = "block";\s*loadDrivers\(\);\s*\}\s*\}/,
    `else if (section === "drivers") {
        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";
        loadDrivers();
    }
    else if (section === "livemap") {
        if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "flex";
        initFleetMap();
    }
}

let fleetMapInstance = null;
function initFleetMap() {
    if (!document.getElementById("fleetMap")) return;
    if (!fleetMapInstance) {
        fleetMapInstance = L.map("fleetMap").setView([19.0760, 72.8777], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap"
        }).addTo(fleetMapInstance);
        
        L.marker([19.0760, 72.8777]).addTo(fleetMapInstance).bindPopup("<b>Ambulance 1</b><br>Available").openPopup();
        L.marker([19.1000, 72.9000]).addTo(fleetMapInstance).bindPopup("<b>Ambulance 2</b><br>Busy");
        if(document.getElementById("activeFleetCount")) document.getElementById("activeFleetCount").innerText = "2";
    }
    setTimeout(() => {
        fleetMapInstance.invalidateSize();
    }, 200);
}`
);

fs.writeFileSync("js/amb.js", code, "utf8");
console.log("Patched amb.js");

