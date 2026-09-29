import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_submit = '''window.submitAppointment = function(event) {
    event.preventDefault();
    const amount = document.getElementById("bookingAmountDisplay").textContent;
    alert("Redirecting to Razorpay for " + amount + "...");
    // Integration logic for Razorpay goes here
    closeAppointmentModal();
};'''

new_submit = '''window.submitAppointment = async function(event) {
    event.preventDefault();
    
    // Check user authentication
    let userStr = localStorage.getItem("productUser") || localStorage.getItem("hk_user");
    if(!userStr) {
        alert("Please login first to book an appointment!");
        if(typeof showAuthModal === "function") showAuthModal();
        return;
    }
    const user = JSON.parse(userStr);
    
    // Gather form data
    const patient_name = document.getElementById("bookingName").value;
    const patient_age = document.getElementById("bookingAge").value;
    const patient_gender = document.getElementById("bookingGender").value;
    const admission_date = document.getElementById("bookingDate").value;
    const payment_type = document.getElementById("bookingPaymentMode").value;
    
    const serviceType = document.getElementById("bookingService").value;
    let room_type = "Consultation";
    if(serviceType === "Room Booking") {
        const roomSelect = document.getElementById("bookingRoomType");
        room_type = roomSelect.options[roomSelect.selectedIndex]?.value || "";
    }
    const bed_type = "Standard"; // Can be dynamic if needed
    
    const basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    let paid_amount = basePrice;
    if(payment_type === "Part Payment") paid_amount = basePrice * 0.40;
    
    // 1. Create Order
    const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: paid_amount })
    });
    const orderData = await orderRes.json();
    
    if(!orderData.success) {
        alert("Failed to initialize payment");
        return;
    }
    
    // 2. Razorpay Options
    const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: "HospiKare",
        description: "Hospital Booking Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
            // 3. Verify & Save Booking
            const bookingRes = await fetch("/api/book-hospital", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    hospital_id: hospitalId, // global var
                    patient_name,
                    patient_age,
                    patient_gender,
                    room_type,
                    bed_type,
                    total_amount: basePrice,
                    payment_type,
                    paid_amount,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                })
            });
            const bookingData = await bookingRes.json();
            if(bookingData.success) {
                alert("Booking Confirmed Successfully!");
                closeAppointmentModal();
                window.location.href = "act.html";
            } else {
                alert("Booking saving failed: " + bookingData.message);
            }
        },
        prefill: {
            name: patient_name,
            email: user.email || "",
            contact: user.phone || ""
        },
        theme: { color: "#2563eb" }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
};'''

content = content.replace(old_submit, new_submit)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated submitAppointment with full Razorpay integration!")
