import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix .rvbtn (icon only button) to look like a premium circle button
pattern_rvbtn = r'\.rvbtn\s*\{[^}]*\}'
replacement_rvbtn = '''.rvbtn {
    width: 44px;
    height: 44px;
    min-height: 44px;
    padding: 0;
    flex: 0 0 44px;
    border: none;
    border-radius: 12px;
    background: #f1f5f9;
    color: var(--user-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.rvbtn:hover {
    background: linear-gradient(135deg, var(--user-blue), #2563EB);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}'''
content = re.sub(pattern_rvbtn, replacement_rvbtn, content)

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Polished .rvbtn!")
