const params = new URLSearchParams(window.location.search);
const hospitalId = params.get("id");

async function loadHospitalDetails(){
    try{
        const response = await fetch(`/api/hospital/${hospitalId}`);
        const data = await response.json();
        if(!data.success){
            alert("Hospital not found");
            return;
        }
        const hospital = data.hospital;
        const container = document.getElementById(
            "hospitalDetailsContainer"
        );
        let facilitiesHTML = '';
        if(hospital.facilities){
            hospital.facilities
            .split(',')
            .forEach(facility => {
                facilitiesHTML += `
                    <span>
                        ${facility.trim()}
                    </span>
                `;
            });
        }
        let roomsHTML = '';
        if(hospital.rooms.length > 0){
            hospital.rooms.forEach(room => {
                let roomImagesHTML = '';
                if(room.images && room.images.length > 0){
                    roomImagesHTML = `<div class="roomImageGallery">`;
                    room.images.forEach(img => {
                        roomImagesHTML += `<img src="/uploads/${img}" alt="${room.room_type} room" class="roomImg" onclick="openRoomImage(this.src)">`;
                    });
                    roomImagesHTML += `</div>`;
                }
                roomsHTML += `
                    <div class="roomCard">
                        <div class="roomLeft" style="width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3>
                                    ${room.room_type}
                                </h3>
                                <div class="
                                    availability
                                    ${room.availability === 'Available'
                                        ? 'available'
                                        : 'unavailable'
                                    }
                                ">
                                    ${room.availability}
                                </div>
                            </div>
                            <p>
                                ₹${room.pricing}/day
                            </p>
                            ${roomImagesHTML}
                        </div>
                    </div>
                `;
            });
        }
        let doctorsHTML = '';
        if(hospital.doctors.length > 0){
            hospital.doctors.forEach(doctor => {
                doctorsHTML += `
                    <div class="doctorCard">
                        <div class="doctorIcon" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f1f5f9;">
                            ${doctor.image 
                                ? `<img src="/uploads/${doctor.image}" alt="${doctor.doctor_name}" style="width: 100%; height: 100%; object-fit: cover;">` 
                                : `<i class="fa-solid fa-user-doctor"></i>`
                            }
                        </div>
                        <div class="doctorContent">
                            <h3>
                                ${doctor.doctor_name}
                            </h3>
                            <p>
                                ${doctor.qualification}
                            </p>
                            <span>
                                Experience:
                                ${doctor.experience}
                            </span>
                        </div>
                    </div>
                `;
            });
        }
        let imagesHTML = '';
        if(hospital.hospital_images.length > 0){
            hospital.hospital_images.forEach(image => {
                imagesHTML += `
                    <img src="/uploads/${image}" alt="">
                `;
            });
        }
        container.innerHTML = `
            <div class="hospitalBanner">
                <div class="bannerImages">
                    ${imagesHTML}
                </div>
                <div class="bannerContent">
                    <div>
                        <h1>
                            ${hospital.hospital_name}
                        </h1>
                        <p class="hospitalAddress">
                            <i class="fa-solid fa-location-dot"></i>
                            ${hospital.address}
                        </p>
                    </div>
                    <button class="bookBtn" onclick="openAppointmentModal()">
                        Book Appointment
                    </button>
                </div>
            </div>
            <div class="mainGrid">
                <div class="leftSide">
                    <div class="sectionCard">
                        <h2>
                            Facilities
                        </h2>
                        <div class="facilityContainer">
                            ${facilitiesHTML}
                        </div>
                    </div>
                    <div class="sectionCard">
                        <h2>
                            Rooms Available
                        </h2>
                        <div class="roomsContainer">
                            ${roomsHTML}
                        </div>
                    </div>
                </div>
                <div class="rightSide">
                    <div class="sectionCard">
                        <h2>
                            Doctors
                        </h2>
                        <div class="doctorContainer">
                            ${doctorsHTML}
                        </div>
                    </div>
                </div>
            </div>

            <div class="appointmentModal" id="appointmentModal">
                <div class="appointmentBox">
                    <div class="appointmentTop">
                        <h2>
                            Book Appointment
                        </h2>
                        <button class="closeModalBtn" onclick="closeAppointmentModal()">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <form class="appointmentForm" id="appointmentForm">
                        <div class="inputGroup">
                            <label>Patient Name</label>
                            <input type="text"
                            id="patientName"
                            required>
                        </div>
                        <div class="inputGroup">
                            <label>Patient Age</label>
                            <input type="number"
                            id="patientAge"
                            required>
                        </div>
                        <div class="inputGroup">
                            <label>Gender</label>
                            <select id="patientGender" required>
                                <option value="">
                                    Select Gender
                                </option>
                                <option value="Male">
                                    Male
                                </option>
                                <option value="Female">
                                    Female
                                </option>
                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div class="inputGroup">
                            <label>Room Type</label>
                            <select id="roomType" required>
                                ${hospital.rooms.map(room => `
                                    <option value="${room.room_type}">
                                        ${room.room_type}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="inputGroup">
                            <label>Bed Type</label>
                            <select id="bedType" required>
                                <option value="Single Bed">Single Bed</option>
                                <option value="Twin Bed">Twin Bed</option>
                                <option value="Double Bed">Double Bed</option>
                                <option value="Electric/Hospital Bed">Electric/Hospital Bed</option>
                                <option value="ICU Bed">ICU Bed</option>
                            </select>
                        </div>
                        <div class="priceBox">
                            <h3>
                                Room Price:
                                <span id="roomPrice">
                                    ₹0
                                </span>
                            </h3>
                            <h3>
                                Total Amount:
                                <span id="totalAmount">
                                    ₹0
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
                                <span>Paying Now: <strong id="payingNowDisplay">₹0</strong></span>
                                <span>Remaining: <strong id="remainingDisplay">₹0</strong></span>
                            </div>
                        </div>
                        <button type="submit"
                        class="submitAppointmentBtn">
                            Confirm Booking
                        </button>
                    </form>
                </div>
            </div>
        `;

const roomTypeSelect =
document.getElementById(
    "roomType"
);

const roomPrice =
document.getElementById(
    "roomPrice"
);

const totalAmount =
document.getElementById(
    "totalAmount"
);

function updateRoomPrice(){

    const selectedRoom =
    hospital.rooms.find(
        room =>
        room.room_type ===
        roomTypeSelect.value
    );

    if(!selectedRoom){
        return;
    }

    const roomCost =
    Number(selectedRoom.pricing);

    roomPrice.innerText =
    `₹${roomCost}`;

    totalAmount.innerText =
    `₹${roomCost}`;

}

roomTypeSelect.addEventListener(
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
            payingNowDisplay.innerText = '₹0';
            remainingDisplay.innerText = totalAmount.innerText;
        } else {
            partPaymentSection.style.display = 'none';
            partPayError.style.display = 'none';
        }
    });
});

if (partPayAmountInput) {
    partPayAmountInput.addEventListener('input', function() {
        const total = Number(totalAmount.innerText.replace('₹',''));
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
        
        payingNowDisplay.innerText = '₹' + entered;
        remainingDisplay.innerText = '₹' + Math.max(0, total - entered);
    });
}

const appointmentForm =
document.getElementById("appointmentForm");
appointmentForm.addEventListener(
    "submit",
    async function(e){
        e.preventDefault();

        

        const savedUser =
        JSON.parse(
            localStorage.getItem(
                "productUser"
            )
        );

        if(!savedUser){

            alert(
                "Please login first"
            );

            return;

        }

const formData = {

    user_id:savedUser.id,

    hospital_id:hospitalId,

    patient_name:
    document.getElementById(
        "patientName"
    ).value,

    patient_age:
    document.getElementById(
        "patientAge"
    ).value,

    patient_gender:
    document.getElementById(
        "patientGender"
    ).value,

    room_type:
    document.getElementById(
        "roomType"
    ).value,

    bed_type:
    document.getElementById(
        "bedType"
    ).value,

    total_amount:
    totalAmount.innerText
    .replace("₹","")

};
try{
    const fullTotal = Number(totalAmount.innerText.replace("₹",""));
    const selectedPayType = document.querySelector('input[name="paymentType"]:checked')?.value || 'Full';
    let amount = fullTotal;
    
    if (selectedPayType === 'Part' || selectedPayType === 'part') {
        const partVal = Number(document.getElementById('partPayAmount')?.value || 0);
        const minRequired = Math.ceil(fullTotal / 2);
        if (partVal < minRequired) {
            alert('Minimum payment is ₹' + minRequired + ' (50% of total amount)');
            return;
        }
        if (partVal > fullTotal) {
            alert('Payment amount cannot exceed total amount');
            return;
        }
        amount = partVal;
    }
    
    formData.payment_type = selectedPayType === 'part' ? 'Part' : (selectedPayType === 'full' ? 'Full' : selectedPayType);
    formData.paid_amount = amount;
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
    );

    const orderData =
    await orderResponse.json();

    if(!orderData.success){

        alert("Order creation failed");

        return;

    }

    const pendingData = {
        ...formData,
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: "pending",
        razorpay_signature: "pending"
    };

    try {
        await fetch("/api/book-hospital", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pendingData)
        });
    } catch(err) {
        console.error("Failed to save pending booking", err);
    }

    const options = {

        key:orderData.key,

        amount:
        orderData.order.amount,

        currency:"INR",

        name:"Hospital Booking",
        description:"Hospital Room Booking Payment",
        order_id:orderData.order.id,
        handler:async function(response){
            const paymentData = {
                ...formData,
                razorpay_order_id:
                response.razorpay_order_id,
                razorpay_payment_id:
                response.razorpay_payment_id,
                razorpay_signature:
                response.razorpay_signature
            };
            const bookingResponse =
            await fetch("/api/book-hospital", {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:JSON.stringify(paymentData)
                }
            );
            const bookingData = await bookingResponse.json();
            if(bookingData.success){
                alert("Payment Successful & Booking Confirmed");
                closeAppointmentModal();
                appointmentForm.reset();
            }
            else{
                alert(bookingData.message);
            }
        },
        prefill:{
            name:
            formData.patient_name
        },
        theme:{
            color:"#2563eb"
        }
    };
    const razorpay =
    new Razorpay(options);
    razorpay.open();
    
    alert("Your booking is accepted! Complete the payment to fully confirm it.");
    closeAppointmentModal();
    appointmentForm.reset();
}
catch(error){
    console.log(error);
}

    }
);
    }
    catch(error){
        console.log(error);
    }
}
loadHospitalDetails();

function openAppointmentModal(){
    document
    .getElementById("appointmentModal")
    .classList.add("active");
}

function closeAppointmentModal(){
    document
    .getElementById("appointmentModal")
    .classList.remove("active");
}

function openRoomImage(src){
    let overlay = document.getElementById('roomImageOverlay');
    if(!overlay){
        overlay = document.createElement('div');
        overlay.id = 'roomImageOverlay';
        overlay.className = 'roomImageOverlay';
        overlay.innerHTML = `
            <button class="roomOverlayClose" onclick="closeRoomImage()">&times;</button>
            <img id="roomOverlayImg" src="" alt="Room Image">
        `;
        overlay.addEventListener('click', function(e){
            if(e.target === overlay) closeRoomImage();
        });
        document.body.appendChild(overlay);
    }
    document.getElementById('roomOverlayImg').src = src;
    overlay.classList.add('active');
}

function closeRoomImage(){
    const overlay = document.getElementById('roomImageOverlay');
    if(overlay) overlay.classList.remove('active');
}

