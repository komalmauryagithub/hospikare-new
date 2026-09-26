const fs = require('fs');
let fileContent = fs.readFileSync('js/mdc.js', 'utf8');

const targetContent = `        if(addStockBtn){
            addStockBtn.addEventListener("click", ()=>{
                const modalTitle = document.querySelector("#medicineModalHeader h2");
                if(modalTitle) modalTitle.innerText = "Add Stock";
                const modal = document.getElementById("medicineModal");
                if(modal) modal.style.display = "flex";
            });
        }`;

const replacementContent = `        if(addStockBtn){
            addStockBtn.addEventListener("click", ()=>{
                document.getElementById('medicineForm').reset();
                if (document.getElementById('edit_medicine_id')) document.getElementById('edit_medicine_id').value = '';
                const modalTitle = document.querySelector("#medicineModalHeader h2") || document.getElementById("medicineModalTitle");
                if(modalTitle) modalTitle.innerText = "Add Stock";
                const modal = document.getElementById("medicineModal");
                if(modal) modal.style.display = "flex";
            });
        }`;

fileContent = fileContent.replace(targetContent, replacementContent);
fs.writeFileSync('js/mdc.js', fileContent);
console.log('Successfully updated js/mdc.js');
