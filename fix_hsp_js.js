const fs = require('fs');
let hspJs = fs.readFileSync('js/hsp.js', 'utf8');

// 1. Append hospital_type and hospital_ownership in hospitalForm submit
const oldFormSubmit = `        formData.append(
            "facilities",
            document.getElementById("hospital_facilities").value
        );`;

const newFormSubmit = `        formData.append(
            "facilities",
            document.getElementById("hospital_facilities").value
        );
        formData.append(
            "hospital_type",
            document.getElementById("add_hospital_type") ? document.getElementById("add_hospital_type").value : "General Hospital"
        );
        formData.append(
            "hospital_ownership",
            document.getElementById("add_hospital_ownership") ? document.getElementById("add_hospital_ownership").value : "Private"
        );`;

hspJs = hspJs.replace(oldFormSubmit, newFormSubmit);

// 2. Enhance auto-fill logic in openProfileModal
const oldAutoFillRegex = /\/\/ Auto-fill form when entity is selected\s*select\.addEventListener\('change', async \(e\) => \{[\s\S]*?\}\s*\}\s*\}\s*\}\);\s*\}\s*\}/;

const newAutoFill = `// Auto-fill form when entity is selected
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
                                      
                                      // Explicit matching for hospital_type dropdown
                                      if (result.data.hospital_type) {
                                          const typeSelect = form.querySelector('select[name="hospital_type"]');
                                          if (typeSelect) {
                                              for (let i = 0; i < typeSelect.options.length; i++) {
                                                  if (typeSelect.options[i].value.toLowerCase() === result.data.hospital_type.toLowerCase() || typeSelect.options[i].text.toLowerCase() === result.data.hospital_type.toLowerCase()) {
                                                      typeSelect.selectedIndex = i;
                                                      break;
                                                  }
                                              }
                                          }
                                      }
                                      
                                      // Explicit matching for hospital_ownership dropdown
                                      if (result.data.hospital_ownership) {
                                          const ownSelect = form.querySelector('select[name="hospital_ownership"]');
                                          if (ownSelect) {
                                              for (let i = 0; i < ownSelect.options.length; i++) {
                                                  if (ownSelect.options[i].value.toLowerCase() === result.data.hospital_ownership.toLowerCase() || ownSelect.options[i].text.toLowerCase() === result.data.hospital_ownership.toLowerCase()) {
                                                      ownSelect.selectedIndex = i;
                                                      break;
                                                  }
                                              }
                                          }
                                      }
                                  }
                              } catch(err) { console.error(err); }
                          });
                      }
                  }
              });
      }
  }`;

hspJs = hspJs.replace(oldAutoFillRegex, newAutoFill);

fs.writeFileSync('js/hsp.js', hspJs, 'utf8');
console.log('Updated js/hsp.js with hospital_type and ownership handling');
