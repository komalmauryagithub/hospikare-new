import re

with open('users.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div class="input-group"><input type="file" id="regProfilePhoto" class="hk-input" style="padding-top: 10px;"></div>'
replacement = '''<div class="input-group" style="position: relative;">
                            <label style="position: absolute; top: -8px; left: 10px; background: white; padding: 0 5px; font-size: 11px; color: #64748b; font-weight: 600;">Profile Picture</label>
                            <input type="file" id="regProfilePhoto" class="hk-input" style="padding-top: 12px;" accept="image/*">
                        </div>'''

content = re.sub(pattern, replacement, content)

with open('users.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added label to profile photo input!")
