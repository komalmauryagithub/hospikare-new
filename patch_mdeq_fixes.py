import re

with open('js/mdeq.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Remove the bad submit listener for vendorProfileForm
target_bad_listener = """document.getElementById("vendorProfileForm")?.addEventListener("submit", async (event) => {
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
js = js.replace(target_bad_listener, "")

# 2. Fix the trigger text update
target_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            if (triggerText) {
                triggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }"""
replacement_trigger = """            const isComplete = Boolean(result.user?.vendor_profile_completed || (result.user?.bank_account && result.user?.ifsc));
            const pTriggerText = document.getElementById('profileTriggerText');
            if (pTriggerText) {
                pTriggerText.innerText = isComplete ? 'Show Profile' : 'Complete Profile';
            }"""
js = js.replace(target_trigger, replacement_trigger)

with open('js/mdeq.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("js/mdeq.js cleaned up duplicate listener and fixed triggerText.")
