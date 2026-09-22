import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add event listeners for lab part payment UI
payment_ui_logic = '''
    // Lab Payment Type Logic
    const labPaymentTypeRadios = document.querySelectorAll('input[name="labPaymentType"]');
    const labPartPaymentSection = document.getElementById('labPartPaymentSection');
    const labPartPayAmountInput = document.getElementById('labPartPayAmount');
    const labPartPayError = document.getElementById('labPartPayError');
    const labPayingNowDisplay = document.getElementById('labPayingNowDisplay');
    const labRemainingDisplay = document.getElementById('labRemainingDisplay');
    const labTestAmountDisplay = document.getElementById('labTestAmount');

    if (labPaymentTypeRadios) {
        labPaymentTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'part') {
                    labPartPaymentSection.style.display = 'block';
                    labPartPayAmountInput.value = '';
                    labPayingNowDisplay.innerText = '\u20b90';
                    labRemainingDisplay.innerText = labTestAmountDisplay.innerText;
                } else {
                    labPartPaymentSection.style.display = 'none';
                    if(labPartPayError) labPartPayError.style.display = 'none';
                }
            });
        });
    }

    if (labPartPayAmountInput) {
        labPartPayAmountInput.addEventListener('input', function() {
            const total = Number(labTestAmountDisplay.innerText.replace(/[^0-9]/g, ''));
            const entered = Number(this.value) || 0;
            const minRequired = Math.ceil(total / 2);
            
            if (entered > 0 && entered < minRequired) {
                labPartPayError.style.display = 'block';
                labPartPayError.innerText = 'Minimum ' + minRequired + ' (50% of total) is required';
            } else if (entered > total) {
                labPartPayError.style.display = 'block';
                labPartPayError.innerText = 'Amount cannot exceed total ' + total;
            } else {
                labPartPayError.style.display = 'none';
            }
            
            labPayingNowDisplay.innerText = '\u20b9' + entered;
            labRemainingDisplay.innerText = '\u20b9' + Math.max(0, total - entered);
        });
    }

    async function handleLabBooking(event) {
'''

content = content.replace('    async function handleLabBooking(event) {', payment_ui_logic)

# 2. Update handleLabBooking to calculate amount based on payment type
old_lab_booking = '''    async function handleLabBooking(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) return;

        const amount = state.selectedLabAmount || 500;
        await payAndRun({
            amount: amount,
            name: "HospiKare Lab Booking",
            description: "Lab Test Payment",
            onSuccess: async response => {
                toast("Lab test booked successfully!");
                closeModal("labBookingModal");
                $("#labBookingForm")?.reset();
            }
        });
    }'''

new_lab_booking = '''    async function handleLabBooking(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) return;

        const fullTotal = state.selectedLabAmount || 500;
        let amount = fullTotal;
        const selectedPayType = document.querySelector('input[name="labPaymentType"]:checked')?.value || 'full';
        
        if (selectedPayType === 'part') {
            const partVal = Number(document.getElementById('labPartPayAmount')?.value || 0);
            const minRequired = Math.ceil(fullTotal / 2);
            if (partVal < minRequired) {
                toast('Minimum payment is \u20b9' + minRequired + ' (50% of total amount)');
                return;
            }
            if (partVal > fullTotal) {
                toast('Payment amount cannot exceed total amount');
                return;
            }
            amount = partVal;
        }

        // We could theoretically pass fullTotal and amount to backend if backend supported it, 
        // but passing the selected amount to Razorpay works for the immediate payment requirement.
        
        await payAndRun({
            amount: amount,
            name: "HospiKare Lab Booking",
            description: "Lab Test Payment (" + (selectedPayType === 'part' ? 'Part' : 'Full') + ")",
            onSuccess: async response => {
                toast("Lab test booked successfully!");
                closeModal("labBookingModal");
                $("#labBookingForm")?.reset();
                
                // Reset part payment UI
                if (document.getElementById('labPartPaymentSection')) {
                    document.getElementById('labPartPaymentSection').style.display = 'none';
                }
                const fullRadio = document.querySelector('input[name="labPaymentType"][value="full"]');
                if (fullRadio) fullRadio.checked = true;
            }
        });
    }'''

content = content.replace(old_lab_booking, new_lab_booking)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
