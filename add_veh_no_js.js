const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const regex = /formData\.append\(\s*"ambulance_type",\s*document\.getElementById\(\s*"ambulance_type"\s*\)\.value\s*\);/;
const replacement = `formData.append(
            "ambulance_type",
            document.getElementById(
                "ambulance_type"
            ).value
        );
        formData.append(
            "vehicle_number",
            document.getElementById("vehicle_number") ? document.getElementById("vehicle_number").value : ""
        );`;

ambJs = ambJs.replace(regex, replacement);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Added vehicle_number to ambulanceForm formData');
