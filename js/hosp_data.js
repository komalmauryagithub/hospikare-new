const params = new URLSearchParams(window.location.search);
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
                
                let roomImagesHTML = '';
                if(room.images && room.images.length > 0){
                    roomImagesHTML = `<div class="roomImageGallery">`;
                    room.images.forEach(img => {
                        roomImagesHTML += `<img src="/uploads/${img}" alt="${room.room_type}" class="roomImg" onclick="openImageViewer(this.src)">`;
                    });
                    roomImagesHTML += `</div>`;
                }
                
                const bedText = room.bed_type && room.bed_type !== "undefined" ? room.bed_type : "Standard";

                roomsHTML += `
                    <div class="roomCard" style="display:flex; flex-direction:column; gap:20px; padding: 24px; text-align: left;">
                        <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                            <div class="roomInfo">
                                <h3 style="font-size: 20px; color: #0f172a; margin-bottom: 6px;">${room.room_type}</h3>
                                <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
                                    ${bedText} <span style="margin: 0 8px; color: #cbd5e1;">|</span> 
                                    ${isAvailable ? '<span style="color:#166534; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Available</span>' : '<span style="color:#991b1b; font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Unavailable</span>'}
                                </p>
                                <div class="roomPrice" style="font-size: 22px; font-weight: 800; color: #2563eb;">Rs. ${room.pricing}<span style="font-size:14px; color:#64748b; font-weight:500;">/day</span></div>
                            </div>
                            <div class="roomAction">
                                <button class="btn" onclick="openAppointmentModal('${room.room_type}', ${room.pricing || 1000}, 'room')" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed; background:#f1f5f9; color:#94a3b8;"' : 'style="padding: 12px 28px;"'}>Select Room</button>
                            </div>
                        </div>
                        ${roomImagesHTML}
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
                        <button class="btn" onclick="openAppointmentModal('Consultation: ${docName}', ${doctor.fees || doctor.consultation_fee || 500}, 'consultation')" style="background:#eff6ff; color:#2563eb; padding:8px 16px; border:none; border-radius:8px; font-weight:700; cursor:pointer; width:100%;">Book Consult</button>
                    </div>
                `;
            });
        }
        
        // Inject Layout
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="hero-section" style="background-image: url('${coverImage}')">
                <div class="hero-overlay"></div>
                <button onclick="window.location.href='/users.html'" class="back-btn-float">
                    <i class="fa-solid fa-arrow-left"></i> Back
                </button>
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
                if(!document.getElementById("imageViewerModal")) {
            const viewerHTML = `
            <div class="modal" id="imageViewerModal" style="z-index: 10000; background: rgba(15, 23, 42, 0.95); position: fixed; inset: 0; display: none; align-items: center; justify-content: center;">
                <span onclick="document.getElementById('imageViewerModal').style.display='none'; document.getElementById('imageViewerModal').classList.remove('active');" style="position: absolute; top: 20px; right: 40px; color: white; font-size: 60px; font-weight: 300; cursor: pointer; z-index: 10001; line-height: 1;">&times;</span>
                <div style="max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
                    <img id="viewerImage" src="" style="max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', viewerHTML);
            
            window.openImageViewer = function(src) {
                document.getElementById("viewerImage").src = src;
                document.getElementById("imageViewerModal").style.display="flex"; document.getElementById("imageViewerModal").classList.add("active");
            };
        }

        
        let roomOptionsHTML = '<option value="">-- Select a Room --</option>';
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
                                <option value="Room Booking">Room Booking</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="roomTypeGroup" style="display:none;">
                            <label>Room Type</label>
                            <select id="bookingRoomType" onchange="updateBookingAmount()">
                                ${roomOptionsHTML}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Patient Full Name</label>
                            <input type="text" id="bookingName" required placeholder="Enter full name">
                        </div>
                        
                        <div style="display:flex; gap:16px;">
                            <div class="form-group" style="flex:1;">
                                <label>Age</label>
                                <input type="number" id="bookingAge" required placeholder="Years" min="0" max="120">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Gender</label>
                                <select id="bookingGender" required style="font-weight:600; background:#f8fafc;">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
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
                                <option value="Full">Full Payment (100%)</option>
                                <option value="Part">Part Payment (Advance 40%)</option>
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

    } catch (e) {
        console.error(e);
        alert("Failed to load hospital details");
    }
}

function getAuthUser() {
    try {
        const raw = localStorage.getItem("productUser") || localStorage.getItem("hk_user");
        return raw ? JSON.parse(raw) : null;
    } catch(e) {
        return null;
    }
}

window.openAuthModal = function() {
    const modal = document.getElementById("authOverlay");
    if(modal) {
        switchAuthTab('login');
        modal.classList.add("active");
        modal.style.display = "flex";
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById("authOverlay");
    if(modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
};

window.switchAuthTab = function(tab) {
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegister = tab === "register";

    loginTab?.classList.toggle("activeTab", !showRegister);
    registerTab?.classList.toggle("activeTab", showRegister);
    loginForm?.classList.toggle("hiddenForm", showRegister);
    registerForm?.classList.toggle("hiddenForm", !showRegister);

    if (loginForm) {
        loginForm.style.display = showRegister ? "none" : "grid";
    }
    if (registerForm) {
        registerForm.style.display = showRegister ? "block" : "none";
    }
};

window.handleAuthLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    
    try {
        const res = await fetch("/api/product-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.user) {
            localStorage.setItem("productUser", JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            closeAuthModal();
            if (window.pendingBooking) {
                const b = window.pendingBooking;
                window.pendingBooking = null;
                openAppointmentModal(b.serviceName, b.price, b.type);
            }
        } else {
            alert(data.message || "Invalid Credentials");
        }
    } catch(err) {
        console.error(err);
        alert("Login failed. Please try again.");
    }
};

window.handleAuthRegister = async function(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("full_name", document.getElementById("regName").value.trim());
    formData.append("email", document.getElementById("regEmail").value.trim());
    formData.append("phone", document.getElementById("regPhone").value.trim());
    formData.append("password", document.getElementById("regPassword").value);
    formData.append("gender", document.getElementById("regGender").value);
    formData.append("dob", document.getElementById("regDob").value);
    formData.append("blood_group", document.getElementById("regBloodGroup").value);
    formData.append("address", document.getElementById("regAddress").value.trim());
    formData.append("city", document.getElementById("regCity").value.trim());
    formData.append("state", document.getElementById("regState").value.trim());
    formData.append("pincode", document.getElementById("regPincode").value.trim());
    
    const photo = document.getElementById("regProfilePhoto");
    if (photo?.files?.[0]) {
        formData.append("profile_photo", photo.files[0]);
    }
    
    try {
        const res = await fetch("/api/product-register", {
            method: "POST",
            credentials: "same-origin",
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert("Registration successful! Please login.");
            const registeredEmail = document.getElementById("regEmail")?.value?.trim();
            document.getElementById("registerForm")?.reset();
            if (registeredEmail && document.getElementById("loginEmail")) {
                document.getElementById("loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } else {
            alert(data.message || "Registration failed");
        }
    } catch(err) {
        console.error(err);
        alert("Registration failed. Please try again.");
    }
};

window.openAppointmentModal = function(serviceName = 'General Appointment', price = 500, type = 'consultation') {
    const user = getAuthUser();
    if (!user) {
        window.pendingBooking = { serviceName, price, type };
        openAuthModal();
        return;
    }

    const modal = document.getElementById("appointmentModal");
    if(modal) {
        document.getElementById("bookingBasePrice").value = price || 500;
        
        if(type === 'room') {
            document.getElementById("bookingService").value = "Room Booking";
            document.getElementById("roomTypeGroup").style.display = "block";
            document.getElementById("bookingRoomType").value = serviceName;
        } else {
            document.getElementById("bookingService").value = "Room Booking";
            document.getElementById("roomTypeGroup").style.display = "block";
            document.getElementById("bookingRoomType").value = "";
        }
        
        // Auto pre-fill user info for ultra smooth UX!
        if (user.full_name) document.getElementById("bookingName").value = user.full_name;
        if (user.phone) document.getElementById("bookingPhone").value = user.phone;
        if (user.gender) {
            const g = user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase();
            document.getElementById("bookingGender").value = g;
        }
        if (user.dob) {
            const birthYear = new Date(user.dob).getFullYear();
            const currentYear = new Date().getFullYear();
            if (birthYear && currentYear > birthYear) {
                document.getElementById("bookingAge").value = currentYear - birthYear;
            }
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
    
    if(mode === "Part") {
        finalPrice = basePrice * 0.40; // 40% advance
    }
    
    document.getElementById("bookingAmountDisplay").textContent = "Rs. " + Math.round(finalPrice);
};

window.closeAppointmentModal = function() {
    const modal = document.getElementById("appointmentModal");
    if(modal) modal.classList.remove("active");
};

window.submitAppointment = async function(event) {
    event.preventDefault();
    
    // Check user authentication
    const user = getAuthUser();
    if(!user) {
        openAuthModal();
        return;
    }
    
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
    
    let basePrice = parseFloat(document.getElementById("bookingBasePrice").value) || 0;
    if(serviceType === "Room Booking") {
        const roomSelect = document.getElementById("bookingRoomType");
        if(roomSelect.selectedIndex > 0) {
            const selectedOption = roomSelect.options[roomSelect.selectedIndex];
            basePrice = parseFloat(selectedOption.getAttribute("data-price")) || 0;
        }
    }
    
    let paid_amount = basePrice;
    if(payment_type === "Part") paid_amount = basePrice * 0.40;
    
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
};

loadHospitalDetails();
