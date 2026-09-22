import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Payment Type UI before submit button in the form
old_price_and_submit = '''                        <div class="priceBox">
                            <h3>
                                Room Price:
                                <span id="roomPrice">
                                    \u20b90
                                </span>
                            </h3>
                            <h3>
                                Total Amount:
                                <span id="totalAmount">
                                    \u20b90
                                </span>
                            </h3>
                        </div>
                        <button type="submit"
                        class="submitAppointmentBtn">
                            Confirm Booking
                        </button>'''

new_price_and_submit = '''                        <div class="priceBox">
                            <h3>
                                Room Price:
                                <span id="roomPrice">
                                    \u20b90
                                </span>
                            </h3>
                            <h3>
                                Total Amount:
                                <span id="totalAmount">
                                    \u20b90
                                </span>
                            </h3>
                        </div>
                        <div class="inputGroup" style="margin-top:12px;">
                            <label style="font-weight:600;">Payment Type</label>
                            <div style="display:flex; gap:16px; margin-top:8px;">
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;">
                                    <input type="radio" name="paymentType" value="full" checked style="accent-color:#2563eb; width:18px; height:18px;"> Full Payment
                                </label>
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;">
                                    <input type="radio" name="paymentType" value="part" style="accent-color:#2563eb; width:18px; height:18px;"> Part Payment
                                </label>
                            </div>
                        </div>
                        <div id="partPaymentSection" style="display:none; margin-top:12px; padding:12px; background:var(--surface-alt, #f8fafc); border-radius:8px; border:1px solid var(--border-color, #e2e8f0);">
                            <div class="inputGroup" style="margin-bottom:8px;">
                                <label style="font-weight:600;">Enter Amount to Pay Now</label>
                                <input type="number" id="partPayAmount" placeholder="Enter amount" min="0" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;">
                                <small id="partPayError" style="color:#ef4444; display:none; margin-top:4px;">Minimum 50% of total amount is required</small>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted, #64748b); margin-top:8px;">
                                <span>Paying Now: <strong id="payingNowDisplay">\u20b90</strong></span>
                                <span>Remaining: <strong id="remainingDisplay">\u20b90</strong></span>
                            </div>
                        </div>
                        <button type="submit"
                        class="submitAppointmentBtn">
                            Confirm Booking
                        </button>'''

content = content.replace(old_price_and_submit, new_price_and_submit)

# 2. Add payment type toggle listeners after updateRoomPrice
old_update_room_price_end = '''roomTypeSelect.addEventListener(
    "change",
    updateRoomPrice
);

updateRoomPrice();

const appointmentForm ='''

new_update_room_price_end = '''roomTypeSelect.addEventListener(
    "change",
    updateRoomPrice
);

updateRoomPrice();

// Payment type toggle logic
const paymentTypeRadios = document.querySelectorAll('input[name="paymentType"]');
const partPaymentSection = document.getElementById('partPaymentSection');
const partPayAmountInput = document.getElementById('partPayAmount');
const partPayError = document.getElementById('partPayError');
const payingNowDisplay = document.getElementById('payingNowDisplay');
const remainingDisplay = document.getElementById('remainingDisplay');

paymentTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'part') {
            partPaymentSection.style.display = 'block';
            partPayAmountInput.value = '';
            payingNowDisplay.innerText = '\u20b90';
            remainingDisplay.innerText = totalAmount.innerText;
        } else {
            partPaymentSection.style.display = 'none';
            partPayError.style.display = 'none';
        }
    });
});

if (partPayAmountInput) {
    partPayAmountInput.addEventListener('input', function() {
        const total = Number(totalAmount.innerText.replace('\u20b9',''));
        const entered = Number(this.value) || 0;
        const minRequired = Math.ceil(total / 2);
        
        if (entered > 0 && entered < minRequired) {
            partPayError.style.display = 'block';
            partPayError.innerText = 'Minimum ' + minRequired + ' (50% of total) is required';
        } else if (entered > total) {
            partPayError.style.display = 'block';
            partPayError.innerText = 'Amount cannot exceed total ' + total;
        } else {
            partPayError.style.display = 'none';
        }
        
        payingNowDisplay.innerText = '\u20b9' + entered;
        remainingDisplay.innerText = '\u20b9' + Math.max(0, total - entered);
    });
}

const appointmentForm ='''

content = content.replace(old_update_room_price_end, new_update_room_price_end)

# 3. Replace the amount calculation and order creation to use payment type
old_amount_calc = '''try{
    const amount =
    Number(
        totalAmount.innerText
        .replace("\u20b9","")
    );
    const orderResponse =
    await fetch("/api/create-order",
        {
            method:"POST",
            headers:{
                "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
                amount
            })
        }
    );'''

new_amount_calc = '''try{
    const fullTotal = Number(totalAmount.innerText.replace("\u20b9",""));
    const selectedPayType = document.querySelector('input[name="paymentType"]:checked')?.value || 'full';
    let amount = fullTotal;
    
    if (selectedPayType === 'part') {
        const partVal = Number(document.getElementById('partPayAmount')?.value || 0);
        const minRequired = Math.ceil(fullTotal / 2);
        if (partVal < minRequired) {
            alert('Minimum payment is \u20b9' + minRequired + ' (50% of total amount)');
            return;
        }
        if (partVal > fullTotal) {
            alert('Payment amount cannot exceed total amount');
            return;
        }
        amount = partVal;
    }
    
    formData.payment_type = selectedPayType;
    formData.amount_paid = amount;
    formData.amount_remaining = fullTotal - amount;
    
    const orderResponse =
    await fetch("/api/create-order",
        {
            method:"POST",
            headers:{
                "Content-Type":
                "application/json"
            },
            body:JSON.stringify({
                amount
            })
        }
    );'''

content = content.replace(old_amount_calc, new_amount_calc)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("hosp_data.js updated successfully!")
