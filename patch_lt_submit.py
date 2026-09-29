import re

with open('js/lt.js', 'r', encoding='utf-8') as f:
    js = f.read()

submit_listener = """
document.getElementById('vendorProfileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    
    const formData = new FormData(form);
    
    const submitBtn = document.getElementById('saveProfileBtn') || form.querySelector('button[type="submit"]');
    const origText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
        const response = await fetch('/api/user/profile', { 
            method: 'PUT', 
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            alert('Vendor Profile saved successfully!');
            closeProfileModal();
            await loadUserProfile();
        } else {
            alert(result.message || 'Profile save failed');
        }
    } catch (err) {
        console.error("Error saving profile:", err);
        alert('An error occurred while saving profile');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    }
});
"""

if "vendorProfileForm')?.addEventListener" not in js:
    js += "\n" + submit_listener
    with open('js/lt.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Added vendorProfileForm submit listener to lt.js")
else:
    print("Listener already exists")
