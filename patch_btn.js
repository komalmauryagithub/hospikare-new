const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');
code = code.replace(/class="btn btn-primary" style="width: 100%; text-decoration: none; display: flex; justify-content: center;"/g, 'class="btn btn-primary" style="text-decoration: none;"');
code = code.replace(/<div class="bedsCount">[\s\S]*?<i class="fa-solid fa-bed"><\/i>[\s\S]*?<span>\$\{escapeHtml\(hospital\.totalBeds \|\| 0\)\} Beds<\/span>[\s\S]*?<\/div>/g, 
'<div class="hospitalBeds" style="font-weight: 800; font-size: 16px; color: #0f172a;"><i class="fa-solid fa-bed" style="color: #64748b; font-size: 14px; margin-right: 4px;"></i> ${escapeHtml(hospital.totalBeds || 0)} Beds</div>');
fs.writeFileSync('js/users.js', code);
