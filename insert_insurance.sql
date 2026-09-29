-- Insert 2 Insurance Companies for vendor_id = 12
INSERT INTO insurance_companies (
    users_id, company_name, company_type, contact_person, mobile_number, email, 
    full_address, city, state, pincode, policy_types, cashless_available, 
    network_hospitals, status, verification_status
) VALUES (
    12, 'Star Health Insurance', 'Health', 'Rahul Sharma', '9876543210', 'rahul@starhealth.in',
    '15, Jeevan Bima Marg, Connaught Place', 'New Delhi', 'Delhi', '110001', 'Health, Family Floater, Critical Illness', 'Yes',
    5000, 'Active', 'Verified'
);

INSERT INTO insurance_companies (
    users_id, company_name, company_type, contact_person, mobile_number, email, 
    full_address, city, state, pincode, policy_types, cashless_available, 
    network_hospitals, status, verification_status
) VALUES (
    12, 'HDFC ERGO Health Insurance', 'Health & Life', 'Priya Mehta', '8765432109', 'priya@hdfcergo.com',
    '42, Marine Drive, Fort', 'Mumbai', 'Maharashtra', '400001', 'Health, Life, Accident, Travel', 'Yes',
    8500, 'Active', 'Verified'
);

-- Now get the IDs of these new companies + existing one for linking plans
-- existing: id=2 (opsentric)
-- new ones will be auto-incremented

-- Insert 2 Insurance Plans (into insurances table) for vendor_id = 12
INSERT INTO insurances (
    users_id, comp_name, comp_type, description, irdai, offc_add, 
    claim_type, doc_req, claim_time, cust_sup_num, email_sup, 
    ins_price, contact_person, claim_price, insurance_plans
) VALUES (
    12, 'Star Health Insurance', 'Health', 
    'Comprehensive health insurance plan covering hospitalization, daycare procedures, and pre/post hospitalization expenses up to 60 days.',
    'IRDA/HLT/STAR/2024/001', '15, Jeevan Bima Marg, Connaught Place, New Delhi',
    'Cashless', 'Aadhaar Card, PAN Card, Medical Reports, Hospital Bills', '30 days',
    '1800112233', 'claims@starhealth.in',
    '8999', 'Rahul Sharma', '5,00,000', 'Family Health Optima, Star Comprehensive'
);

INSERT INTO insurances (
    users_id, comp_name, comp_type, description, irdai, offc_add, 
    claim_type, doc_req, claim_time, cust_sup_num, email_sup, 
    ins_price, contact_person, claim_price, insurance_plans
) VALUES (
    12, 'HDFC ERGO Health Insurance', 'Health & Life', 
    'Premium health protection plan with coverage for critical illnesses, maternity benefits, and worldwide emergency assistance.',
    'IRDA/HLT/HDFC/2024/045', '42, Marine Drive, Fort, Mumbai',
    'Cashless', 'Aadhaar Card, PAN Card, Discharge Summary, Prescription', '15 days',
    '1800224466', 'support@hdfcergo.com',
    '12500', 'Priya Mehta', '10,00,000', 'Optima Secure, My Health Suraksha, Energy Gold'
);
