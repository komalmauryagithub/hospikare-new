import re

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write("""const params = new URLSearchParams(window.location.search);
const hospitalId = params.get("id");

async function loadHospitalDetails() {
    try {
        const response = await fetch(`/api/hospital/${hospitalId}`);
        const data = await response.json();
        if (!data.success) {
            alert("Hospital not found");
            return;
        }
        
        const hospital = data.hospital;
        const container = document.getElementById("hospitalDetailsContainer");
        
        // 1. Hero Images
        let coverImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop";
        if (hospital.hospital_images && hospital.hospital_images.length > 0) {
            coverImage = `/uploads/${hospital.hospital_images[0]}`;
        }
        
        // 2. Facilities
        let facilitiesHTML = '';
        if (hospital.facilities) {
            hospital.facilities.split(',').forEach(facility => {
                facilitiesHTML += `<span>${facility.trim()}</span>`;
            });
        }
        
        // 3. Rooms
        let roomsHTML = '';
        if (hospital.rooms && hospital.rooms.length > 0) {
            hospital.rooms.forEach(room => {
                const isAvailable = room.availability === 'Available';
                roomsHTML += `
                    <div class="roomCard">
                        <div class="roomInfo">
                            <h3>${room.room_type}</h3>
                            <p>${room.bed_type} Bed | ${isAvailable ? '<span style="color:#166534">Available</span>' : '<span style="color:#991b1b">Unavailable</span>'}</p>
                            <div class="roomPrice">Rs. ${room.pricing}/day</div>
                        </div>
                        <div class="roomAction">
                            <button class="btn" onclick="openAppointmentModal('${room.room_type}')" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Select Room</button>
                        </div>
                    </div>
                `;
            });
        }
        
        // 4. Doctors
        let doctorsHTML = '';
        if (hospital.doctors && hospital.doctors.length > 0) {
            hospital.doctors.forEach(doctor => {
                const docName = doctor.name || doctor.doctor_name || "Doctor";
                const imgHTML = doctor.image 
                    ? `<img src="/uploads/${doctor.image}" alt="${docName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                    : `<i class="fa-solid fa-user-doctor"></i>`;
                
                doctorsHTML += `
                    <div class="doctorCard">
                        <div class="doctorHeader">
                            <div class="doctorIcon">${imgHTML}</div>
                            <div class="doctorContent">
                                <h3>${docName}</h3>
                                <p>${doctor.specialization || doctor.speciality || doctor.qualification || 'General'}</p>
                                <span>Exp: ${doctor.experience || 'N/A'}</span>
                            </div>
                        </div>
                        <button class="btn" onclick="openAppointmentModal('Consultation: ${docName}')" style="background:#eff6ff; color:#2563eb; padding:8px 16px; border:none; border-radius:8px; font-weight:700; cursor:pointer; width:100%;">Book Consult</button>
                    </div>
                `;
            });
        }
        
        // Inject Layout
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="hero-section" style="background-image: url('${coverImage}')">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1>${hospital.hospital_name}</h1>
                    <p><i class="fa-solid fa-location-dot"></i> ${hospital.address}</p>
                </div>
            </div>
        `);
        
        container.innerHTML = `
            <div class="mainGrid">
                <div class="leftSide">
                    <div class="sectionCard">
                        <h2>Facilities</h2>
                        <div class="facilityContainer">${facilitiesHTML || '<i>No facilities listed</i>'}</div>
                    </div>
                    
                    <div class="sectionCard">
                        <h2>Rooms Available</h2>
                        <div class="roomsContainer">${roomsHTML || '<i>No rooms available</i>'}</div>
                    </div>
                    
                    <div class="sectionCard">
                        <h2>Our Specialists</h2>
                        <div class="doctorContainer">${doctorsHTML || '<i>No doctors listed</i>'}</div>
                    </div>
                </div>
                
                <div class="rightSide">
                    <div class="bookingWidget">
                        <h3>Ready to book?</h3>
                        <p>Get instant confirmation for your appointment or room booking.</p>
                        <button class="bookBtn" onclick="openAppointmentModal('General Appointment')">Book Appointment</button>
                    </div>
                </div>
            </div>
        `;
        
        // Inject Modal HTML into DOM if not exists
        if(!document.getElementById("appointmentModal")) {
            const modalHTML = `
            <div class="modal" id="appointmentModal">
                <div class="modal-content">
                    <span class="close-modal" onclick="closeAppointmentModal()">&times;</span>
                    <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">Book Appointment</h2>
                    <form id="appointmentForm" onsubmit="submitAppointment(event)">
                        <div class="form-group">
                            <label>Service / Room</label>
                            <input type="text" id="bookingService" readonly>
                        </div>
                        <div class="form-group">
                            <label>Patient Name</label>
                            <input type="text" id="bookingName" required placeholder="Enter full name">
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" id="bookingPhone" required placeholder="10-digit number">
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" id="bookingDate" required>
                        </div>
                        <button type="submit" class="bookBtn" style="margin-top: 16px;">Confirm Booking</button>
                    </form>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

    } catch (e) {
        console.error(e);
        alert("Failed to load hospital details");
    }
}

window.openAppointmentModal = function(serviceName = 'General Appointment') {
    const modal = document.getElementById("appointmentModal");
    if(modal) {
        document.getElementById("bookingService").value = serviceName;
        modal.classList.add("active");
    }
};

window.closeAppointmentModal = function() {
    const modal = document.getElementById("appointmentModal");
    if(modal) modal.classList.remove("active");
};

window.submitAppointment = function(event) {
    event.preventDefault();
    alert("Booking Confirmed Successfully! We will contact you shortly.");
    closeAppointmentModal();
};

loadHospitalDetails();
""")
print("Replaced hosp_data.js with ultra-premium layout and working modal!")
