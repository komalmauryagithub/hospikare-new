import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix doctor name fallback
old_doc_html = '''<h3>
                                ${doctor.doctor_name}
                            </h3>'''
new_doc_html = '''<h3>
                                ${doctor.name || doctor.doctor_name || "Doctor"}
                            </h3>'''
content = content.replace(old_doc_html, new_doc_html)

# Add fallback images if none exist
old_images_html = '''let imagesHTML = '';
        if(hospital.hospital_images.length > 0){
            hospital.hospital_images.forEach(image => {
                imagesHTML += `
                    <img src="/uploads/${image}" alt="">
                `;
            });
        }'''
new_images_html = '''let imagesHTML = '';
        if(hospital.hospital_images && hospital.hospital_images.length > 0){
            hospital.hospital_images.slice(0, 3).forEach(image => {
                imagesHTML += `<img src="/uploads/${image}" alt="">`;
            });
        } else {
            imagesHTML = `<img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" alt="Hospital">
                          <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop" alt="Hospital">
                          <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop" alt="Hospital">`;
        }'''
content = content.replace(old_images_html, new_images_html)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed hosp_data.js bugs!")
