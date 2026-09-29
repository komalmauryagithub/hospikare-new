import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update option values
old_options = '''<option value="Full Payment">Full Payment (100%)</option>
                                <option value="Part Payment">Part Payment (Advance 40%)</option>'''
new_options = '''<option value="Full">Full Payment (100%)</option>
                                <option value="Part">Part Payment (Advance 40%)</option>'''
content = content.replace(old_options, new_options)

# Update logic in updateBookingAmount
old_logic1 = '''if(mode === "Part Payment") {
        finalPrice = basePrice * 0.40; // 40% advance
    }'''
new_logic1 = '''if(mode === "Part") {
        finalPrice = basePrice * 0.40; // 40% advance
    }'''
content = content.replace(old_logic1, new_logic1)

# Update logic in submitAppointment
old_logic2 = '''if(payment_type === "Part Payment") paid_amount = basePrice * 0.40;'''
new_logic2 = '''if(payment_type === "Part") paid_amount = basePrice * 0.40;'''
content = content.replace(old_logic2, new_logic2)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated payment type values to match database enums!")
