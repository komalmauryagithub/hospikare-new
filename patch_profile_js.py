with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the click listener logic for authOpenBtn
old_click = '''$("#authOpenBtn")?.addEventListener("click", () => {
        if (!state.user) {
            showAuthModal();
        }
    });'''
new_click = '''$("#authOpenBtn")?.addEventListener("click", () => {
        if (!state.user) {
            showAuthModal();
        } else {
            // Populate and show profile modal
            const user = state.user;
            const fName = String(user.full_name || user.name || "User").trim().split(/\\s+/)[0] || "User";
            const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
            
            if ($("#profileModalImg")) $("#profileModalImg").src = photoUrl;
            if ($("#profileModalName")) $("#profileModalName").textContent = user.full_name || "User";
            if ($("#profileModalEmail")) $("#profileModalEmail").textContent = user.email || user.phone || "";
            
            openModal("userProfileModal");
        }
    });
    $("#closeProfileModal")?.addEventListener("click", () => closeModal("userProfileModal"));
    $("#modalLogoutBtn")?.addEventListener("click", () => {
        closeModal("userProfileModal");
        logoutUser();
    });'''

content = content.replace(old_click, new_click)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Wired up Profile Modal in users.js!")
