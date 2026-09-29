import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

modal_html = '''
        if(!document.getElementById("appointmentModal")) {
            const modalHTML = `
            <div class="modal" id="appointmentModal" style="z-index: 9999; background: rgba(15, 23, 42, 0.7);">
                <div class="modal-content" style="max-width: 500px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
                    <span class="close-modal" onclick="closeAppointmentModal()">&times;</span>
                    <h2 style="font-size: 26px; font-weight: 800; margin-bottom: 24px; color: #0f172a;">Complete Booking</h2>
                    
                    <form id="appointmentForm" onsubmit="submitAppointment(event)">
                        <input type="hidden" id="bookingBasePrice" value="0">
                        
                        <div class="form-group">
                            <label>Service Type</label>
                            <input type="text" id="bookingService" readonly style="background: #e2e8f0; font-weight: 700;">
                        </div>
                        
                        <div class="form-group" id="roomTypeGroup" style="display:none;">
                            <label>Room Type</label>
                            <input type="text" id="bookingRoomType" readonly style="background: #e2e8f0;">
                        </div>
                        
                        <div class="form-group">
                            <label>Patient Full Name</label>
                            <input type="text" id="bookingName" required placeholder="Enter full name">
                        </div>
                        
                        <div class="form-group">
                            <label>Contact Number</label>
                            <input type="tel" id="bookingPhone" required placeholder="10-digit number" pattern="[0-9]{10}">
                        </div>
                        
                        <div class="form-group">
                            <label>Date of Admission / Appointment</label>
                            <input type="date" id="bookingDate" required>
                        </div>
                        
                        <div class="form-group" id="paymentModeGroup">
                            <label>Payment Options</label>
                            <select id="bookingPaymentMode" required onchange="updateBookingAmount()">
                                <option value="Full Payment">Full Payment (100%)</option>
                                <option value="Part Payment">Part Payment (Advance 20%)</option>
                            </select>
                        </div>
                        
                        <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin-top: 24px; margin-bottom: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; color: #64748b;">Amount to Pay:</span>
                                <span id="bookingAmountDisplay" style="font-size: 24px; font-weight: 800; color: #2563eb;">Rs. 0</span>
                            </div>
                        </div>
                        
                        <button type="submit" class="bookBtn" style="width: 100%; font-size: 18px; padding: 18px;">Proceed to Pay</button>
                    </form>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
'''

# Remove the old modal injection
content = re.sub(r'if\(!document\.getElementById\("appointmentModal"\)\)\s*\{[\s\S]*?\}\s*\}\s*catch', modal_html + '\n\n    } catch', content)


script_logic = '''
window.openAppointmentModal = function(serviceName = 'General Appointment', price = 500, type = 'consultation') {
    const modal = document.getElementById("appointmentModal");
    if(modal) {
        document.getElementById("bookingService").value = serviceName;
        document.getElementById("bookingBasePrice").value = price || 500;
        
        if(type === 'room') {
            document.getElementById("roomTypeGroup").style.display = "block";
            document.getElementById("bookingRoomType").value = serviceName;
            document.getElementById("bookingService").value = "Room Booking";
        } else {
            document.getElementById("roomTypeGroup").style.display = "none";
        }
        
        // Reset date to today
        document.getElementById("bookingDate").valueAsDate = new Date();
        
        updateBookingAmount();
        modal.classList.add("active");
    }
};

window.updateBookingAmount = function() {
    const basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    const mode = document.getElementById("bookingPaymentMode").value;
    let finalPrice = basePrice;
    
    if(mode === "Part Payment") {
        finalPrice = basePrice * 0.20; // 20% advance
    }
    
    document.getElementById("bookingAmountDisplay").textContent = "Rs. " + Math.round(finalPrice);
};

window.closeAppointmentModal = function() {
    const modal = document.getElementById("appointmentModal");
    if(modal) modal.classList.remove("active");
};

window.submitAppointment = function(event) {
    event.preventDefault();
    const amount = document.getElementById("bookingAmountDisplay").textContent;
    alert("Redirecting to Razorpay for " + amount + "...");
    // Integration logic for Razorpay goes here
    closeAppointmentModal();
};
'''

content = re.sub(r'window\.openAppointmentModal = function[\s\S]*$', script_logic + '\nloadHospitalDetails();\n', content)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated booking modal to include payment options!")
