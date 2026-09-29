import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For /api/add/insurance
# Look for: const { comp_name, ... } = req.body;
# And: await pool.query( INSERT INTO insurances( ... ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);, [ userId, req.body.company_id || null, safeString(comp_name) ... ]

add_replacement = '''
      let finalCompName = safeString(comp_name);
      if (!finalCompName && req.body.company_id) {
        const [cRows] = await pool.query('SELECT company_name FROM insurance_companies WHERE id = ?', [req.body.company_id]);
        if (cRows.length > 0) finalCompName = cRows[0].company_name;
      }
      
      await pool.query(
        INSERT INTO insurances(
            users_id, company_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
            add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);,
        [
            userId, req.body.company_id || null, finalCompName, safeString(comp_type), safeString(ins_description),
'''

content = re.sub(
    r'await pool\.query\(\s*INSERT INTO insurances\(\s*users_id, company_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,\s*add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup\s*\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\);,\s*\[\s*userId, req\.body\.company_id \|\| null, safeString\(comp_name\), safeString\(comp_type\), safeString\(ins_description\),',
    add_replacement,
    content,
    flags=re.MULTILINE
)


# For /api/edit/insurance/:id
# Look for:
# b.company_id || null, b.comp_name || null, b.comp_type || null, b.ins_description || null,

edit_replacement = '''
    let editCompName = b.comp_name || null;
    if (!editCompName && b.company_id) {
        const [cRows] = await pool.query('SELECT company_name FROM insurance_companies WHERE id = ?', [b.company_id]);
        if (cRows.length > 0) editCompName = cRows[0].company_name;
    }

    await pool.query(UPDATE insurances SET
      company_id = ?, comp_name = ?, comp_type = ?, description = ?, irdai = ?, comp_pan = ?, gst = ?,
      offc_add = ?, claim_type = ?, doc_req = ?, claim_time = ?, cust_sup_num = ?, email_sup = ?,
      incorp_cert = COALESCE(?, incorp_cert),
      add_proof = COALESCE(?, add_proof)
      WHERE id = ? AND users_id = ?, [
      b.company_id || null, editCompName, b.comp_type || null, b.ins_description || null,
'''

content = re.sub(
    r'await pool\.query\(UPDATE insurances SET\s*company_id = \?, comp_name = \?, comp_type = \?, description = \?, irdai = \?, comp_pan = \?, gst = \?,\s*offc_add = \?, claim_type = \?, doc_req = \?, claim_time = \?, cust_sup_num = \?, email_sup = \?,\s*incorp_cert = COALESCE\(\?, incorp_cert\),\s*add_proof = COALESCE\(\?, add_proof\)\s*WHERE id = \? AND users_id = \?, \[\s*b\.company_id \|\| null, b\.comp_name \|\| null, b\.comp_type \|\| null, b\.ins_description \|\| null,',
    edit_replacement,
    content,
    flags=re.MULTILINE
)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
