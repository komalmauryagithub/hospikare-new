const fs = require('fs');
let fileContent = fs.readFileSync('js/mdc.js', 'utf8');

const targetContent = `    if(medicineName===""){
        alert("Medicine Name Required");
        return;
    }
    if(document.getElementById("medicine_image").files[0]){
        formData.append(
            "medicine_image",
            document.getElementById("medicine_image").files[0]
        );
    }
    if(document.getElementById("medicine_excel_file").files[0]){
        formData.append(
            "medicine_excel_file",
            document.getElementById("medicine_excel_file").files[0]
        );
    }
    try{

        const response=await fetch('/api/add/medicine',{
            method:'POST',
            body:formData
        });
        const result=await response.json();`;

const replacementContent = `    const editId = document.getElementById("edit_medicine_id") ? document.getElementById("edit_medicine_id").value : null;

    if(medicineName===""){
        alert("Medicine Name Required");
        return;
    }

    try{
        let response;
        if (editId) {
            const jsonBody = {};
            for (let [key, value] of formData.entries()) {
                if (key !== 'medicine_image' && key !== 'medicine_excel_file') {
                    jsonBody[key] = value;
                }
            }
            response = await fetch('/api/update/medicine/' + editId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonBody)
            });
        } else {
            if(document.getElementById("medicine_image").files[0]){
                formData.append("medicine_image", document.getElementById("medicine_image").files[0]);
            }
            if(document.getElementById("medicine_excel_file").files[0]){
                formData.append("medicine_excel_file", document.getElementById("medicine_excel_file").files[0]);
            }
            response=await fetch('/api/add/medicine',{
                method:'POST',
                body:formData
            });
        }

        const result=await response.json();`;

fileContent = fileContent.replace(targetContent, replacementContent);
fs.writeFileSync('js/mdc.js', fileContent);
console.log('Successfully updated js/mdc.js');
