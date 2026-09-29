with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function updateUserUI() {')
end = content.find('function handleAmbulanceBooking(event) {')

new_updateUserUI = '''function updateUserUI() {
    const authOpenBtn = $("#authOpenBtn");
    const logoutBtn = $("#logoutBtn");
    const sidebarLogoutBtn = $("#sidebarLogoutBtn");
    const user = getSavedUser();
    state.user = user;

    if (authOpenBtn) {
        if (user) {
            const fName = firstName(user.full_name || user.name || "User");
            const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
            authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"> <span>Hi, ${escapeHtml(fName)}</span>`;
        } else {
            authOpenBtn.textContent = "Login / Portal";
        }
    }
    
    if (logoutBtn) {
        logoutBtn.hidden = !user;
        if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
    }
    
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.hidden = !user;
    }
}

'''

content = content[:start] + new_updateUserUI + content[end:]

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed updateUserUI syntax error!")
