with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

index = content.find('function toast(message)')
print("First toast function at index:", index)

end_of_toast = content.find('}', index + 300)
print(content[index:end_of_toast+150])

