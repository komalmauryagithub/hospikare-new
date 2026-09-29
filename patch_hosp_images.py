import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the roomsHTML generation loop
old_rooms_loop = '''hospital.rooms.forEach(room => {
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
            });'''

new_rooms_loop = '''hospital.rooms.forEach(room => {
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

content = content.replace(old_rooms_loop, new_rooms_loop)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored room images in hosp_data.js!")
