const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');

// Replace the View Details button with Book
code = code.replace(
    '<button class="btn btn-primary" type="button" data-action="view-lab" data-id="${escapeAttr(lab.id)}">View Details</button>',
    '<button class="btn btn-primary" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test="${escapeAttr(lab.lab_name)}" data-price="${escapeAttr(lab.test_price || 500)}">Book</button>'
);

fs.writeFileSync('js/users.js', code);
console.log('Reverted to Book button in users.js');
