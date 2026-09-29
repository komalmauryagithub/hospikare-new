import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix bed type display and format
old_card_loop = '''hospital.rooms.forEach(room => {
                const isAvailable = room.availability === 'Available';
                
                let roomImagesHTML = '';
                if(room.images && room.images.length > 0){
                    roomImagesHTML = `<div class="roomImageGallery">`;
                    room.images.forEach(img => {
                        roomImagesHTML += `<img src="/uploads/${img}" alt="${room.room_type}" class="roomImg" onclick="window.open(this.src, '_blank')">`;
                    });
                    roomImagesHTML += `</div>`;
                }

                roomsHTML += `
                    <div class="roomCard" style="display:flex; flex-direction:column; gap:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div class="roomInfo">
                                <h3>${room.room_type}</h3>
                                <p>${room.bed_type} Bed | ${isAvailable ? '<span style="color:#166534">Available</span>' : '<span style="color:#991b1b">Unavailable</span>'}</p>
                                <div class="roomPrice">Rs. ${room.pricing}/day</div>
                            </div>
                            <div class="roomAction">
                                <button class="btn" onclick="openAppointmentModal('${room.room_type}')" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Select Room</button>
                            </div>
                        </div>
                        ${roomImagesHTML}
                    </div>
                `;
            });'''

new_card_loop = '''hospital.rooms.forEach(room => {
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
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="roomInfo">
                                <h3 style="font-size: 20px; color: #0f172a; margin-bottom: 6px;">${room.room_type}</h3>
                                <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
                                    ${bedText} <span style="margin: 0 8px; color: #cbd5e1;">|</span> 
                                    ${isAvailable ? '<span style="color:#166534; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Available</span>' : '<span style="color:#991b1b; font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Unavailable</span>'}
                                </p>
                                <div class="roomPrice" style="font-size: 22px; font-weight: 800; color: #2563eb;">Rs. ${room.pricing}<span style="font-size:14px; color:#64748b; font-weight:500;">/day</span></div>
                            </div>
                            <div class="roomAction">
                                <button class="btn" onclick="openAppointmentModal('${room.room_type}')" ${!isAvailable ? 'disabled style="opacity:0.5;cursor:not-allowed; background:#f1f5f9; color:#94a3b8;"' : 'style="padding: 12px 28px;"'}>Select Room</button>
                            </div>
                        </div>
                        ${roomImagesHTML}
                    </div>
                `;
            });'''

content = content.replace(old_card_loop, new_card_loop)

# Add Image Viewer Modal
modal_insertion = '''        if(!document.getElementById("imageViewerModal")) {
            const viewerHTML = `
            <div class="modal" id="imageViewerModal" style="z-index: 10000; background: rgba(15, 23, 42, 0.9);">
                <div class="modal-content" style="max-width: 800px; background: transparent; box-shadow: none; padding: 0;">
                    <span class="close-modal" onclick="document.getElementById('imageViewerModal').classList.remove('active')" style="color: white; top: -40px; right: 0; font-size: 40px;">&times;</span>
                    <img id="viewerImage" src="" style="width: 100%; border-radius: 12px; max-height: 85vh; object-fit: contain;">
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', viewerHTML);
            
            window.openImageViewer = function(src) {
                document.getElementById("viewerImage").src = src;
                document.getElementById("imageViewerModal").classList.add("active");
            };
        }'''

if "imageViewerModal" not in content:
    content = content.replace('if(!document.getElementById("appointmentModal")) {', modal_insertion + '\n\n        if(!document.getElementById("appointmentModal")) {')

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated room format and added image modal in hosp_data.js!")
