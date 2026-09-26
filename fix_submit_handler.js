const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

// Find the exact submit handler and replace the logic from the validation check onwards
// We need to replace from line "if(medicineName===""){" through the end of the try/catch

const oldSubmitBlock = [
    '    if(medicineName===""){',
    '        alert("Medicine Name Required");',
    '        return;',
    '    }',
    '    if(document.getElementById("medicine_image").files[0]){',
    '        formData.append(',
    '            "medicine_image",',
    '            document.getElementById("medicine_image").files[0]',
    '        );',
    '    }',
    '    if(document.getElementById("medicine_excel_file").files[0]){',
    '        formData.append(',
    '            "medicine_excel_file",',
    '            document.getElementById("medicine_excel_file").files[0]',
    '        );',
    '    }',
    '    try{',
    '',
    "        const response=await fetch('/api/add/medicine',{",
    "            method:'POST',",
    '            body:formData',
    '        });',
    '        const result=await response.json();',
    '        if(result.success){',
    '            alert(result.message);',
    "            document.getElementById('medicineForm').reset();",
    "            document.getElementById('medicineModal').style.display='none';",
    '            loadMedicines();',
    '        }',
    '    }',
    '    catch(error){',
    '        console.log(error);',
    '    }',
].join('\r\n');

const newSubmitBlock = [
    '    if(medicineName===""){',
    '        alert("Medicine Name Required");',
    '        return;',
    '    }',
    '',
    '    const editId = document.getElementById("edit_medicine_id") ? document.getElementById("edit_medicine_id").value : "";',
    '',
    '    try{',
    '        let response;',
    '        if (editId) {',
    '            // UPDATE existing medicine via PUT with JSON',
    '            const jsonBody = {};',
    '            for (let [key, value] of formData.entries()) {',
    '                jsonBody[key] = value;',
    '            }',
    '            response = await fetch("/api/update/medicine/" + editId, {',
    '                method: "PUT",',
    '                headers: { "Content-Type": "application/json" },',
    '                body: JSON.stringify(jsonBody)',
    '            });',
    '        } else {',
    '            // ADD new medicine via POST with FormData',
    '            if(document.getElementById("medicine_image").files[0]){',
    '                formData.append("medicine_image", document.getElementById("medicine_image").files[0]);',
    '            }',
    '            if(document.getElementById("medicine_excel_file").files[0]){',
    '                formData.append("medicine_excel_file", document.getElementById("medicine_excel_file").files[0]);',
    '            }',
    '            response = await fetch("/api/add/medicine", {',
    '                method: "POST",',
    '                body: formData',
    '            });',
    '        }',
    '',
    '        const result = await response.json();',
    '        if(result.success){',
    '            alert(result.message);',
    "            document.getElementById('medicineForm').reset();",
    '            if(document.getElementById("edit_medicine_id")) document.getElementById("edit_medicine_id").value = "";',
    "            document.getElementById('medicineModal').style.display='none';",
    '            // Reload the current view',
    '            if (typeof loadMedicines === "function") loadMedicines();',
    '            if (typeof loadStock === "function" && document.getElementById("stockTableBody")) loadStock();',
    '        } else {',
    '            alert(result.message || "Operation failed.");',
    '        }',
    '    }',
    '    catch(error){',
    '        console.log(error);',
    '        alert("Error saving medicine. Please try again.");',
    '    }',
].join('\r\n');

if (content.includes(oldSubmitBlock)) {
    content = content.replace(oldSubmitBlock, newSubmitBlock);
    console.log('SUCCESS: Medicine form submit handler updated with edit/add logic!');
} else {
    // Try with \n line endings
    const oldLF = oldSubmitBlock.replace(/\r\n/g, '\n');
    if (content.includes(oldLF)) {
        content = content.replace(oldLF, newSubmitBlock.replace(/\r\n/g, '\n'));
        console.log('SUCCESS (LF): Medicine form submit handler updated!');
    } else {
        console.log('FAILED: Could not find the submit block to replace.');
        // Debug: Show what's around the target area
        const idx = content.indexOf("if(medicineName===\"\"){");
        if (idx !== -1) {
            console.log('Found medicineName check at index', idx);
            console.log('Nearby content:', JSON.stringify(content.substring(idx, idx + 200)));
        }
    }
}

fs.writeFileSync('js/mdc.js', content);
