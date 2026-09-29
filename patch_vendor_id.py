import re

with open('routes_vendor_profile.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace vendor_id = ? with users_id = ? everywhere, then fix back equipment_suppliers
js = js.replace('WHERE id = ? AND vendor_id = ?', 'WHERE id = ? AND users_id = ?')

# Now fix equipment_suppliers back to vendor_id
# We can find the equipment_suppliers block and do a specific replace
target_eq = """UPDATE equipment_suppliers SET 
                        full_name = ?, mobile_number = ?, email_address = ?,
                        residential_address = ?, city = ?, state = ?, pincode = ?,
                        ownership_type = ?, designation = ?, gst_number = ?, business_registration_number = ?,
                        account_holder_name = ?, bank_name = ?, account_number = ?, ifsc_code = ?,
                        verification_status = COALESCE(?, verification_status), profile_status = COALESCE(?, profile_status),
                        profile_photo = COALESCE(?, profile_photo),
                        pan_card_file = COALESCE(?, pan_card_file),
                        aadhaar_card_file = COALESCE(?, aadhaar_card_file),
                        address_proof_file = COALESCE(?, address_proof_file),
                        medical_device_license_file = COALESCE(?, medical_device_license_file),
                        manufacturer_authorization_file = COALESCE(?, manufacturer_authorization_file),
                        cancelled_cheque_file = COALESCE(?, cancelled_cheque_file),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?"""
                    
replacement_eq = target_eq.replace('users_id = ?', 'vendor_id = ?')
js = js.replace(target_eq, replacement_eq)

with open('routes_vendor_profile.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("routes_vendor_profile.js fixed vendor_id vs users_id column names.")
