with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r'@media \(max-width: 640px\) \{([\s\S]*?)\n\}\n', content)
if match:
    print(match.group(1)[1500:3000])
else:
    print("Not found")
