with open('act.html', 'r', encoding='utf-8') as f:
    content = f.read()

profile_modal_html = '''
    <!-- Profile Modal -->
    <div class="modal" id="userProfileModal">
        <div class="modal-content" style="max-width: 350px; text-align: center; border-radius: 24px; padding: 40px 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <span class="close-modal" id="closeProfileModal">&times;</span>
            <div id="profileModalPicContainer" style="margin: 0 auto 20px auto; width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #3b82f6, #8b5cf6);">
                <img id="profileModalImg" src="" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white;">
            </div>
            <h2 id="profileModalName" style="margin: 0 0 4px 0; font-size: 22px; font-weight: 800; color: #0f172a;">User Name</h2>
            <p id="profileModalEmail" style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; font-weight: 500;">user@example.com</p>
            <div style="display: flex; gap: 12px; flex-direction: column;">
                <button class="btn btn-primary" onclick="window.location.href='act.html'" style="width: 100%; border-radius: 12px; height: 44px; font-weight: 700; background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; box-shadow: none; cursor:pointer;">My Orders / Activity</button>
                <button class="btn btn-primary" id="modalLogoutBtn" style="width: 100%; border-radius: 12px; height: 44px; font-weight: 700; background: #fee2e2; color: #dc2626; border: none; box-shadow: none; cursor:pointer;">Logout</button>
            </div>
        </div>
    </div>
'''

index = content.find('</body>')
if index != -1:
    content = content[:index] + profile_modal_html + '\n' + content[index:]
    with open('act.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added Profile Modal to act.html!")

with open('js/act.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace authBtn.onclick
old_onclick = "authBtn.onclick = () => window.location.href = 'users.html';"
new_onclick = '''authBtn.onclick = () => {
                    const fName = String(user.full_name || user.name || "User").trim().split(/\\s+/)[0] || "User";
                    const photoUrl = user.profile_photo ? `/uploads/${user.profile_photo}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                    document.getElementById("profileModalImg").src = photoUrl;
                    document.getElementById("profileModalName").textContent = user.full_name || "User";
                    document.getElementById("profileModalEmail").textContent = user.email || user.phone || "";
                    document.getElementById("userProfileModal").style.display = "flex";
                    document.getElementById("userProfileModal").classList.add("active");
                };
                document.getElementById("closeProfileModal").onclick = () => {
                    document.getElementById("userProfileModal").style.display = "none";
                    document.getElementById("userProfileModal").classList.remove("active");
                };
                document.getElementById("modalLogoutBtn").onclick = () => {
                    localStorage.removeItem("productUser");
                    window.location.href = "users.html";
                };'''

js_content = js_content.replace(old_onclick, new_onclick)
with open('js/act.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("Updated act.js logic!")
