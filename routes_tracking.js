module.exports = (app, pool) => {
    
    // In-memory store for driver locations. For a real production app, this should be in Redis or DB.
    // Format: { 'TRK-123456': { lat: 19.0760, lng: 72.8777, timestamp: 123456789, status: 'active' } }
    const activeTrips = {};

    // Vendor fetches all active fleet locations
    app.get("/api/tracking/fleet/all", async (req, res) => {
        try {
            // Get all bookings with tracking tokens
            const [bookings] = await pool.query(
                `SELECT b.*, a.vehicle_number, ad.driver_name, ad.mobile_number, ad.driver_photo 
                 FROM user_ambulance_bookings b
                 LEFT JOIN ambulances a ON b.ambulance_id = a.id
                 LEFT JOIN ambulance_drivers ad ON (a.assigned_driver_id = ad.id OR ad.assigned_ambulance_id = a.id)
                 WHERE b.tracking_token IS NOT NULL AND b.booking_status != 'completed'`
            );

            const fleet = [];
            for (const booking of bookings) {
                const trip = activeTrips[booking.tracking_token];
                if (trip && trip.status === 'active' && trip.lat && trip.lng) {
                    fleet.push({
                        token: booking.tracking_token,
                        lat: trip.lat,
                        lng: trip.lng,
                        last_updated: trip.timestamp,
                        driver_name: booking.driver_name || 'Unknown Driver',
                        driver_photo: booking.driver_photo,
                        vehicle_number: booking.vehicle_number || 'Unknown Vehicle',
                        patient: booking.patient_name,
                        pickup: booking.pickup_address,
                        destination: booking.destination_address,
                        booking_status: booking.booking_status
                    });
                }
            }

            res.json({ success: true, fleet });
        } catch(e) {
            console.error(e);
            res.status(500).json({ success: false, message: "Server error" });
        }
    });

    // Driver updates their location
    app.post("/api/tracking/:token/location", (req, res) => {
        const { token } = req.params;
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "Missing coordinates" });
        }

        activeTrips[token] = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timestamp: Date.now(),
            status: activeTrips[token] ? activeTrips[token].status : 'active'
        };

        res.json({ success: true, message: "Location updated" });
    });

    // User or Admin fetches the driver's location
    app.get("/api/tracking/:token/location", async (req, res) => {
        const { token } = req.params;

        // Optionally, verify token exists in DB
        const [booking] = await pool.query(
            `SELECT b.*, ad.driver_name, ad.mobile_number as driver_phone, ad.driver_photo, a.ambulance_type
             FROM user_ambulance_bookings b
             LEFT JOIN ambulances a ON b.ambulance_id = a.id
             LEFT JOIN ambulance_drivers ad ON (a.assigned_driver_id = ad.id OR ad.assigned_ambulance_id = a.id)
             WHERE b.tracking_token = ? LIMIT 1`, 
            [token]
        );

        if (booking.length === 0) {
            return res.status(404).json({ success: false, message: "Invalid tracking token" });
        }

        const trip = activeTrips[token];
        if (!trip) {
            return res.json({ success: true, active: false, message: "Driver hasn't shared location yet", booking: booking[0] });
        }

        res.json({ 
            success: true, 
            active: trip.status === 'active',
            lat: trip.lat, 
            lng: trip.lng, 
            last_updated: trip.timestamp,
            booking: booking[0]
        });
    });

    // Driver accepts trip
    app.post("/api/tracking/:token/accept", async (req, res) => {
        const { token } = req.params;

        // Initialize active trip if not exist
        if (!activeTrips[token]) {
            activeTrips[token] = { lat: null, lng: null, timestamp: Date.now(), status: 'active' };
        } else {
            activeTrips[token].status = 'active';
        }

        try {
            const [booking] = await pool.query(
                "SELECT ambulance_id FROM user_ambulance_bookings WHERE tracking_token = ?", 
                [token]
            );
            if (booking.length > 0 && booking[0].ambulance_id) {
                await pool.execute(
                    "UPDATE ambulances SET status = 'Busy / On trip' WHERE id = ?",
                    [booking[0].ambulance_id]
                );
                await pool.execute(
                    "UPDATE user_ambulance_bookings SET booking_status = 'accepted' WHERE tracking_token = ?",
                    [token]
                );
            }
        } catch (e) {
            console.error("Error updating ambulance status on accept:", e);
        }

        res.json({ success: true, message: "Trip accepted" });
    });

    // Update trip phase/status (e.g. arrived)
    app.post("/api/tracking/:token/status", async (req, res) => {
        const { token } = req.params;
        const { status } = req.body;
        
        try {
            await pool.execute(
                "UPDATE user_ambulance_bookings SET booking_status = ? WHERE tracking_token = ?",
                [status, token]
            );
            res.json({ success: true, message: "Status updated to " + status });
        } catch (e) {
            console.error(e);
            res.json({ success: false, message: "Error updating status" });
        }
    });

    // Driver completes trip
    app.post("/api/tracking/:token/complete", async (req, res) => {
        const { token } = req.params;

        if (activeTrips[token]) {
            activeTrips[token].status = 'completed';
        }

        const [booking] = await pool.query(
            "SELECT ambulance_id FROM user_ambulance_bookings WHERE tracking_token = ?", 
            [token]
        );

        if (booking.length > 0) {
            // Update ambulance back to available
            await pool.execute(
                "UPDATE ambulances SET status = 'Available' WHERE id = ?",
                [booking[0].ambulance_id]
            );
            await pool.execute(
                "UPDATE user_ambulance_bookings SET booking_status = 'completed' WHERE tracking_token = ?",
                [token]
            );
        }

        res.json({ success: true, message: "Trip completed" });
    });
};
