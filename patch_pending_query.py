import re

with open('routes_vendor_profile.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the specific 'vendor_ambulance' query with a generic 'user' query for any user who requested edit.
target = "pool.query(`SELECT u.id, COALESCE(NULLIF(u.company_name, ''), u.name) as name, 'vendor_ambulance' as type, u.id as users_id, u.name as vendor_name, u.emailorcontact, u.created_at FROM users u WHERE u.users_type = 'ambulance' AND u.edit_requested = 1`)"
replacement = "pool.query(`SELECT u.id, COALESCE(NULLIF(u.company_name, ''), u.name) as name, 'user' as type, u.id as users_id, u.name as vendor_name, u.emailorcontact, u.created_at FROM users u WHERE u.edit_requested = 1`)"

js = js.replace(target, replacement)

with open('routes_vendor_profile.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated /api/admin/pending-profile-edits query")
