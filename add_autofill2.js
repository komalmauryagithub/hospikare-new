const fs = require('fs');

const jsFiles = ['js/hsp.js', 'js/amb.js', 'js/lt.js', 'js/mdc.js', 'js/mdeq.js', 'js/ins.js'];

for (const file of jsFiles) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        const changeEventLogic = `
                          if (select.options.length === 1) {
                              select.innerHTML = '<option value="">All profiles completed or no entities added.</option>';
                          }
                          
                          // Auto-fill form when entity is selected
                          select.addEventListener('change', async (e) => {
                              const entityId = e.target.value;
                              if (!entityId) return;
                              try {
                                  const res = await fetch('/api/vendor/entity-details/' + entityType + '/' + entityId);
                                  const result = await res.json();
                                  if (result.success && result.data) {
                                      const form = document.getElementById('vendorProfileForm');
                                      for (const key in result.data) {
                                          const input = form.querySelector('[name="' + key + '"]');
                                          if (input && result.data[key]) {
                                              input.value = result.data[key];
                                          }
                                      }
                                  }
                              } catch(err) { console.error(err); }
                          });
`;

        const regex = /if\s*\(select\.options\.length\s*===\s*1\)\s*\{\s*select\.innerHTML\s*=\s*'[^']*';\s*\}/g;
        content = content.replace(regex, changeEventLogic);
        
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    } catch(e) { console.log(e); }
}
