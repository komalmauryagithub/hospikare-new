import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_price_calc = '''    const basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    let paid_amount = basePrice;
    if(payment_type === "Part Payment") paid_amount = basePrice * 0.40;'''

new_price_calc = '''    let basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    if(serviceType === "Room Booking") {
        const roomSelect = document.getElementById("bookingRoomType");
        if(roomSelect.selectedIndex > 0) {
            const selectedOption = roomSelect.options[roomSelect.selectedIndex];
            basePrice = parseFloat(selectedOption.getAttribute("data-price")) || 0;
        }
    }
    
    let paid_amount = basePrice;
    if(payment_type === "Part Payment") paid_amount = basePrice * 0.40;'''

content = content.replace(old_price_calc, new_price_calc)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed basePrice calculation in submitAppointment!")
