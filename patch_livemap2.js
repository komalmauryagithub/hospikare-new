const fs = require("fs");
let code = fs.readFileSync("js/amb.js", "utf8");

// 1. Hide livemapSection in the reset block
code = code.replace(
    /document\.getElementById\("paymentsSection"\)\.style\.display = "none";\s*if\(document\.getElementById\("driversSection"\)\) document\.getElementById\("driversSection"\)\.style\.display = "none";/g,
    `document.getElementById("paymentsSection").style.display = "none";
    if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "none";
    if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "none";`
);

// 2. Add the livemap route logic
const targetRoute = `else if (section === "drivers") {
        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";
        loadDrivers();
    }`;

const newRoute = `else if (section === "drivers") {
        if(document.getElementById("driversSection")) document.getElementById("driversSection").style.display = "block";
        loadDrivers();
    }
    else if (section === "livemap") {
        if(document.getElementById("livemapSection")) document.getElementById("livemapSection").style.display = "flex";
        if(typeof initFleetMap === "function") initFleetMap();
    }`;
    
code = code.replace(targetRoute, newRoute);

// 3. Append the initFleetMap function at the end of the file
const initFunc = `\n
let fleetMapInstance = null;
window.initFleetMap = function() {
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
};
`;
code += initFunc;

fs.writeFileSync("js/amb.js", code, "utf8");
console.log("Patched js/amb.js successfully.");

