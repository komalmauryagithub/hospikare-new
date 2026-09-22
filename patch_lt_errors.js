const fs = require('fs');
let code = fs.readFileSync('js/lt.js', 'utf8');

// Fix triggerText error
code = code.replace(
    'if (triggerText) {',
    'const triggerText = document.getElementById("profileTriggerText");\n            if (triggerText) {'
);

// Fix paymentsResult error
code = code.replace(
    'if(paymentsResult.success){',
    'if(payoutsResult.success){'
);
code = code.replace(
    'paymentsResult.payments,',
    'payoutsResult.payouts,'
);

fs.writeFileSync('js/lt.js', code);
console.log('Fixed errors in lt.js');
