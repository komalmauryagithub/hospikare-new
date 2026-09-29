import re

with open('server.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update the INSERT INTO insurances logic to include company_id
target = """      await pool.query(
        `INSERT INTO insurances(
                    users_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
                    add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) )`,"""

replacement = """      await pool.query(
        `INSERT INTO insurances(
                    users_id, company_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
                    add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, """

# Oh wait, `VALUES` has 16 placeholders in the original but 15 columns?
# Let's just use Regex to find the whole pool.query block and replace it.

js = re.sub(
    r"await pool\.query\(\s*`INSERT INTO insurances\(\s*users_id, comp_name.*?\) \)`,\s*\[\s*userId,\s*body\.hospital_id \|\| null,\s*safeString\(comp_name\).*?\]",
    r"""await pool.query(
        `INSERT INTO insurances(
            users_id, company_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
            add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            userId, req.body.company_id || null, safeString(comp_name), safeString(comp_type), safeString(ins_description), 
            safeString(irdai_number), safeString(comp_pan), safeString(gst_number), regDoc, safeString(ins_address), 
            addressProof, safeString(claim_type), safeString(required_docs), safeString(claim_approval_time), 
            safeString(contact_number), safeString(ins_email)
        ]""",
    js,
    flags=re.DOTALL
)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("server.js updated /api/add/insurance with company_id.")
