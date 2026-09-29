import re

with open('routes_vendor_profile.js', 'r', encoding='utf-8') as f:
    js = f.read()

# At the end of the /api/vendor/complete-profile/:type/:id endpoint, update the user table
target = """            res.json({ success: true, message: 'Profile completed successfully' });
        } catch (e) {"""

replacement = """            // Also mark the vendor's main user profile as completed
            await pool.query('UPDATE users SET vendor_profile_completed = 1 WHERE id = ?', [userId]);
            
            res.json({ success: true, message: 'Profile completed successfully' });
        } catch (e) {"""

js = js.replace(target, replacement)

with open('routes_vendor_profile.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("routes_vendor_profile.js updated to set vendor_profile_completed.")
