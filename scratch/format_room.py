import re

with open('js/hsp.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_room_box = r"""        roomBox.innerHTML = `
            <button type="button" class="removeRoomBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Room Details</label>
                <input type="text" class="top-search room_details" placeholder="e.g. AC Room with TV" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Pricing</label>
                <input type="number" class="top-search room_pricing" placeholder="Price per night" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Room Type</label>
                <select class="top-search room_type">
                    <option value="General Ward">General Ward</option>
                    <option value="Semi-Private Room">Semi-Private Room</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency Room">Emergency Room</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Bed Type</label>
                <select class="top-search room_bed_type">
                    <option value="Single Bed">Single Bed</option>
                    <option value="Twin Bed">Twin Bed</option>
                    <option value="Double Bed">Double Bed</option>
                    <option value="Electric/Hospital Bed">Electric/Hospital Bed</option>
                    <option value="ICU Bed">ICU Bed</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Total Beds</label>
                <input type="number" class="top-search room_total_beds" placeholder="Total Beds" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Availability</label>
                <select class="top-search room_availability">
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                <label style="font-size: 12px; font-weight: 600;">Room Images</label>
                <input type="file" class="top-search room_images" multiple accept="image/*">
            </div>
        `;"""

new_room_box = r"""        roomBox.innerHTML = `
            <button type="button" class="removeRoomBtn" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: red; cursor: pointer; font-size:16px;" title="Remove Room"><i class="fa-solid fa-trash"></i></button>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Room Details <span style="color:red;">*</span></label>
                <input type="text" class="room_details" placeholder="e.g. AC Room with TV" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Pricing <span style="color:red;">*</span></label>
                <input type="number" class="room_pricing" placeholder="Price per night" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Room Type <span style="color:red;">*</span></label>
                <select class="room_type" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                    <option value="General Ward">General Ward</option>
                    <option value="Semi-Private Room">Semi-Private Room</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency Room">Emergency Room</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Bed Type <span style="color:red;">*</span></label>
                <select class="room_bed_type" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                    <option value="Single Bed">Single Bed</option>
                    <option value="Twin Bed">Twin Bed</option>
                    <option value="Double Bed">Double Bed</option>
                    <option value="Electric/Hospital Bed">Electric/Hospital Bed</option>
                    <option value="ICU Bed">ICU Bed</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Total Beds <span style="color:red;">*</span></label>
                <input type="number" class="room_total_beds" placeholder="Total Beds" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px;" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 12px; font-weight: 600;">Availability <span style="color:red;">*</span></label>
                <select class="room_availability" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; width: 100%; font-size:14px; background:#fff;" required>
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; grid-column: span 2;">
                <label style="font-size: 12px; font-weight: 600;">Room Images</label>
                <input type="file" class="room_images" multiple accept="image/*" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px; width: 100%; font-size:13px; background:#fff;">
            </div>
        `;"""

content = content.replace(old_room_box, new_room_box)

with open('js/hsp.js', 'w', encoding='utf-8') as f:
    f.write(content)
