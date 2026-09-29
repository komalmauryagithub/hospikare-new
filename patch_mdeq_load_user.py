import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

target = """            alert('Profile completed successfully!');
            closeProfileModal();
            form.reset();"""
replacement = """            alert('Profile completed successfully!');
            closeProfileModal();
            form.reset();
            if (typeof loadUserProfile === 'function') loadUserProfile();"""
js = js.replace(target, replacement)

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("js/mdeq.js updated to call loadUserProfile.")
