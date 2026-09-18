const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

const newEndpoint = `
// Full edit ambulance
app.post("/api/update/ambulance/:id",
  upload.fields([
    { name: "lic", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "veh_ins", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: "Login Required" });
      }
      const body = req.body;
      const userId = req.session.user.id;
      const ambId = req.params.id;

      await pool.query(
        \x60UPDATE ambulances SET
          ambulance_type = ?,
          base_chrge = ?,
          min_chrge = ?,
          night_chrg = ?,
          wait_chrg = ?,
          status = ?,
          eta = ?,
          book_time_slot = ?,
          area = ?,
          description = ?,
          vehicle_number = ?,
          lic = COALESCE(?, lic),
          rc = COALESCE(?, rc),
          veh_ins = COALESCE(?, veh_ins)
        WHERE id = ? AND users_id = ?\x60,
        [
          body.ambulance_type,
          body.base_chrge,
          body.min_chrge,
          body.night_chrg,
          body.wait_chrg,
          body.status,
          body.eta,
          body.book_time_slot,
          body.area,
          body.description,
          body.vehicle_number || null,
          req.files.lic ? req.files.lic[0].filename : null,
          req.files.rc ? req.files.rc[0].filename : null,
          req.files.veh_ins ? req.files.veh_ins[0].filename : null,
          ambId,
          userId
        ]
      );
      res.json({ success: true, message: "Ambulance updated" });
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: "Server Error" });
    }
  }
);

`;

// Insert before the existing PUT endpoint
serverJs = serverJs.replace(
    'app.put("/api/update/ambulance"',
    newEndpoint + 'app.put("/api/update/ambulance"'
);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('Added POST /api/update/ambulance/:id endpoint');
