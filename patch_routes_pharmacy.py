import re

with open('routes_vendor_profile.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """            else if (type === 'pharmacy') {
                const doc1 = getFile('drug_license_doc');
                const doc2 = getFile('pharmacist_registration_cert');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                
                await pool.query(
                    `UPDATE pharmacies SET 
                        drug_license_number = ?, contact_number = ?, address = ?, 
                        pharmacist_name = ?, home_delivery = ?,
                        drug_license_doc = COALESCE(?, drug_license_doc),
                        pharmacist_registration_cert = COALESCE(?, pharmacist_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [body.drug_license_number, body.contact_number, body.address, 
                     body.pharmacist_name, body.home_delivery,
                     doc1, doc2, doc3, doc4, entityId, userId]
                );
            }"""

replacement = """            else if (type === 'pharmacy') {
                const doc1 = getFile('drug_license_doc');
                const doc2 = getFile('pharmacist_registration_cert');
                const doc3 = getFile('pan_card');
                const doc4 = getFile('authorized_person_id_proof');
                const cancelled_cheque_file = getFile('cancelled_cheque_file');
                const profile_photo = getFile('profile_photo');
                
                await pool.query(
                    `UPDATE pharmacies SET 
                        full_name = ?, email_address = ?,
                        bank_account_number = ?, bank_name = ?, account_holder_name = ?, ifsc_code = ?,
                        profile_photo = COALESCE(?, profile_photo), cancelled_cheque_file = COALESCE(?, cancelled_cheque_file),
                        profile_status = COALESCE(?, profile_status), verification_status = COALESCE(?, verification_status),
                        drug_license_number = ?, contact_number = ?, address = ?, 
                        pharmacist_name = ?, home_delivery = ?,
                        drug_license_doc = COALESCE(?, drug_license_doc),
                        pharmacist_registration_cert = COALESCE(?, pharmacist_registration_cert),
                        pan_card = COALESCE(?, pan_card),
                        authorized_person_id_proof = COALESCE(?, authorized_person_id_proof),
                        profile_completed = TRUE, edit_allowed = 0, edit_requested = 0
                    WHERE id = ? AND users_id = ?`,
                    [
                        body.full_name, body.email_address,
                        body.bank_account_number, body.bank_name, body.account_holder_name, body.ifsc_code,
                        profile_photo, cancelled_cheque_file,
                        body.profile_status, body.verification_status,
                        body.drug_license_number, body.contact_number, body.address, 
                        body.pharmacist_name, body.home_delivery,
                        doc1, doc2, doc3, doc4, entityId, userId
                    ]
                );
            }"""

js = js.replace(target, replacement)

with open('routes_vendor_profile.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("routes_vendor_profile.js updated with pharmacy KYC fields.")
