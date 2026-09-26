const fs = require('fs');

const codeToAppend = `

// Edit Routes
app.put("/api/update/medicine/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const medicineId = req.params.id;
        const vendorId = req.session.user.id;
        const data = req.body;
        
        await pool.query(
            "UPDATE med_lists SET medicine_name=?, generic_name=?, brand_name=?, medicine_type=?, category=?, manufacturer=?, composition=?, mrp=?, selling_price=?, gst_percentage=?, discount_percentage=?, stock_quantity=?, minimum_stock_alert=?, batch_number=?, manufacturing_date=?, expiry_date=?, prescription_required=?, schedule_type=?, uses_info=?, dosage_instructions=?, side_effects=?, warnings=?, storage_instructions=?, delivery_available=?, delivery_charge=?, barcode_number=?, medicine_status=?, featured_medicine=? WHERE medicine_id=? AND vendor_id=?",
            [data.medicine_name, data.generic_name, data.brand_name, data.medicine_type, data.category, data.manufacturer, data.composition, data.mrp, data.selling_price, data.gst_percentage, data.discount_percentage, data.stock_quantity, data.minimum_stock_alert, data.batch_number, data.manufacturing_date, data.expiry_date, data.prescription_required, data.schedule_type, data.uses_info, data.dosage_instructions, data.side_effects, data.warnings, data.storage_instructions, data.delivery_available, data.delivery_charge, data.barcode_number, data.medicine_status, data.featured_medicine, medicineId, vendorId]
        );
        res.json({ success: true, message: 'Medicine updated successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while updating medicine' });
    }
});

app.put("/api/update/vendor/pharmacy/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const pharmacyId = req.params.id;
        const vendorId = req.session.user.id;
        const data = req.body;
        
        await pool.query(
            "UPDATE vendor_pharmacies SET pharmacy_name=?, owner_name=?, pharmacy_type=?, contact_number=?, email=?, license_number=?, tax_id=?, address=?, city=?, state=?, pincode=?, operating_hours=?, status=? WHERE id=? AND vendor_id=?",
            [data.pharmacy_name, data.owner_name, data.pharmacy_type, data.contact_number, data.email, data.license_number, data.tax_id, data.address, data.city, data.state, data.pincode, data.operating_hours, data.status, pharmacyId, vendorId]
        );
        res.json({ success: true, message: 'Pharmacy updated successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while updating pharmacy' });
    }
});

app.put("/api/update/vendor/pharmacist/:id", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: 'Unauthorized' });
        const pharmacistId = req.params.id;
        const vendorId = req.session.user.id;
        const data = req.body;
        
        await pool.query(
            "UPDATE vendor_pharmacists SET pharmacist_name=?, pharmacy_name=?, registration_number=?, qualification=?, contact_number=?, email=?, experience_years=?, shift_timing=?, availability=?, status=? WHERE id=? AND vendor_id=?",
            [data.pharmacist_name, data.pharmacy_name, data.registration_number, data.qualification, data.contact_number, data.email, data.experience_years, data.shift_timing, data.availability, data.status, pharmacistId, vendorId]
        );
        res.json({ success: true, message: 'Pharmacist updated successfully' });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: 'Server error while updating pharmacist' });
    }
});
`;

fs.appendFileSync('server.js', codeToAppend);
console.log('Successfully appended PUT routes to server.js');
