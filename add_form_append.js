const fs = require('fs');
let content = fs.readFileSync('js/amb.js', 'utf8');

const appendCode = `        formData.append(
            "assigned_driver_id",
            document.getElementById("assigned_driver_id") ? document.getElementById("assigned_driver_id").value : ""
        );
`;

content = content.replace(
    'formData.append(\n            "description",\n            document.getElementById(\n                "description"\n            ).value\n        );',
    'formData.append(\n            "description",\n            document.getElementById(\n                "description"\n            ).value\n        );\n' + appendCode
);

fs.writeFileSync('js/amb.js', content, 'utf8');
console.log('Added assigned_driver_id to ambulance form submission');
