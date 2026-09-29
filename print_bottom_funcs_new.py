with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

index_end = content.find('async function handleInsuranceClaim(event)')
bottom_chunk = content[index_end:]

import re
funcs = re.findall(r'(?:async )?function \w+\(.*?\)', bottom_chunk)
for f in funcs:
    print(f)
