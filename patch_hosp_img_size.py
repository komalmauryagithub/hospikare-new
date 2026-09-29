with open('css/hosp_data.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('width: 100px;', 'width: 160px;')
content = content.replace('height: 70px;', 'height: 110px;')
content = content.replace('.roomImageGallery {\n    display: flex;', '.roomImageGallery {\n    display: flex;\n    margin-top: 12px;')

with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated roomImg size in CSS!")
