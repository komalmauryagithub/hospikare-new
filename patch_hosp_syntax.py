with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the duplicate/unclosed IF block
old_block = '''        if(!document.getElementById("appointmentModal")) {
            let roomOptionsHTML = '<option value="">-- Select a Room --</option>';'''
new_block = '''        let roomOptionsHTML = '<option value="">-- Select a Room --</option>';'''

content = content.replace(old_block, new_block)

with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed SyntaxError by removing extra unclosed if-statement!")
