import re

for file in ['users.html', 'act.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the modal-content of the userProfileModal and add position: relative
    content = content.replace('id="userProfileModal">\n        <div class="modal-content" style="max-width: 350px; text-align: center; border-radius: 24px; padding: 40px 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);"', 
                              'id="userProfileModal">\n        <div class="modal-content" style="position: relative; max-width: 350px; text-align: center; border-radius: 24px; padding: 40px 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);"')
    
    # Update the close button style
    content = content.replace('<span class="close-modal" id="closeProfileModal">&times;</span>',
                              '<span class="close-modal" id="closeProfileModal" style="position: absolute; top: 16px; right: 20px; font-size: 24px; cursor: pointer; border: none; background: transparent; padding: 0;">&times;</span>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated close button position in modals!")
