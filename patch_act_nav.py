with open('js/act.js', 'r', encoding='utf-8') as f:
    content = f.read()

avatar_logic = '''
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authOpenBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    try {
        const rawUser = localStorage.getItem('productUser');
        const user = rawUser ? JSON.parse(rawUser) : null;
        if (user) {
            if (authBtn) {
                const fName = String(user.full_name || user.name || "User").trim().split(/\s+/)[0] || "User";
                const photoUrl = user.profile_photo ? `/uploads/${user.profile_photo}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                authBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer;">`;
                authBtn.onclick = () => window.location.href = 'users.html';
            }
            if (logoutBtn) {
                logoutBtn.hidden = false;
                logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
                logoutBtn.onclick = () => {
                    localStorage.removeItem('productUser');
                    window.location.href = 'users.html';
                };
            }
        } else {
            if (authBtn) authBtn.onclick = () => window.location.href = 'users.html';
        }
    } catch(e) {}
});
'''

with open('js/act.js', 'a', encoding='utf-8') as f:
    f.write('\n' + avatar_logic)
print("Added navbar auth logic to act.js!")
