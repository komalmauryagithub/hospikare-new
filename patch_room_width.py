with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div style="display:flex; justify-content:space-between; align-items:center;">', '<div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">')

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added width: 100% to inner room div!")
