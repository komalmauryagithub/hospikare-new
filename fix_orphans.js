const fs = require('fs');

const jsFiles = ['js/hsp.js', 'js/amb.js', 'js/lt.js', 'js/mdc.js', 'js/mdeq.js', 'js/ins.js'];

for (const file of jsFiles) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove the orphaned block
        const regex = /const result = await response\.json\(\);[\s\S]*?\}\);/g;
        
        // Wait, there might be MULTIPLE matches of this if there are other fetch calls.
        // Let's be more specific. We want to remove the one right before // ====== NEW PROFILE FLOW LOGIC ======
        // We can do this by splitting the file.
        
        const parts = content.split('// ====== NEW PROFILE FLOW LOGIC ======');
        if (parts.length > 1) {
            let before = parts[0];
            // Remove the specific orphaned lines in the efore section
            before = before.replace(/const result = await response\.json\(\);\s*if \(result\.success\) \{\s*alert\('Profile updated successfully'\);\s*closeProfileModal\(\);\s*(?:await\s+)?loadUserProfile\(\);\s*\} else \{\s*alert\(result\.message \|\| 'Profile update failed'\);\s*\}\s*\}\);/g, '');
            
            content = before + '// ====== NEW PROFILE FLOW LOGIC ======' + parts[1];
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed ' + file);
        }
    } catch(e) {
        console.log('Error in ' + file + ': ' + e.message);
    }
}
