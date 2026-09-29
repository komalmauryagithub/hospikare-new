import re

with open('css/users.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Professional Navbar Styles
new_nav_styles = '''
/* --- PROFESSIONAL NAVBAR RE-STYLING --- */
.navbar {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid rgba(0,0,0,0.05) !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
}

.nav-links {
    gap: clamp(1rem, 1.2vw, 1.5rem) !important;
}

.nav-links a {
    text-transform: capitalize !important;
    font-size: 0.92rem !important;
    font-weight: 600 !important;
    letter-spacing: 0 !important;
    color: #475569 !important;
    transition: color 0.2s ease;
}

.nav-links a:hover {
    color: #1d4ed8 !important;
}

/* My Orders Highlight */
.nav-links a[href="act.html"] {
    color: #1e40af !important;
    background: #eff6ff;
    padding: 6px 12px;
    border-radius: 8px;
}

#authOpenBtn {
    background: #eff6ff !important;
    color: #1d4ed8 !important;
    border: 1px solid #bfdbfe !important;
    border-radius: 9999px !important;
    font-weight: 700 !important;
    padding: 8px 20px !important;
    font-size: 0.9rem !important;
    box-shadow: none !important;
}

#logoutBtn {
    background: #ffffff !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 9999px !important;
    font-weight: 600 !important;
    padding: 8px 20px !important;
    font-size: 0.9rem !important;
    transition: all 0.2s ease !important;
    box-shadow: none !important;
}

#logoutBtn:hover {
    background: #fee2e2 !important;
    color: #dc2626 !important;
    border-color: #f87171 !important;
}
'''

content += new_nav_styles

with open('css/users.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Navbar styling!")
