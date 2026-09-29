import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the dropdown text
content = content.replace('<option value="Part Payment">Part Payment (Advance 20%)</option>', '<option value="Part Payment">Part Payment (Advance 40%)</option>')

# Update the JS math logic
old_logic = '''if(mode === "Part Payment") {
        finalPrice = basePrice * 0.20; // 20% advance
    }'''
new_logic = '''if(mode === "Part Payment") {
        finalPrice = basePrice * 0.40; // 40% advance
    }'''
content = content.replace(old_logic, new_logic)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated part payment to 40%!")
