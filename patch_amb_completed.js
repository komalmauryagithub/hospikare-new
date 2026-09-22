const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');

const missingFunc = `
    async function handleAmbulanceBooking(event) {
        event.preventDefault();
        
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            ambulance_id: state.selectedAmbulanceId,
            patient_name: valueOf("patient_name"),
            patient_condition: valueOf("patient_condition"),
            pickup_address: valueOf("pickup_address"),
            destination_address: valueOf("destination_address"),
            booking_date: valueOf("booking_date"),
            total_amount: state.selectedAmbulanceAmount
        };

        await payAndRun({
            amount: state.selectedAmbulanceAmount,
            name: "HospiKare Ambulance",
            description: "Ambulance Booking Payment",
            prefillName: formData.patient_name,
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-ambulance", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Ambulance booking failed");
                    return;
                }

                toast("Payment successful and ambulance dispatched!");
                closeModal("ambulanceBookingModal");
                const form = document.getElementById("ambulanceBookingForm");
                if (form) form.reset();
                
                if (bookingData.tracking_token) {
                    setTimeout(() => {
                        window.location.href = '/user-tracking.html?token=' + bookingData.tracking_token;
                    }, 1500);
                }
            }
        });
    }
`;

if (!code.includes('async function handleAmbulanceBooking')) {
    code = code.replace('function openLabBooking(labId, testName, amount) {', missingFunc + '\n    function openLabBooking(labId, testName, amount) {');
    fs.writeFileSync('js/users.js', code);
    console.log('Restored handleAmbulanceBooking');
}
