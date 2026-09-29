with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("openAppointmentModal('${room.room_type}')", "openAppointmentModal('${room.room_type}', ${room.pricing || 1000}, 'room')")
content = content.replace("openAppointmentModal('Consultation: ${docName}')", "openAppointmentModal('Consultation: ${docName}', ${doctor.fees || doctor.consultation_fee || 500}, 'consultation')")

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated openAppointmentModal arguments!")
