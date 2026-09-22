const fs = require('fs');
const file = 'js/amb.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
                                <option
                                    value="accepted"
                                    \${booking.booking_status === "accepted" ? "selected" : ""}
                                >
                                    Accepted
                                </option>
                                <option
                                    value="arrived"
                                    \${booking.booking_status === "arrived" ? "selected" : ""}
                                >
                                    Arrived
                                </option>`;

content = content.replace(/<option\s+value="accepted"[\s\S]*?>[\s\S]*?Accepted\s*<\/option>/, replacement);
fs.writeFileSync(file, content);
console.log("amb.js updated");
