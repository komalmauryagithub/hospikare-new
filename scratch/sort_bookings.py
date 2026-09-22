import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add sort to /api/admin/bookings
admin_bookings_old = '''  bookings.push(...hospital);
  bookings.push(...lab);
  bookings.push(...ambulance);

  res.json({'''
admin_bookings_new = '''  bookings.push(...hospital);
  bookings.push(...lab);
  bookings.push(...ambulance);

  bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({'''

content = content.replace(admin_bookings_old, admin_bookings_new)

# Add sort to /api/admin/orders
admin_orders_old = '''  orders.push(...medicine);
  orders.push(...equipment);

  res.json({'''
admin_orders_new = '''  orders.push(...medicine);
  orders.push(...equipment);

  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({'''

content = content.replace(admin_orders_old, admin_orders_new)

# User History / Bookings (let's check /api/user/history)
user_history_old = '''    const allHistory = [
      ...hospitalBookings,
      ...labBookings,
      ...ambulanceBookings,
      ...insurancePurchases,
    ];

    res.json({'''
user_history_new = '''    const allHistory = [
      ...hospitalBookings,
      ...labBookings,
      ...ambulanceBookings,
      ...insurancePurchases,
    ];

    allHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({'''

content = content.replace(user_history_old, user_history_new)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
