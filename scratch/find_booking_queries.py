import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = ['/api/hospital/bookings', '/api/ambulance/bookings', '/api/lab/bookings', '/api/insurance/bookings', '/api/medicine/orders', '/api/equipment/orders', '/api/admin/bookings', '/api/admin/orders', '/api/user/orders']

for ep in endpoints:
    idx = content.find(f'app.get("{ep}"')
    if idx == -1:
        idx = content.find(f"app.get('{ep}'")
    
    if idx != -1:
        # find the first pool.query call
        q_idx = content.find('pool.query', idx)
        if q_idx != -1 and q_idx < idx + 2000:
            query = content[q_idx:q_idx+500]
            print(f'\n--- {ep} ---')
            print(query.strip())
