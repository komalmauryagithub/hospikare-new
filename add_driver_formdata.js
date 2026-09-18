const fs = require('fs');
let ambJs = fs.readFileSync('js/amb.js', 'utf8');

const regex = /formData\.append\(\s*"vehicle_number",\s*document\.getElementById\("vehicle_number"\) \? document\.getElementById\("vehicle_number"\)\.value : ""\s*\);/;

const replacement = `formData.append(
            "vehicle_number",
            document.getElementById("vehicle_number") ? document.getElementById("vehicle_number").value : ""
        );
        formData.append(
            "assigned_driver_id",
            document.getElementById("assigned_driver_id") ? document.getElementById("assigned_driver_id").value : ""
        );`;

ambJs = ambJs.replace(regex, replacement);
fs.writeFileSync('js/amb.js', ambJs, 'utf8');
console.log('Added assigned_driver_id to FormData in amb.js');
