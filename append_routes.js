const fs = require('fs');

const codeToAppend = `
app.delete("/api/medicine/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const medicineId = req.params.id;
        const vendorId = req.session.user.id;
        
        await pool.query('DELETE FROM med_lists WHERE medicine_id = ? AND vendor_id = ?', [medicineId, vendorId]);
        res.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while deleting medicine' });
    }
});

app.delete("/api/vendor/pharmacy/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const pharmacyId = req.params.id;
        const vendorId = req.session.user.id;
        
        await pool.query('DELETE FROM vendor_pharmacies WHERE id = ? AND vendor_id = ?', [pharmacyId, vendorId]);
        res.json({ success: true, message: 'Pharmacy deleted successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while deleting pharmacy' });
    }
});

app.delete("/api/vendor/pharmacist/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const pharmacistId = req.params.id;
        const vendorId = req.session.user.id;
        
        await pool.query('DELETE FROM vendor_pharmacists WHERE id = ? AND vendor_id = ?', [pharmacistId, vendorId]);
        res.json({ success: true, message: 'Pharmacist deleted successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while deleting pharmacist' });
    }
});
`;

fs.appendFileSync('server.js', codeToAppend);
console.log('Successfully appended delete routes to server.js');
