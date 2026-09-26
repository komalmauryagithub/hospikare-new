const fs = require('fs');
let content = fs.readFileSync('js/mdc.js', 'utf8');

content = content.replace(/window\.deleteMedicine = async function\(id\) \{[\s\S]*?alert\("Delete Medicine functionality coming soon for ID: " \+ id\);[\s\S]*?\};/, `window.deleteMedicine = async function(id) {
    if (confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/medicine/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Medicine deleted successfully.");
                if (typeof loadMedicines === 'function') loadMedicines();
            } else {
                alert(result.message || "Failed to delete medicine.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting medicine.");
        }
    }
};`);

content = content.replace(/window\.deletePharmacy = async function\(id\) \{[\s\S]*?alert\("Delete Pharmacy functionality coming soon for ID: " \+ id\);[\s\S]*?\};/, `window.deletePharmacy = async function(id) {
    if (confirm("Are you sure you want to delete this pharmacy? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/vendor/pharmacy/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Pharmacy deleted successfully.");
                if (typeof loadPharmacies === 'function') loadPharmacies();
            } else {
                alert(result.message || "Failed to delete pharmacy.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting pharmacy.");
        }
    }
};`);

content = content.replace(/window\.deletePharmacist = async function\(id\) \{[\s\S]*?alert\("Delete Pharmacist functionality coming soon for ID: " \+ id\);[\s\S]*?\};/, `window.deletePharmacist = async function(id) {
    if (confirm("Are you sure you want to delete this pharmacist? This action cannot be undone.")) {
        try {
            const res = await fetch('/api/vendor/pharmacist/' + id, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert("Pharmacist deleted successfully.");
                if (typeof loadPharmacists === 'function') loadPharmacists();
            } else {
                alert(result.message || "Failed to delete pharmacist.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting pharmacist.");
        }
    }
};`);

fs.writeFileSync('js/mdc.js', content);
console.log('Replaced delete functions');
