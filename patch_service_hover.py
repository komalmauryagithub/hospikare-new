import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add animations for service card specifically
hover_animations = '''
/* Specific Service Card Animations */
.service-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: #3b82f6;
    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.15), 0 10px 20px -5px rgba(37, 99, 235, 0.1);
}
.service-card a {
    transition: all 0.3s ease;
    color: #1d4ed8;
}
.service-card:hover a {
    color: #2563eb;
    letter-spacing: 0.5px;
}
.service-card:hover a i {
    transform: translateX(6px);
}
.service-card a i {
    transition: transform 0.3s ease;
}
.service-icon-wrap {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
.service-card:hover .service-icon-wrap {
    background: #2563eb !important;
    color: #ffffff !important;
    transform: scale(1.15) rotate(-5deg);
    border-radius: 12px;
}
'''

content += hover_animations

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added service card hover animations!")
