import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Fix triggerText ReferenceError
    target_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }"""
    replacement_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            const triggerText = document.getElementById('profileTriggerText');
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
                triggerText.innerHTML = (isComplete ? '<i class="fa-solid fa-user-check"></i> ' : '<i class="fa-solid fa-user-pen"></i> ') + triggerText.innerText;
            }"""
    js = js.replace(target_trigger, replacement_trigger)
    
    # 2. Remove the old duplicate vendorProfileForm submit (the one with password check)
    bad_submit = """document.getElementById("vendorProfileForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const password = document.getElementById("profilePassword")?.value || "";
    const confirmPassword = document.getElementById("profileConfirmPassword")?.value || "";
    if (password && password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    const formData = new FormData(form);
    if (!password) formData.delete("password");
    const response = await fetch('/api/user/profile', { method: 'PUT', credentials: 'include', body: formData });
    const result = await response.json();
    if (result.success) {
        alert("Profile updated successfully");
        closeProfileModal();
        await loadUserProfile();
    } else {
        alert(result.message || "Profile update failed");
    }
});"""
    js = js.replace(bad_submit, "")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f"Fixed {filename}")

fix_file('js/mdeq.js')
fix_file('js/mdc.js')
