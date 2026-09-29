import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Generate room options dynamically in loadHospitalDetails
old_modal_html = '''const modalHTML = `
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
                        </div>'''

new_modal_html = '''let roomOptionsHTML = '<option value="">-- Select a Room --</option>';
        if (hospital.rooms && hospital.rooms.length > 0) {
            hospital.rooms.forEach(r => {
                if(r.availability === 'Available') {
                    roomOptionsHTML += `<option value="${r.room_type}" data-price="${r.pricing}">${r.room_type} (Rs. ${r.pricing}/day)</option>`;
                }
            });
        }

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
                            <select id="bookingService" onchange="handleServiceChange()" style="font-weight: 700; background: #f8fafc;">
                                <option value="General Appointment">General Appointment</option>
                                <option value="Consultation">Doctor Consultation</option>
                                <option value="Room Booking">Room Booking</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="roomTypeGroup" style="display:none;">
                            <label>Room Type</label>
                            <select id="bookingRoomType" onchange="updateBookingAmount()">
                                ${roomOptionsHTML}
                            </select>
                        </div>'''

content = re.sub(r'const modalHTML = `[\s\S]*?<div class="form-group" id="roomTypeGroup" style="display:none;">\s*<label>Room Type</label>\s*<input type="text" id="bookingRoomType" readonly style="background: #e2e8f0;">\s*</div>', new_modal_html, content)

# Update logic script
old_logic = '''window.openAppointmentModal = function(serviceName = 'General Appointment', price = 500, type = 'consultation') {
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
        finalPrice = basePrice * 0.40; // 40% advance
    }
    
    document.getElementById("bookingAmountDisplay").textContent = "Rs. " + Math.round(finalPrice);
};'''

new_logic = '''window.openAppointmentModal = function(serviceName = 'General Appointment', price = 500, type = 'consultation') {
    const modal = document.getElementById("appointmentModal");
    if(modal) {
        document.getElementById("bookingBasePrice").value = price || 500;
        
        if(type === 'room') {
            document.getElementById("bookingService").value = "Room Booking";
            document.getElementById("roomTypeGroup").style.display = "block";
            document.getElementById("bookingRoomType").value = serviceName;
        } else {
            document.getElementById("bookingService").value = type === 'consultation' ? "Consultation" : "General Appointment";
            document.getElementById("roomTypeGroup").style.display = "none";
            document.getElementById("bookingRoomType").value = "";
        }
        
        document.getElementById("bookingDate").valueAsDate = new Date();
        updateBookingAmount();
        modal.classList.add("active");
    }
};

window.handleServiceChange = function() {
    const service = document.getElementById("bookingService").value;
    if(service === "Room Booking") {
        document.getElementById("roomTypeGroup").style.display = "block";
    } else {
        document.getElementById("roomTypeGroup").style.display = "none";
        document.getElementById("bookingBasePrice").value = 500; // Default consult fee
    }
    updateBookingAmount();
};

window.updateBookingAmount = function() {
    let basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    
    // If it's a room booking, get price from the selected room option
    if(document.getElementById("bookingService").value === "Room Booking") {
        const roomSelect = document.getElementById("bookingRoomType");
        if(roomSelect.selectedIndex > 0) {
            const selectedOption = roomSelect.options[roomSelect.selectedIndex];
            basePrice = parseFloat(selectedOption.getAttribute("data-price")) || 0;
        } else {
            basePrice = 0; // No room selected yet
        }
    }
    
    const mode = document.getElementById("bookingPaymentMode").value;
    let finalPrice = basePrice;
    
    if(mode === "Part Payment") {
        finalPrice = basePrice * 0.40; // 40% advance
    }
    
    document.getElementById("bookingAmountDisplay").textContent = "Rs. " + Math.round(finalPrice);
};'''

content = content.replace(old_logic, new_logic)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated room selection logic in modal!")
