import re

with open('js/hosp_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the block:
content = re.sub(r'alert\("Booking is temporarily disabled.*?\);\s*return;', '', content, flags=re.DOTALL)
content = re.sub(r'alert\("Live Lab availability check requires real-time Lab API integration.*?\);\s*return;', '', content, flags=re.DOTALL)
content = re.sub(r'alert\("Booking is temporarily disabled. Live .*? API integration, which is coming soon."\);\s*return;', '', content, flags=re.DOTALL)


with open('js/hosp_data.js', 'w', encoding='utf-8') as f:
    f.write(content)
