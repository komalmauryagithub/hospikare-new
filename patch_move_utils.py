with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where utility functions start
util_start = content.find('    function requireUser() {')
if util_start != -1:
    utils_code = content[util_start:]
    # Remove the 4 extra braces and the IIFE close at the end
    utils_code = utils_code.replace('    }\n    }\n    }\n    }\n})();', '')
    utils_code = utils_code.replace('})();', '')
    
    # Remove the utils from the bottom
    content = content[:util_start] + '\n    }\n    }\n    }\n    }\n})();\n'
    
    # Inject utils right after `const FALLBACK_IMAGE = "/assets/logo.png";`
    inject_point = content.find('const FALLBACK_IMAGE = "/assets/logo.png";') + len('const FALLBACK_IMAGE = "/assets/logo.png";')
    content = content[:inject_point] + '\n\n' + utils_code + '\n\n' + content[inject_point:]
    
    with open('js/users.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Moved utility functions to the top!")
else:
    print("Could not find requireUser")
