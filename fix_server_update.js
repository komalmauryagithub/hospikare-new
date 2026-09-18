const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const oldFileHandling = `          req.files.lic ? req.files.lic[0].filename : null,
          req.files.rc ? req.files.rc[0].filename : null,
          req.files.veh_ins ? req.files.veh_ins[0].filename : null,`;

const newFileHandling = `          req.files && req.files.lic ? req.files.lic[0].filename : null,
          req.files && req.files.rc ? req.files.rc[0].filename : null,
          req.files && req.files.veh_ins ? req.files.veh_ins[0].filename : null,`;

serverJs = serverJs.replace(oldFileHandling, newFileHandling);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Safely updated file handling in server.js');
