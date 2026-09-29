with open('css/hosp_data.css', 'r', encoding='utf-8') as f:
    content = f.read()

old_css = '''.modal-content {
    background: white;
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 450px;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}'''

new_css = '''.modal-content {
    background: white;
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 450px;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    max-height: 85vh;
    overflow-y: auto;
}
.modal-content::-webkit-scrollbar {
    width: 8px;
}
.modal-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}
'''

content = content.replace(old_css, new_css)

with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated modal-content height and scroll!")
