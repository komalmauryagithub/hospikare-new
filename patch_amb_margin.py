import re

# Patch amb.html
with open('amb.html', 'r', encoding='utf-8') as f:
    amb_html = f.read()

target_bookings = '<div id="bookingsSection" style="display:none;">'
replacement_bookings = '<div id="bookingsSection" style="display:none; margin: 24px 0; padding: 24px; background: var(--hk-card-bg, #fff); border-radius: 16px; border: 1px solid var(--hk-border, #E4EAF2); box-shadow: 0 2px 8px rgba(7, 26, 61, 0.06);">'

if target_bookings in amb_html:
    amb_html = amb_html.replace(target_bookings, replacement_bookings)

target_payments = '<div id="paymentsSection" style="display:none;">'
replacement_payments = '<div id="paymentsSection" style="display:none; margin: 24px 0; padding: 24px; background: var(--hk-card-bg, #fff); border-radius: 16px; border: 1px solid var(--hk-border, #E4EAF2); box-shadow: 0 2px 8px rgba(7, 26, 61, 0.06);">'

if target_payments in amb_html:
    amb_html = amb_html.replace(target_payments, replacement_payments)

with open('amb.html', 'w', encoding='utf-8') as f:
    f.write(amb_html)
print("Patched amb.html")

# Patch js/amb.js
with open('js/amb.js', 'r', encoding='utf-8') as f:
    amb_js = f.read()

# For payments in js/amb.js, it generates innerHTML
# Let's add margin to the inner table-wrappers just in case
amb_js = amb_js.replace('<div class="table-wrapper paymentsTableContainer">', '<div class="table-wrapper paymentsTableContainer" style="margin-top: 24px;">')

# And for loadBookings, we can also add some padding to td if needed, but the wrapper card should fix the "kam lag raha hai" issue
with open('js/amb.js', 'w', encoding='utf-8') as f:
    f.write(amb_js)
print("Patched js/amb.js")
