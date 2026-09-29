with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

index_start = content.find('    async function handleInsuranceClaim(event)')
if index_start == -1:
    index_start = content.find('async function handleInsuranceClaim(event)')

index_end = content.find('    }\n    }\n    }\n    }\n})();', index_start)
if index_end == -1:
    index_end = content.find('})();', index_start) - 20 # rough fallback

bottom_code = content[index_start:index_end]

# Remove bottom_code from its original position
content = content[:index_start] + content[index_end:]

# Inject bottom_code at the top
inject_point = content.find('const FALLBACK_IMAGE = "/assets/logo.png";') + len('const FALLBACK_IMAGE = "/assets/logo.png";')
content = content[:inject_point] + '\n\n' + bottom_code + '\n\n' + content[inject_point:]

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Moved all remaining trapped functions to the top!")
