with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block that was injected at line 327
content = content.replace('        }\n    }\n    }\n    }\n})();', '        }\n})();')
content = content.replace('    }\n    }\n    }\n    }\n})();', '})();')

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed incorrectly placed braces!")
