require("dotenv").config();
const session = require("express-session");
const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const app = express();
const PORT = process.env.PORT || 5000;
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(__dirname));
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "logo.png"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "rg.html"));
});
app.use(
  session({
    secret: "hospikare-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "root",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "hospinew",
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

const safeNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const parseAmount = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
};

const safeString = (val) => {
  if (!val || val.trim() === "") return null;
  return val.trim();
};

const formatUploadPaths = (imageArray) => {
  if (!imageArray) return [];
  if (typeof imageArray === "string") {
    try {
      imageArray = JSON.parse(imageArray);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(imageArray)) return [];
  return imageArray
    .map((img) => {
      if (!img) return null;
      const pathStr = String(img);
      return pathStr.startsWith("/uploads/") ? pathStr : `/uploads/${pathStr}`;
    })
    .filter(Boolean);
};

async function getCommissionPercent(userType) {
  const [rows] = await pool.query(
    `
        SELECT commission_percent
        FROM commissions
        WHERE LOWER(user_type) = LOWER(?)
        `,
    [userType],
  );

  if (rows.length === 0) {
    return 0;
  }

  return Number(rows[0].commission_percent || 0);
}

function calculateCommissionAmount(originalAmount, commissionPercent) {
  const amount = Number(originalAmount || 0);

  const commission = (amount * commissionPercent) / 100;

  const finalAmount = amount - commission;

  return {
    originalAmount: amount,

    commissionPercent,

    commissionAmount: commission,

    finalAmount,
  };
}

const tableColumnsCache = new Map();

async function getTableColumns(tableName) {
  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);

  const columnSet = new Set(columns.map((column) => column.Field));

  tableColumnsCache.set(tableName, columnSet);

  return columnSet;
}

async function insertKnownColumns(tableName, rowData) {
  const columns = await getTableColumns(tableName);

  const entries = Object.entries(rowData).filter(([column]) =>
    columns.has(column),
  );

  if (entries.length === 0) {
    throw new Error(`No valid columns found for ${tableName}`);
  }

  const columnNames = entries.map(([column]) => `\`${column}\``).join(", ");

  const placeholders = entries.map(() => "?").join(", ");

  const values = entries.map(([, value]) => value);

  const [result] = await pool.query(
    `
        INSERT INTO \`${tableName}\`
        (${columnNames})
        VALUES (${placeholders})
        `,
    values,
  );

  return result;
}

function calculateInsurancePremium(monthlyPremium, durationMonths) {
  const months = Math.max(1, Number(durationMonths) || 1);
  let total = parseAmount(monthlyPremium) * months;

  if (months === 3) {
    total -= 200;
  } else if (months === 6) {
    total -= 700;
  } else if (months === 12) {
    total -= 2000;
  }

  return Math.max(total, 0);
}

async function ensureInsuranceClaimTables() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS user_insurance_claims (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT DEFAULT NULL,
            insurance_purchase_id INT DEFAULT NULL,
            hospital_id INT DEFAULT NULL,
            claim_amount DECIMAL(10,2) DEFAULT NULL,
            claim_reason TEXT,
            medical_documents VARCHAR(255) DEFAULT NULL,
            claim_status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY insurance_purchase_id (insurance_purchase_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

//1
app.post(
  "/api/register",
  upload.fields([
    { name: "identity_proof", maxCount: 1 },
    { name: "profile_photo", maxCount: 1 },
    { name: "cheque", maxCount: 1 },
    { name: "hospital_reg_certificate", maxCount: 1 },
    { name: "shop_license", maxCount: 1 },
    { name: "medical_council_registration", maxCount: 1 },
    { name: "electricity_bill", maxCount: 1 },
    { name: "lic", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "veh_ins", maxCount: 1 },
    { name: "lab_reg", maxCount: 1 },
    { name: "nabl", maxCount: 1 },
    { name: "path_qual_cer", maxCount: 1 },
    { name: "incorp_cert", maxCount: 1 },
    { name: "add_proof", maxCount: 1 },
    { name: "drug_lic", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "gst_cer", maxCount: 1 },
    { name: "pharm_cer", maxCount: 1 },
    { name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
    { name: "hospital_images", maxCount: 10 },
    { name: "room_images", maxCount: 100 },
    { name: "doctor_images", maxCount: 100 },
    { name: "pathologist_proofs", maxCount: 100 },
    { name: "pathologist_certs", maxCount: 100 },
    { name: "pathologist_images", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};
      const files = req.files || {};
      const rawUserType = String(body.user_type || "").trim();

      if (!body.name || !String(body.name).trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Full Name is required" });
      }

      if (!body.email_or_contact || !String(body.email_or_contact).trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Email or phone number is required" });
      }

      if (!rawUserType) {
        return res
          .status(400)
          .json({ success: false, message: "Partner type is required" });
      }

      if (!body.password || String(body.password).trim().length < 4) {
        return res
          .status(400)
          .json({ success: false, message: "Password must be at least 4 characters long" });
      }

      const emailContact = String(body.email_or_contact).trim();

      // Check if user already exists
      const [existingUser] = await pool.query(
        "SELECT id FROM users WHERE LOWER(emailorcontact) = LOWER(?)",
        [emailContact]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: "An account with this email/phone already exists. Please sign in.",
        });
      }

      // Check if admin with same email exists
      const [existingAdmin] = await pool.query(
        "SELECT id FROM admin WHERE LOWER(email) = LOWER(?)",
        [emailContact]
      );
      if (existingAdmin.length > 0) {
        return res.status(400).json({
          success: false,
          message: "This email is registered as an admin account. Please sign in.",
        });
      }

      let users_type = rawUserType.toLowerCase();
      if (users_type === "clinic") users_type = "hospital";
      else if (users_type === "pharmacy") users_type = "medicines";
      else if (users_type === "lab" || users_type === "lab test") users_type = "lab test";
      else if (users_type === "equipment" || users_type === "medical equipments" || users_type === "medical equipment") users_type = "medical equipments";
      else if (users_type === "ambulance") users_type = "ambulance";
      else if (users_type === "insurance") users_type = "insurance";
      else if (users_type === "hospital") users_type = "hospital";

      // ==================== CREATE USER ====================
      const [userResult] = await pool.query(
        `INSERT INTO users 
             (name, emailorcontact, identity_proof, profile_photo, bank_account, ifsc, 
              cheque, users_type, password, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
        [
          String(body.name).trim(),
          emailContact,
          files["identity_proof"]?.[0]?.filename || null,
          files["profile_photo"]?.[0]?.filename || null,
          body.bank_account ? String(body.bank_account).trim() : null,
          body.ifsc ? String(body.ifsc).trim() : null,
          files["cheque"]?.[0]?.filename || null,
          users_type,
          String(body.password).trim(),
        ],
      );

      const userId = userResult.insertId;

      const hasHospitalProfileData =
        users_type === "hospital" &&
        (body.hospital_name ||
          body.address ||
          body.facilities ||
          files["hospital_images"]?.length ||
          files["hospital_reg_certificate"]?.length ||
          files["shop_license"]?.length ||
          files["medical_council_registration"]?.length ||
          files["electricity_bill"]?.length);

      const hasAmbulanceProfileData =
        users_type === "ambulance" &&
        (body.ambulance_type ||
          body.base_chrge ||
          body.min_chrge ||
          body.night_chrg ||
          body.wait_chrg ||
          body.area ||
          body.driver_exp ||
          files["lic"]?.length ||
          files["rc"]?.length ||
          files["veh_ins"]?.length);

      const hasLabProfileData =
        (users_type === "lab test" || users_type === "lab") &&
        (body.lab_name ||
          body.address ||
          body.description ||
          body.lab_type ||
          body.test ||
          body.home_coll ||
          body.available_areas ||
          body.lab_hrs ||
          body.test_time ||
          files["lab_reg"]?.length ||
          files["nabl"]?.length ||
          files["path_qual_cer"]?.length ||
          files["pathologist_proofs"]?.length ||
          files["pathologist_certs"]?.length ||
          files["pathologist_images"]?.length);

      const hasInsuranceProfileData =
        users_type === "insurance" &&
        (body.comp_name ||
          body.comp_type ||
          body.description ||
          body.irdai ||
          body.comp_pan ||
          body.gst ||
          body.offc_add ||
          body.claim_type ||
          body.doc_req ||
          body.cust_sup_num ||
          body.email_sup ||
          body.contact_person ||
          body.website ||
          body.ins_price ||
          body.claim_price ||
          files["incorp_cert"]?.length ||
          files["add_proof"]?.length);

      const hasMedicineProfileData =
        (users_type === "medicines" || users_type === "pharmacy") &&
        (body.pharm_name ||
          body.owner_name ||
          body.shop_type ||
          body.description ||
          body.issued_by ||
          body.address ||
          body.location ||
          body.phar_counc_reg ||
          body.shop_hrs ||
          body.avlblty ||
          files["drug_lic"]?.length ||
          files["address_proof"]?.length ||
          files["gst_cer"]?.length ||
          files["pharm_cer"]?.length);

      const hasEquipmentProfileData =
        (users_type === "medical equipments" || users_type === "equipment") &&
        (body.ven_bus_name ||
          body.owner_name ||
          body.business_type ||
          body.description ||
          body.address ||
          body.location ||
          files["address_proof"]?.length ||
          files["qual_cer"]?.length ||
          files["app_comp"]?.length);

      // ==================== HOSPITAL ====================
      if (hasHospitalProfileData) {
        const hospitalImages = files["hospital_images"]
          ? files["hospital_images"].map((file) => file.filename)
          : [];
        let parsedDoctors = [];
        try {
          parsedDoctors = JSON.parse(body.doctors || "[]");
        } catch (e) {}

        const doctorImagesArr = files["doctor_images"] || [];
        let docImgPointer = 0;
        parsedDoctors.forEach((d) => {
          if (d.hasImage) {
            d.image = doctorImagesArr[docImgPointer++]?.filename || null;
          } else {
            d.image = null;
          }
        });

        await insertKnownColumns("hospitals", {
          users_id: userId,
          hospital_images: JSON.stringify(hospitalImages),
          hospital_name: body.hospital_name || body.name,
          address: body.address || null,
          location: body.location || null,
          cordinates: body.coordinates || null,
          facilities: body.facilities || null,
          rooms: body.rooms || null,
          doctors: JSON.stringify(parsedDoctors),
          hospital_reg_certificate:
            files["hospital_reg_certificate"]?.[0]?.filename || null,
          shop_license: files["shop_license"]?.[0]?.filename || null,
          medical_council_registration:
            files["medical_council_registration"]?.[0]?.filename || null,
          electricity_bill:
            files["electricity_bill"]?.[0]?.filename || null,
        });
      }
      // ==================== AMBULANCE ====================
      else if (hasAmbulanceProfileData) {
        await insertKnownColumns("ambulances", {
          users_id: userId,
          ambulance_type: body.ambulance_type || "Basic Life Support (BLS)",
          base_chrge: body.base_chrge || 0,
          min_chrge: body.min_chrge || 0,
          night_chrg: body.night_chrg || 0,
          wait_chrg: body.wait_chrg || 0,
          status: body.status || "Available",
          eta: body.eta || "15 mins",
          book_time_slot: body.book_time_slot || "24x7",
          area: body.area || "City Wide",
          description: body.description || null,
          lic: files["lic"]?.[0]?.filename || null,
          rc: files["rc"]?.[0]?.filename || null,
          driver_exp: body.driver_exp || "3+ years",
          veh_ins: files["veh_ins"]?.[0]?.filename || null,
          map_links: body.amb_lcn || null,
          cordinates: body.amb_crdnt || null,
        });
      }
      // ==================== LAB TEST ====================
      else if (hasLabProfileData) {
        let labTypeArr = [];
        let testArr = [];
        try {
          labTypeArr = JSON.parse(body.lab_type || "[]");
        } catch (e) {
          labTypeArr = body.lab_type ? [body.lab_type] : [];
        }
        try {
          testArr = JSON.parse(body.test || "[]");
        } catch (e) {
          testArr = body.test ? [body.test] : [];
        }

        let parsedPathologists = [];
        try {
          parsedPathologists = JSON.parse(body.pathologist || "[]");
        } catch (e) {}

        const pathProofs = files["pathologist_proofs"] || [];
        const pathCerts = files["pathologist_certs"] || [];
        const pathImages = files["pathologist_images"] || [];
        let proofPtr = 0, certPtr = 0, imgPtr = 0;

        parsedPathologists.forEach((p) => {
          if (p.hasProof) p.proof = pathProofs[proofPtr++]?.filename || null;
          if (p.hasCert) p.certificate = pathCerts[certPtr++]?.filename || null;
          if (p.hasImage) p.image = pathImages[imgPtr++]?.filename || null;
        });

        await insertKnownColumns("labs", {
          users_id: userId,
          lab_name: body.lab_name || body.name,
          address: body.address || null,
          location: body.location || null,
          cordinates: body.cordinates || null,
          description: body.description || null,
          lab_type: JSON.stringify(labTypeArr),
          test: JSON.stringify(testArr),
          home_coll: body.home_coll || "No",
          extra_chrg: safeNumber(body.extra_chrg) || 0,
          available_areas: body.available_areas || null,
          lab_hrs: body.lab_hrs || null,
          test_time: body.test_time || null,
          test_price: safeNumber(body.test_price) || 0,
          emergency_test: body.emergency_test || "No",
          adv_equipment: body.adv_equipment || "No",
          pathologist: JSON.stringify(parsedPathologists),
          lab_reg: files["lab_reg"]?.[0]?.filename || null,
          nabl: files["nabl"]?.[0]?.filename || null,
          path_qual_cer: files["path_qual_cer"]?.[0]?.filename || null,
        });
      }
      // ==================== INSURANCE ====================
      else if (hasInsuranceProfileData) {
        await insertKnownColumns("insurances", {
          users_id: userId,
          comp_name: body.comp_name || body.name,
          comp_type: body.comp_type || "Health Insurance",
          description: body.description || null,
          irdai: body.irdai || null,
          comp_pan: body.comp_pan || null,
          gst: body.gst || null,
          offc_add: body.offc_add || null,
          claim_type: body.claim_type || "Cashless & Reimbursement",
          claim_time: body.claim_time || "24-48 Hours",
          doc_req: body.doc_req || null,
          cust_sup_num: body.cust_sup_num || null,
          email_sup: body.email_sup || null,
          contact_person: body.contact_person || null,
          website: body.website || null,
          ins_price: safeNumber(body.ins_price) || 0,
          claim_price: safeNumber(body.claim_price) || 0,
          incorp_cert: files["incorp_cert"]?.[0]?.filename || null,
          add_proof: files["add_proof"]?.[0]?.filename || null,
        });
      }
      // ==================== MEDICINES ====================
      else if (hasMedicineProfileData) {
        await insertKnownColumns("medicines", {
          users_id: userId,
          pharm_name: body.pharm_name || body.name,
          owner_name: body.owner_name || body.name,
          shop_type: body.shop_type || "Retail Pharmacy",
          description: body.description || null,
          drug_lic: files["drug_lic"]?.[0]?.filename || null,
          issued_by: body.issued_by || null,
          address: body.address || null,
          address_proof: files["address_proof"]?.[0]?.filename || null,
          location: body.location || null,
          cordinates: body.med_crdnt || null,
          phar_counc_reg: body.phar_counc_reg || null,
          prod_avb: body.prod_avb || "[]",
          home_dev: body.home_dev || "Yes",
          dev_area: body.dev_area || null,
          dev_chrg: safeNumber(body.dev_chrg) || 0,
          shop_hrs: body.shop_hrs || "08:00 AM - 10:00 PM",
          avlblty: body.avlblty || "In Stock",
          gst_cer: files["gst_cer"]?.[0]?.filename || null,
          pharm_cer: files["pharm_cer"]?.[0]?.filename || null,
        });
      }
      // ==================== MEDICAL EQUIPMENTS ====================
      else if (hasEquipmentProfileData) {
        await insertKnownColumns("med_equipments", {
          users_id: userId,
          ven_bus_name: body.ven_bus_name || body.name,
          owner_name: body.owner_name || body.name,
          business_type: body.business_type || "Distributor & Supplier",
          description: body.description || null,
          address: body.address || null,
          address_proof: files["address_proof"]?.[0]?.filename || null,
          location: body.location || null,
          cordinates: body.medeq_crdnt || null,
          qual_cer: files["qual_cer"]?.[0]?.filename || null,
          app_comp: files["app_comp"]?.[0]?.filename || null,
        });
      }
      // ==================== DEFAULT INITIALIZATION FOR BASIC REGISTRATION ====================
      else {
        if (users_type === "hospital") {
          await insertKnownColumns("hospitals", {
            users_id: userId,
            hospital_name: body.name || "Hospital",
            address: body.address || "",
            hospital_images: "[]",
            doctors: "[]",
          });
        } else if (users_type === "ambulance") {
          await insertKnownColumns("ambulances", {
            users_id: userId,
            ambulance_type: "Standard",
            status: "Available",
          });
        } else if (users_type === "lab test" || users_type === "lab") {
          await insertKnownColumns("labs", {
            users_id: userId,
            lab_name: body.name || "Diagnostic Lab",
            lab_type: "[]",
            test: "[]",
            pathologist: "[]",
          });
        } else if (users_type === "insurance") {
          await insertKnownColumns("insurances", {
            users_id: userId,
            comp_name: body.name || "Insurance Provider",
          });
        } else if (users_type === "medicines" || users_type === "pharmacy") {
          await insertKnownColumns("medicines", {
            users_id: userId,
            pharm_name: body.name || "Pharmacy",
            prod_avb: "[]",
          });
        } else if (users_type === "medical equipments" || users_type === "equipment") {
          await insertKnownColumns("med_equipments", {
            users_id: userId,
            ven_bus_name: body.name || "Equipment Supplier",
          });
        }
      }

      res.json({
        success: true,
        message: "Registration successful! You can now log in.",
        userId,
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed: " + (error.message || "Server error"),
        error: error.message,
      });
    }
  },
);

//2
app.post("/api/login", async (req, res) => {
  try {
    const email_or_contact = String(req.body.email_or_contact || req.body.email || "").trim();
    const password = String(req.body.password ?? "").trim();
    const rawPassword = String(req.body.password ?? "");

    if (!email_or_contact || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email/phone and password.",
      });
    }

    // 1. Check Admin
    const [adminRows] = await pool.query(
      "SELECT * FROM admin WHERE LOWER(TRIM(email)) = LOWER(?) AND (pswd = ? OR TRIM(pswd) = ?)",
      [email_or_contact, rawPassword, password],
    );

    if (adminRows.length > 0) {
      req.session.admin = {
        id: adminRows[0].id,
        name: adminRows[0].name,
      };

      return req.session.save((err) => {
        if (err) {
          console.error("Session Save Error:", err);
          return res.status(500).json({
            success: false,
            message: "Session error during login",
          });
        }

        return res.json({
          success: true,
          role: "admin",
          redirect: "/admin.html",
        });
      });
    }

    // ================= USER / VENDOR LOGIN =================
    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE (LOWER(TRIM(emailorcontact)) = LOWER(?) OR TRIM(emailorcontact) = ?) AND (password = ? OR TRIM(password) = ?)",
      [email_or_contact, email_or_contact, rawPassword, password],
    );

    if (userRows.length === 0) {
      // Check if email exists to give specific feedback
      const [existRows] = await pool.query(
        "SELECT id, status FROM users WHERE LOWER(TRIM(emailorcontact)) = LOWER(?) OR TRIM(emailorcontact) = ?",
        [email_or_contact, email_or_contact],
      );

      if (existRows.length > 0) {
        return res.json({
          success: false,
          message: "Incorrect password. Please check your credentials.",
        });
      }

      return res.json({
        success: false,
        message: "No account found with this email or phone number.",
      });
    }

    const user = userRows[0];

    // STATUS CHECK
    const userStatus = String(user.status || "").toLowerCase().trim();
    if (userStatus === "pending") {
      return res.json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    } else if (userStatus === "rejected") {
      return res.json({
        success: false,
        message: "Your account has been deactivated/rejected by admin.",
      });
    } else if (userStatus !== "approved") {
      return res.json({
        success: false,
        message: "Your account status is: " + user.status + ". Pending admin approval.",
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      type: user.users_type,
    };

    let redirectPage = "";
    const type = String(user.users_type || "").toLowerCase().trim();

    if (type === "ambulance") redirectPage = "/amb.html";
    else if (type === "hospital" || type === "clinic") redirectPage = "/hsp.html";
    else if (type === "insurance") redirectPage = "/ins.html";
    else if (type === "lab test" || type === "lab") redirectPage = "/lt.html";
    else if (type === "medicines" || type === "pharmacy") redirectPage = "/mdc.html";
    else if (type === "medical equipments" || type === "medical equipment" || type === "equipment") redirectPage = "/mdeq.html";
    else redirectPage = "/users.html";

    return req.session.save((err) => {
      if (err) {
        console.error("User Session Save Error:", err);
        return res.status(500).json({
          success: false,
          message: "Session error during login",
        });
      }

      return res.json({
        success: true,
        role: "user",
        users_type: user.users_type,
        status: user.status,
        redirect: redirectPage,
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

//3
app.get("/api/admin/profile", (req, res) => {
  if (!req.session.admin) {
    return res.json({
      success: false,
      message: "Unauthorized",
    });
  }
  res.json({
    success: true,
    admin: {
      id: req.session.admin.id,
      name: req.session.admin.name,
    },
  });
});

//4
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({
        success: false,
        message: "Logout failed",
      });
    }
    res.clearCookie("connect.sid");
    res.json({
      success: true,
    });
  });
});

// DASHBOARD STATS
app.get("/api/admin/dashboard-stats", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const [hosp] = await pool.query(
      `SELECT COUNT(*) as count FROM user_hospital_bookings`,
    );
    const [lab] = await pool.query(
      `SELECT COUNT(*) as count FROM user_lab_test_bookings`,
    );
    const [amb] = await pool.query(
      `SELECT COUNT(*) as count FROM user_ambulance_bookings`,
    );
    const totalBookings =
      (hosp[0].count || 0) + (lab[0].count || 0) + (amb[0].count || 0);

    const [med] = await pool.query(
      `SELECT COUNT(*) as count FROM user_medicine_orders`,
    );
    const [eq] = await pool.query(
      `SELECT COUNT(*) as count FROM user_equipment_orders`,
    );
    const totalOrders = (med[0].count || 0) + (eq[0].count || 0);

    const [payments] = await pool.query(
      `SELECT SUM(amount) as total FROM user_payments WHERE payment_status = 'paid'`,
    );
    const totalRevenue = Number(payments[0].total || 0);

    const [medStock] = await pool.query(
      `SELECT SUM(stock_quantity) as total FROM med_lists`,
    );
    const [eqStock] = await pool.query(
      `SELECT SUM(stock_quantity) as total FROM med_eq_prd`,
    );
    const totalStock =
      Number(medStock[0].total || 0) + Number(eqStock[0].total || 0);

    const [payouts] = await pool.query(
      `SELECT SUM(amount) as total FROM vendor_payouts`,
    );
    const totalExpenses = Number(payouts[0].total || 0);

    const incomes = totalRevenue - totalExpenses;

    const [revenueTrend] = await pool.query(`
            SELECT DATE(paid_at) as date, SUM(amount) as daily_revenue 
            FROM user_payments 
            WHERE payment_status = 'paid' 
            AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
            GROUP BY DATE(paid_at) 
            ORDER BY date ASC
        `);

    const [expenseTrend] = await pool.query(`
            SELECT DATE(paid_at) as date, SUM(amount) as daily_expense 
            FROM vendor_payouts 
            WHERE payout_status = 'paid' 
            AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
            GROUP BY DATE(paid_at) 
            ORDER BY date ASC
        `);

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalOrders,
        totalRevenue,
        totalStock,
        totalExpenses,
        incomes,
      },
      chartData: {
        revenueTrend,
        expenseTrend,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to load stats" });
  }
});

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const allowedRanges = new Set(["all", "today", "7d", "30d", "90d", "year"]);
    const range = allowedRanges.has(req.query.range) ? req.query.range : "all";
    const normalizeDate = (value) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return "";
      }

      const date = new Date(`${value}T00:00:00Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return "";
      }

      return value;
    };
    const fromDate = normalizeDate(req.query.from);
    const toDate = normalizeDate(req.query.to);

    if ((req.query.from && !fromDate) || (req.query.to && !toDate)) {
      return res.status(400).json({
        success: false,
        message: "Please select valid dashboard dates.",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From Date cannot be after To Date.",
      });
    }

    const dateCondition = (column) => {
      if (fromDate && toDate) {
        return `
                    DATE(${column}) >= '${fromDate}'
                    AND DATE(${column}) <= '${toDate}'
                `;
      }

      if (fromDate) {
        return `DATE(${column}) >= '${fromDate}'`;
      }

      if (toDate) {
        return `DATE(${column}) <= '${toDate}'`;
      }

      if (range === "today") {
        return `
                    ${column} >= CURDATE()
                    AND ${column} < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
                `;
      }

      if (range === "7d") {
        return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      }

      if (range === "30d") {
        return `${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      }

      if (range === "90d") {
        return `${column} >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
      }

      if (range === "year") {
        return `YEAR(${column}) = YEAR(CURDATE())`;
      }

      return "";
    };

    const whereDate = (column) => {
      const condition = dateCondition(column);
      return condition ? `WHERE ${condition}` : "";
    };

    const andDate = (column) => {
      const condition = dateCondition(column);
      return condition ? `AND ${condition}` : "";
    };

    const [
      [userRows],
      [vendorRows],
      [pendingVendorRows],
      [hospitalRows],
      [labRows],
      [ambulanceRows],
      [insuranceRows],
      [medicineRows],
      [equipmentRows],
      [hospitalBookingRows],
      [labBookingRows],
      [ambulanceBookingRows],
      [medicineOrderRows],
      [equipmentOrderRows],
      [insurancePurchaseRows],
      [payoutRows],
      [roomRows],
      [paymentCountRows],
      [recentHospBookings],
      [recentLabBookings],
      [recentAmbBookings],
      [recentMedOrders],
      [recentEqOrders],
      [recentVendorRows],
      [pendingBookingsCountRows],
      [cancelledBookingsCountRows],
      [timelineRows],
    ] = await Promise.all([
      pool.query(`
                SELECT COUNT(*) AS count
                FROM product_users
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM users
                WHERE LOWER(status) = 'approved'
                ${andDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM users
                WHERE LOWER(status) = 'pending'
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM hospitals
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM labs
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM ambulances
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM insurances
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM med_lists
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count
                FROM med_eq_prd
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN total_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_hospital_bookings
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN total_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_lab_test_bookings
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN total_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_ambulance_bookings
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN total_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_medicine_orders
                ${whereDate("ordered_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN total_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_equipment_orders
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT
                    COUNT(*) AS count,
                    COALESCE(SUM(
                        CASE WHEN payment_status = 'paid'
                        THEN premium_amount ELSE 0 END
                    ), 0) AS revenue
                FROM user_insurance_purchases
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
                FROM vendor_payouts
                WHERE LOWER(payout_status) = 'paid'
                ${andDate("paid_at")}
            `),
      pool.query(`
                SELECT rooms
                FROM hospitals
                ${whereDate("created_at")}
            `),
      pool.query(`
                SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
                FROM user_payments
                WHERE LOWER(payment_status) = 'paid'
                ${andDate("paid_at")}
            `),
      pool.query(`
                SELECT id, patient_name AS user_name, total_amount, booking_status AS status, created_at, 'Hospital' AS type
                FROM user_hospital_bookings
                ORDER BY id DESC LIMIT 5
            `),
      pool.query(`
                SELECT id, patient_name AS user_name, total_amount, booking_status AS status, created_at, 'Lab' AS type
                FROM user_lab_test_bookings
                ORDER BY id DESC LIMIT 5
            `),
      pool.query(`
                SELECT id, patient_name AS user_name, total_amount, booking_status AS status, created_at, 'Ambulance' AS type
                FROM user_ambulance_bookings
                ORDER BY id DESC LIMIT 5
            `),
      pool.query(`
                SELECT umo.id, COALESCE(pu.full_name, 'Customer') AS user_name, umo.total_amount, umo.payment_status, umo.order_status, 'Medicine' AS type, umo.ordered_at AS created_at
                FROM user_medicine_orders umo
                LEFT JOIN product_users pu ON umo.user_id = pu.id
                ORDER BY umo.id DESC LIMIT 5
            `),
      pool.query(`
                SELECT ueo.id, COALESCE(pu.full_name, 'Customer') AS user_name, ueo.total_amount, ueo.payment_status, ueo.order_status, 'Equipment' AS type, ueo.created_at
                FROM user_equipment_orders ueo
                LEFT JOIN product_users pu ON ueo.user_id = pu.id
                ORDER BY ueo.id DESC LIMIT 5
            `),
      pool.query(`
                SELECT id, name, users_type, status, created_at, profile_photo
                FROM users
                ORDER BY id DESC LIMIT 6
            `),
      pool.query(`
                SELECT (
                    (SELECT COUNT(*) FROM user_hospital_bookings WHERE LOWER(booking_status) IN ('pending', 'requested')) +
                    (SELECT COUNT(*) FROM user_lab_test_bookings WHERE LOWER(booking_status) IN ('pending', 'requested')) +
                    (SELECT COUNT(*) FROM user_ambulance_bookings WHERE LOWER(booking_status) IN ('pending', 'requested'))
                ) AS count
            `),
      pool.query(`
                SELECT (
                    (SELECT COUNT(*) FROM user_hospital_bookings WHERE LOWER(booking_status) = 'cancelled') +
                    (SELECT COUNT(*) FROM user_lab_test_bookings WHERE LOWER(booking_status) = 'cancelled') +
                    (SELECT COUNT(*) FROM user_ambulance_bookings WHERE LOWER(booking_status) = 'cancelled')
                ) AS count
            `),
      pool.query(`
                SELECT 
                    ym,
                    DATE_FORMAT(STR_TO_DATE(CONCAT(ym, '-01'), '%Y-%m-%d'), '%b %Y') AS label,
                    COALESCE(SUM(booking_count), 0) AS bookings,
                    COALESCE(SUM(revenue_amount), 0) AS revenue
                FROM (
                    SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, 1 AS booking_count, CASE WHEN LOWER(payment_status) = 'paid' THEN total_amount ELSE 0 END AS revenue_amount FROM user_hospital_bookings ${whereDate("created_at")}
                    UNION ALL
                    SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, 1 AS booking_count, CASE WHEN LOWER(payment_status) = 'paid' THEN total_amount ELSE 0 END AS revenue_amount FROM user_lab_test_bookings ${whereDate("created_at")}
                    UNION ALL
                    SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, 1 AS booking_count, CASE WHEN LOWER(payment_status) = 'paid' THEN total_amount ELSE 0 END AS revenue_amount FROM user_ambulance_bookings ${whereDate("created_at")}
                    UNION ALL
                    SELECT DATE_FORMAT(ordered_at, '%Y-%m') AS ym, 1 AS booking_count, CASE WHEN LOWER(payment_status) = 'paid' THEN total_amount ELSE 0 END AS revenue_amount FROM user_medicine_orders ${whereDate("ordered_at")}
                    UNION ALL
                    SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, 1 AS booking_count, CASE WHEN LOWER(payment_status) = 'paid' THEN total_amount ELSE 0 END AS revenue_amount FROM user_equipment_orders ${whereDate("created_at")}
                    UNION ALL
                    SELECT DATE_FORMAT(paid_at, '%Y-%m') AS ym, 0 AS booking_count, amount AS revenue_amount FROM user_payments WHERE LOWER(payment_status) IN ('paid', 'success') ${andDate("paid_at")}
                ) combined
                WHERE ym IS NOT NULL
                GROUP BY ym
                ORDER BY ym ASC
            `),
    ]);

    const numberValue = (value) => Number(value || 0);
    const hospitalRevenue = numberValue(hospitalBookingRows[0].revenue);
    const labRevenue = numberValue(labBookingRows[0].revenue);
    const ambulanceRevenue = numberValue(ambulanceBookingRows[0].revenue);
    const medicinesRevenue = numberValue(medicineOrderRows[0].revenue);
    const equipmentsRevenue = numberValue(equipmentOrderRows[0].revenue);
    const insuranceRevenue = numberValue(insurancePurchaseRows[0].revenue);

    const totalRevenue =
      hospitalRevenue +
      labRevenue +
      ambulanceRevenue +
      medicinesRevenue +
      equipmentsRevenue +
      insuranceRevenue;

    const vendorPayouts = numberValue(payoutRows[0].total);
    const platformRevenue = Math.max(totalRevenue - vendorPayouts, 0);

    let totalBeds = 0;
    let availableBeds = 0;

    roomRows.forEach((row) => {
      let rooms = row.rooms;

      if (typeof rooms === "string") {
        try {
          rooms = JSON.parse(rooms);
        } catch {
          rooms = [];
        }
      }

      if (!Array.isArray(rooms)) {
        return;
      }

      rooms.forEach((room) => {
        const beds = numberValue(room.total_beds);

        totalBeds += beds;

        if (String(room.availability || "").toLowerCase() === "available") {
          availableBeds += beds;
        }
      });
    });

    const totalProducts = numberValue(medicineRows[0].count) + numberValue(equipmentRows[0].count);
    const totalPayments = numberValue(paymentCountRows[0].total) || totalRevenue;
    const totalPaymentsCount = numberValue(paymentCountRows[0].count);
    const pendingPayments = Math.max(totalRevenue - vendorPayouts, 0);
    const pendingVendors = numberValue(pendingVendorRows[0].count);
    const pendingBookings = numberValue(pendingBookingsCountRows[0].count);
    const cancelledBookings = numberValue(cancelledBookingsCountRows[0].count);

    // Combine recent bookings sorted by date/id
    const combinedBookings = [
      ...recentHospBookings,
      ...recentLabBookings,
      ...recentAmbBookings,
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6);

    // Combine recent orders sorted by date/id
    const combinedOrders = [
      ...recentMedOrders,
      ...recentEqOrders,
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6);

    const totalBookingsCount =
      numberValue(hospitalBookingRows[0].count) +
      numberValue(labBookingRows[0].count) +
      numberValue(ambulanceBookingRows[0].count);

    const totalOrdersCount =
      numberValue(medicineOrderRows[0].count) +
      numberValue(equipmentOrderRows[0].count);

    res.json({
      success: true,
      range,
      from: fromDate,
      to: toDate,
      stats: {
        totalUsers: numberValue(userRows[0].count),
        approvedVendors: numberValue(vendorRows[0].count),
        totalVendors: numberValue(vendorRows[0].count),
        hospitals: numberValue(hospitalRows[0].count),
        labs: numberValue(labRows[0].count),
        ambulances: numberValue(ambulanceRows[0].count),
        insurances: numberValue(insuranceRows[0].count),
        medicines: numberValue(medicineRows[0].count),
        equipments: numberValue(equipmentRows[0].count),
        totalProducts,
        bookings: totalBookingsCount,
        totalBookings: totalBookingsCount,
        orders: totalOrdersCount,
        totalOrders: totalOrdersCount,
        totalRevenue,
        totalPayments,
        totalPaymentsCount,
        pendingPayments,
        pendingVendors,
        pendingBookings,
        cancelledBookings,
        totalCommission: platformRevenue,
        platformRevenue,
        netBalance: platformRevenue,
        vendorPayouts,
        hospitalRevenue,
        labRevenue,
        ambulanceRevenue,
        insuranceRevenue,
        medicinesRevenue,
        equipmentsRevenue,
        totalBeds,
        availableBeds,
      },
      recentBookings: combinedBookings,
      recentVendors: recentVendorRows,
      recentOrders: combinedOrders,
      pendingActions: {
        vendorApprovals: pendingVendors,
        pendingPayments: pendingPayments,
        bookingRequests: pendingBookings,
        cancelledBookings: cancelledBookings,
        supportRequests: 0,
      },
      servicePerformance: {
        hospital: {
          bookings: numberValue(hospitalBookingRows[0].count),
          revenue: hospitalRevenue,
          totalBeds,
          availableBeds,
        },
        lab: {
          bookings: numberValue(labBookingRows[0].count),
          revenue: labRevenue,
        },
        ambulance: {
          bookings: numberValue(ambulanceBookingRows[0].count),
          revenue: ambulanceRevenue,
        },
        products: {
          orders: totalOrdersCount,
          revenue: medicinesRevenue + equipmentsRevenue,
          products: totalProducts,
        },
      },
      timelineTrend: timelineRows.map((row) => ({
        ym: row.ym,
        label: row.label || row.ym,
        bookings: Number(row.bookings || 0),
        revenue: Number(row.revenue || 0),
      })),
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});

app.get("/api/admin/revenue", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [[vendors], [revenueRows], [payoutRows], [grossRows]] =
      await Promise.all([
        pool.query(`
                    SELECT id, name, users_type
                    FROM users
                    WHERE LOWER(status) = 'approved'
                    ORDER BY name
                `),
        pool.query(`
                    SELECT vendor_id, SUM(amount) AS revenue
                    FROM (
                        SELECT medicine_vendor_id AS vendor_id,
                            total_amount AS amount
                        FROM user_medicine_orders
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT equipment_vendor_id AS vendor_id,
                            total_amount AS amount
                        FROM user_equipment_orders
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT h.users_id AS vendor_id,
                            b.total_amount AS amount
                        FROM user_hospital_bookings b
                        INNER JOIN hospitals h
                            ON b.hospital_id = h.id
                        WHERE b.payment_status = 'paid'

                        UNION ALL

                        SELECT l.users_id AS vendor_id,
                            b.total_amount AS amount
                        FROM user_lab_test_bookings b
                        INNER JOIN labs l
                            ON b.lab_vendor_id = l.id
                        WHERE b.payment_status = 'paid'

                        UNION ALL

                        SELECT a.users_id AS vendor_id,
                            b.total_amount AS amount
                        FROM user_ambulance_bookings b
                        INNER JOIN ambulances a
                            ON b.ambulance_id = a.id
                        WHERE b.payment_status = 'paid'

                        UNION ALL

                        SELECT i.users_id AS vendor_id,
                            p.premium_amount AS amount
                        FROM user_insurance_purchases p
                        INNER JOIN insurances i
                            ON p.insurance_vendor_id = i.id
                        WHERE p.payment_status = 'paid'
                    ) revenue_by_vendor
                    WHERE vendor_id IS NOT NULL
                    GROUP BY vendor_id
                `),
        pool.query(`
                    SELECT vendor_id, SUM(amount) AS paid
                    FROM vendor_payouts
                    WHERE LOWER(payout_status) = 'paid'
                    GROUP BY vendor_id
                `),
        pool.query(`
                    SELECT COALESCE(SUM(amount), 0) AS total
                    FROM (
                        SELECT total_amount AS amount
                        FROM user_medicine_orders
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT total_amount AS amount
                        FROM user_equipment_orders
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT total_amount AS amount
                        FROM user_hospital_bookings
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT total_amount AS amount
                        FROM user_lab_test_bookings
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT total_amount AS amount
                        FROM user_ambulance_bookings
                        WHERE payment_status = 'paid'

                        UNION ALL

                        SELECT premium_amount AS amount
                        FROM user_insurance_purchases
                        WHERE payment_status = 'paid'
                    ) gross_revenue
                `),
      ]);

    const revenues = new Map(
      revenueRows.map((row) => [
        Number(row.vendor_id),
        Number(row.revenue || 0),
      ]),
    );
    const payouts = new Map(
      payoutRows.map((row) => [Number(row.vendor_id), Number(row.paid || 0)]),
    );

    const totalIncoming = Number(grossRows[0].total || 0);
    let totalPaid = 0;
    let assignedIncoming = 0;

    const vendorRevenue = vendors.map((vendor) => {
      const originalRevenue = revenues.get(Number(vendor.id)) || 0;
      const paidAmount = payouts.get(Number(vendor.id)) || 0;
      const remainingAmount = Math.max(originalRevenue - paidAmount, 0);

      assignedIncoming += originalRevenue;
      totalPaid += paidAmount;

      return {
        ...vendor,
        originalRevenue,
        commissionPercent:
          originalRevenue > 0
            ? Number(((remainingAmount / originalRevenue) * 100).toFixed(2))
            : 0,
        commissionAmount: remainingAmount,
        vendorAmount: originalRevenue,
        paidAmount,
        remainingAmount,
      };
    });

    const unassignedRevenue = Math.max(totalIncoming - assignedIncoming, 0);

    if (unassignedRevenue > 0) {
      vendorRevenue.push({
        id: null,
        name: "Unassigned / Platform",
        users_type: "Platform",
        originalRevenue: unassignedRevenue,
        commissionPercent: 100,
        commissionAmount: unassignedRevenue,
        vendorAmount: unassignedRevenue,
        paidAmount: 0,
        remainingAmount: unassignedRevenue,
      });
    }

    res.json({
      success: true,
      totalIncoming,
      totalPaid,
      platformRevenue: Math.max(totalIncoming - totalPaid, 0),
      vendors: vendorRevenue,
    });
  } catch (error) {
    console.error("Admin Revenue Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load revenue data",
    });
  }
});

//5
app.get("/api/vendors", async (req, res) => {
  try {
    const [vendors] = await pool.query(`
            SELECT *
            FROM users
            `);

    const [
      [hospitalListings],
      [labListings],
      [ambulanceListings],
      [insuranceListings],
      [medicineListings],
      [equipmentListings],
    ] = await Promise.all([
      pool.query(`
                SELECT
                    id,
                    users_id AS vendor_id,
                    hospital_name AS name,
                    CONCAT_WS(' - ', location, address) AS subtitle,
                    rooms
                FROM hospitals
                ORDER BY hospital_name
            `),
      pool.query(`
                SELECT
                    id,
                    users_id AS vendor_id,
                    lab_name AS name,
                    CONCAT_WS(' - ', location, address) AS subtitle
                FROM labs
                ORDER BY lab_name
            `),
      pool.query(`
                SELECT
                    id,
                    users_id AS vendor_id,
                    CONCAT(ambulance_type, ' Ambulance') AS name,
                    CONCAT_WS(' - ', area, status, eta) AS subtitle
                FROM ambulances
                ORDER BY ambulance_type
            `),
      pool.query(`
                SELECT
                    id,
                    users_id AS vendor_id,
                    comp_name AS name,
                    CONCAT_WS(' - ', comp_type, claim_type) AS subtitle
                FROM insurances
                ORDER BY comp_name
            `),
      pool.query(`
                SELECT
                    medicine_id AS id,
                    vendor_id,
                    medicine_name AS name,
                    CONCAT_WS(' - ', brand_name, category, medicine_status)
                        AS subtitle
                FROM med_lists
                ORDER BY medicine_name
            `),
      pool.query(`
                SELECT
                    product_id AS id,
                    vendor_id,
                    product_name AS name,
                    CONCAT_WS(' - ', brand_name, category, stock_status)
                        AS subtitle
                FROM med_eq_prd
                ORDER BY product_name
            `),
    ]);

    const listingsByVendor = new Map();
    const bedAvailabilityByVendor = new Map();

    const addListings = (rows, type) => {
      rows.forEach((row) => {
        const vendorId = Number(row.vendor_id);

        if (!listingsByVendor.has(vendorId)) {
          listingsByVendor.set(vendorId, []);
        }

        listingsByVendor.get(vendorId).push({
          id: row.id,
          type,
          name: row.name || `${type} ${row.id}`,
          subtitle: row.subtitle || "",
        });
      });
    };

    addListings(hospitalListings, "Hospital");
    addListings(labListings, "Lab");
    addListings(ambulanceListings, "Ambulance");
    addListings(insuranceListings, "Insurance");
    addListings(medicineListings, "Medicine");
    addListings(equipmentListings, "Equipment");

    hospitalListings.forEach((hospital) => {
      let rooms = hospital.rooms;

      if (typeof rooms === "string") {
        try {
          rooms = JSON.parse(rooms);
        } catch {
          rooms = [];
        }
      }

      if (!Array.isArray(rooms)) {
        return;
      }

      const vendorId = Number(hospital.vendor_id);

      if (!bedAvailabilityByVendor.has(vendorId)) {
        bedAvailabilityByVendor.set(vendorId, []);
      }

      rooms.forEach((room, roomIndex) => {
        bedAvailabilityByVendor.get(vendorId).push({
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          roomIndex,
          roomType: room.room_type || "",
          totalBeds: Number(room.total_beds || 0),
          availability: room.availability || "Unknown",
          pricing: Number(room.pricing || 0),
          details: room.details || "",
        });
      });
    });

    for (const vendor of vendors) {
      let revenue = 0;
      vendor.listings = listingsByVendor.get(Number(vendor.id)) || [];
      vendor.listingCount = vendor.listings.length;
      vendor.bedAvailability =
        bedAvailabilityByVendor.get(Number(vendor.id)) || [];
      vendor.totalBeds = vendor.bedAvailability.reduce(
        (total, room) => total + Number(room.totalBeds || 0),
        0,
      );
      vendor.availableBeds = vendor.bedAvailability.reduce(
        (total, room) =>
          String(room.availability || "").toLowerCase() === "available"
            ? total + Number(room.totalBeds || 0)
            : total,
        0,
      );

      /* ================= MEDICINE ================= */

      if (vendor.users_type.toLowerCase().includes("medicine")) {
        const [medicineRevenue] = await pool.query(
          `
                    SELECT
                        SUM(total_amount)
                        AS total
                    FROM user_medicine_orders
                    WHERE medicine_vendor_id = ?
                    AND payment_status = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(medicineRevenue[0].total || 0);
      }

      /* ================= EQUIPMENT ================= */

      if (vendor.users_type.toLowerCase().includes("equipment")) {
        const [equipmentRevenue] = await pool.query(
          `
                    SELECT
                        SUM(total_amount)
                        AS total
                    FROM user_equipment_orders
                    WHERE equipment_vendor_id = ?
                    AND payment_status = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(equipmentRevenue[0].total || 0);
      }

      /* ================= HOSPITAL ================= */

      if (vendor.users_type.toLowerCase().includes("hospital")) {
        const [hospitalRevenue] = await pool.query(
          `
                    SELECT
                        SUM(total_amount)
                        AS total
                    FROM user_hospital_bookings
                    WHERE hospital_id IN (

                        SELECT id
                        FROM hospitals
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(hospitalRevenue[0].total || 0);
      }

      /* ================= LAB ================= */

      if (vendor.users_type.toLowerCase().includes("lab")) {
        const [labRevenue] = await pool.query(
          `
                    SELECT
                        SUM(total_amount)
                        AS total
                    FROM user_lab_test_bookings
                    WHERE lab_vendor_id IN (

                        SELECT id
                        FROM labs
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(labRevenue[0].total || 0);
      }

      /* ================= AMBULANCE ================= */

      if (vendor.users_type.toLowerCase().includes("ambulance")) {
        const [ambulanceRevenue] = await pool.query(
          `
                    SELECT
                        SUM(user_ambulance_bookings.total_amount)
                        AS total
                    FROM user_ambulance_bookings
                    INNER JOIN ambulances
                    ON user_ambulance_bookings.ambulance_id =
                    ambulances.id
                    WHERE ambulances.users_id = ?
                    AND LOWER(user_ambulance_bookings.payment_status)
                    = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(ambulanceRevenue[0].total || 0);
      }

      /* ================= INSURANCE ================= */

      if (vendor.users_type.toLowerCase().includes("insurance")) {
        const [insuranceRevenue] = await pool.query(
          `
                    SELECT
                        SUM(premium_amount)
                        AS total
                    FROM user_insurance_purchases
                    WHERE insurance_vendor_id IN (

                        SELECT id
                        FROM insurances
                        WHERE users_id = ?

                    )
                    AND payment_status = 'paid'
                    `,
          [vendor.id],
        );

        revenue += Number(insuranceRevenue[0].total || 0);
      }

      const [paidRows] = await pool.query(
        `
                    SELECT
                        SUM(amount) AS paid
                    FROM vendor_payouts
                    WHERE vendor_id = ?
                    `,
        [vendor.id],
      );
      const paidAmount = Number(paidRows[0].paid || 0);
      const netBalance = Math.max(revenue - paidAmount, 0);

      vendor.originalRevenue = revenue;
      vendor.paidAmount = paidAmount;
      vendor.revenue = netBalance;
      vendor.commissionAmount = netBalance;
      vendor.commissionPercent =
        revenue > 0 ? Number(((netBalance / revenue) * 100).toFixed(2)) : 0;
    }
    res.json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//6
app.put("/api/admin/vendor/update/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const vendorId = req.params.id;
    const { basic, details } = req.body;
    
    if (basic && Object.keys(basic).length > 0) {
      const updates = [];
      const values = [];
      for (const [key, value] of Object.entries(basic)) {
        if (['name', 'emailorcontact', 'users_type', 'bank_account', 'ifsc'].includes(key)) {
          updates.push(key + ' = ?');
          values.push(value);
        }
      }
      if (updates.length > 0) {
        values.push(vendorId);
        await pool.query("UPDATE users SET " + updates.join(", ") + " WHERE id = ?", values);
      }
    }

    if (details && Object.keys(details).length > 0) {
      const [userRows] = await pool.query("SELECT users_type FROM users WHERE id = ?", [vendorId]);
      if (userRows.length > 0) {
        const userType = String(userRows[0].users_type).toLowerCase();
        let tableName = "";
        if (userType === "hospital") tableName = "hospitals";
        else if (userType === "ambulance") tableName = "ambulances";
        else if (userType === "lab test" || userType === "lab") tableName = "labs";
        else if (userType === "insurance") tableName = "insurances";
        else if (userType === "medicines") tableName = "medicines";
        else if (userType === "medical equipments" || userType === "medical equipment") tableName = "med_equipments";

        if (tableName) {
          const updates = [];
          const values = [];
          for (const [key, value] of Object.entries(details)) {
             if (key !== 'id' && key !== 'users_id' && !key.includes('photo') && !key.includes('proof') && !key.includes('certificate') && !key.includes('license') && !key.includes('cheque') && !key.includes('bill') && !key.includes('cer') && !key.includes('reg') && !key.includes('rc') && !key.includes('lic') && !key.includes('veh_ins') && !key.includes('nabl') && !key.includes('app_comp')) {
                updates.push(key + ' = ?');
                values.push(value);
             }
          }
          if (updates.length > 0) {
            values.push(vendorId);
            await pool.query("UPDATE " + tableName + " SET " + updates.join(", ") + " WHERE users_id = ?", values);
          }
        }
      }
    }
    res.json({ success: true, message: "Vendor details updated successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server Error" });
  }
});

app.put("/api/vendor/status/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const vendorId = req.params.id;
    const { status } = req.body;
    const normalizedStatus = String(status || "").toLowerCase();
    const sql = `
            UPDATE users
            SET status = ?
            WHERE id = ?
        `;
    await pool.query(sql, [normalizedStatus, vendorId]);
    res.json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

//7
app.get("/api/users", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const sql = `
            SELECT
                id,
                full_name AS name,
                CONCAT(email, ' / ', phone) AS emailorcontact,
                profile_photo,
                'Customer' AS users_type,
                'active' AS status
            FROM product_users
            ORDER BY created_at DESC
        `;
    const [result] = await pool.query(sql);
    res.json({
      success: true,
      users: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

//8
app.get("/api/vendor/details/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return res.json({
        success: false,
        message: "Vendor not found",
      });
    }
    const user = users[0];
    let details = null;
    const userType = String(user.users_type || "").toLowerCase();

    if (userType === "hospital") {
      const [data] = await pool.query(
        "SELECT * FROM hospitals WHERE users_id = ?",
        [id],
      );
      details = data[0];
    } else if (userType === "ambulance") {
      const [data] = await pool.query(
        "SELECT * FROM ambulances WHERE users_id = ?",
        [id],
      );
      details = data[0];
    } else if (userType === "lab test" || userType === "lab") {
      const [data] = await pool.query("SELECT * FROM labs WHERE users_id = ?", [
        id,
      ]);
      details = data[0];
    } else if (userType === "insurance") {
      const [data] = await pool.query(
        "SELECT * FROM insurances WHERE users_id = ?",
        [id],
      );
      details = data[0];
    } else if (userType === "medicines") {
      const [data] = await pool.query(
        "SELECT * FROM medicines WHERE users_id = ?",
        [id],
      );
      details = data[0];
    } else if (
      userType === "medical equipments" ||
      userType === "medical equipment"
    ) {
      const [data] = await pool.query(
        "SELECT * FROM med_equipments WHERE users_id = ?",
        [id],
      );
      details = data[0];
    }
    res.json({
      success: true,
      user,
      details,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//9
app.get("/api/user/profile", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.user.id;
    const userType = String(req.session.user.type || "").toLowerCase();
    let details = null;

    if (userType === "hospital") {
      const [rows] = await pool.query("SELECT * FROM hospitals WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    } else if (userType === "ambulance") {
      const [rows] = await pool.query("SELECT * FROM ambulances WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    } else if (userType === "lab test" || userType === "lab") {
      const [rows] = await pool.query("SELECT * FROM labs WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    } else if (userType === "insurance") {
      const [rows] = await pool.query("SELECT * FROM insurances WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    } else if (userType === "medicines") {
      const [rows] = await pool.query("SELECT * FROM medicines WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    } else if (userType === "medical equipments" || userType === "medical equipment") {
      const [rows] = await pool.query("SELECT * FROM med_equipments WHERE users_id = ?", [userId]);
      details = rows[0] || null;
    }

    res.json({
      success: true,
      user: req.session.user,
      details,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//10
app.put(
  "/api/user/profile",
  upload.fields([
    { name: "identity_proof", maxCount: 1 },
    { name: "profile_photo", maxCount: 1 },
    { name: "cheque", maxCount: 1 },
    { name: "hospital_reg_certificate", maxCount: 1 },
    { name: "shop_license", maxCount: 1 },
    { name: "medical_council_registration", maxCount: 1 },
    { name: "electricity_bill", maxCount: 1 },
    { name: "lic", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "veh_ins", maxCount: 1 },
    { name: "lab_reg", maxCount: 1 },
    { name: "nabl", maxCount: 1 },
    { name: "incorp_cert", maxCount: 1 },
    { name: "add_proof", maxCount: 1 },
    { name: "drug_lic", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "gst_cer", maxCount: 1 },
    { name: "pharm_cer", maxCount: 1 },
    { name: "qual_cer", maxCount: 1 },
    { name: "app_comp", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.session.user.id;
      const body = req.body;
      const updates = [];
      const values = [];

      if (body.name && body.name.trim()) {
        updates.push("name = ?");
        values.push(body.name.trim());
      }
      if (body.email_or_contact && body.email_or_contact.trim()) {
        updates.push("emailorcontact = ?");
        values.push(body.email_or_contact.trim());
      }
      if (body.user_type && body.user_type.trim()) {
        updates.push("users_type = ?");
        values.push(body.user_type.trim());
      }
      if (body.password && body.password.trim()) {
        updates.push("password = ?");
        values.push(body.password.trim());
      }
      if (body.bank_account && body.bank_account.trim()) {
        updates.push("bank_account = ?");
        values.push(body.bank_account.trim());
      }
      if (body.ifsc && body.ifsc.trim()) {
        updates.push("ifsc = ?");
        values.push(body.ifsc.trim());
      }
      if (req.files["identity_proof"]?.[0]?.filename) {
        updates.push("identity_proof = ?");
        values.push(req.files["identity_proof"][0].filename);
      }
      if (req.files["profile_photo"]?.[0]?.filename) {
        updates.push("profile_photo = ?");
        values.push(req.files["profile_photo"][0].filename);
      }
      if (req.files["cheque"]?.[0]?.filename) {
        updates.push("cheque = ?");
        values.push(req.files["cheque"][0].filename);
      }

      const userType = String(req.session.user.type || body.user_type || "").toLowerCase();
      const detailPayload = {};

      if (userType === "hospital") {
        if (body.hospital_name) detailPayload.hospital_name = body.hospital_name;
        if (body.address) detailPayload.address = body.address;
        if (body.location) detailPayload.location = body.location;
        if (body.facilities) detailPayload.facilities = body.facilities;
        if (req.files["hospital_reg_certificate"]?.[0]?.filename) detailPayload.hospital_reg_certificate = req.files["hospital_reg_certificate"][0].filename;
        if (req.files["shop_license"]?.[0]?.filename) detailPayload.shop_license = req.files["shop_license"][0].filename;
        if (req.files["medical_council_registration"]?.[0]?.filename) detailPayload.medical_council_registration = req.files["medical_council_registration"][0].filename;
        if (req.files["electricity_bill"]?.[0]?.filename) detailPayload.electricity_bill = req.files["electricity_bill"][0].filename;
      } else if (userType === "ambulance") {
        if (body.ambulance_type) detailPayload.ambulance_type = body.ambulance_type;
        if (body.base_chrge) detailPayload.base_chrge = body.base_chrge;
        if (body.min_chrge) detailPayload.min_chrge = body.min_chrge;
        if (body.night_chrg) detailPayload.night_chrg = body.night_chrg;
        if (body.wait_chrg) detailPayload.wait_chrg = body.wait_chrg;
        if (body.area) detailPayload.area = body.area;
        if (body.description) detailPayload.description = body.description;
        if (body.driver_exp) detailPayload.driver_exp = body.driver_exp;
        if (body.status) detailPayload.status = body.status;
        if (body.eta) detailPayload.eta = body.eta;
        if (req.files["lic"]?.[0]?.filename) detailPayload.lic = req.files["lic"][0].filename;
        if (req.files["rc"]?.[0]?.filename) detailPayload.rc = req.files["rc"][0].filename;
        if (req.files["veh_ins"]?.[0]?.filename) detailPayload.veh_ins = req.files["veh_ins"][0].filename;
      } else if (userType === "lab test" || userType === "lab") {
        if (body.lab_name) detailPayload.lab_name = body.lab_name;
        if (body.address) detailPayload.address = body.address;
        if (body.location) detailPayload.location = body.location;
        if (body.description) detailPayload.description = body.description;
        if (body.lab_type) detailPayload.lab_type = body.lab_type;
        if (body.test) detailPayload.test = body.test;
        if (body.home_coll) detailPayload.home_coll = body.home_coll;
        if (body.available_areas) detailPayload.available_areas = body.available_areas;
        if (body.lab_hrs) detailPayload.lab_hrs = body.lab_hrs;
        if (body.test_time) detailPayload.test_time = body.test_time;
        if (body.test_price) detailPayload.test_price = body.test_price;
        if (body.emergency_test) detailPayload.emergency_test = body.emergency_test;
        if (body.adv_equipment) detailPayload.adv_equipment = body.adv_equipment;
        if (req.files["lab_reg"]?.[0]?.filename) detailPayload.lab_reg = req.files["lab_reg"][0].filename;
        if (req.files["nabl"]?.[0]?.filename) detailPayload.nabl = req.files["nabl"][0].filename;
      } else if (userType === "insurance") {
        if (body.comp_name) detailPayload.comp_name = body.comp_name;
        if (body.comp_type) detailPayload.comp_type = body.comp_type;
        if (body.description) detailPayload.description = body.description;
        if (body.irdai) detailPayload.irdai = body.irdai;
        if (body.comp_pan) detailPayload.comp_pan = body.comp_pan;
        if (body.gst) detailPayload.gst = body.gst;
        if (body.offc_add) detailPayload.offc_add = body.offc_add;
        if (body.claim_type) detailPayload.claim_type = body.claim_type;
        if (body.claim_time) detailPayload.claim_time = body.claim_time;
        if (body.doc_req) detailPayload.doc_req = body.doc_req;
        if (body.cust_sup_num) detailPayload.cust_sup_num = body.cust_sup_num;
        if (body.email_sup) detailPayload.email_sup = body.email_sup;
        if (body.contact_person) detailPayload.contact_person = body.contact_person;
        if (body.website) detailPayload.website = body.website;
        if (body.ins_price) detailPayload.ins_price = body.ins_price;
        if (body.claim_price) detailPayload.claim_price = body.claim_price;
        if (req.files["incorp_cert"]?.[0]?.filename) detailPayload.incorp_cert = req.files["incorp_cert"][0].filename;
        if (req.files["add_proof"]?.[0]?.filename) detailPayload.add_proof = req.files["add_proof"][0].filename;
      } else if (userType === "medicines") {
        if (body.pharm_name) detailPayload.pharm_name = body.pharm_name;
        if (body.owner_name) detailPayload.owner_name = body.owner_name;
        if (body.shop_type) detailPayload.shop_type = body.shop_type;
        if (body.description) detailPayload.description = body.description;
        if (body.issued_by) detailPayload.issued_by = body.issued_by;
        if (body.address) detailPayload.address = body.address;
        if (body.location) detailPayload.location = body.location;
        if (body.phar_counc_reg) detailPayload.phar_counc_reg = body.phar_counc_reg;
        if (body.shop_hrs) detailPayload.shop_hrs = body.shop_hrs;
        if (body.avlblty) detailPayload.avlblty = body.avlblty;
        if (req.files["drug_lic"]?.[0]?.filename) detailPayload.drug_lic = req.files["drug_lic"][0].filename;
        if (req.files["address_proof"]?.[0]?.filename) detailPayload.address_proof = req.files["address_proof"][0].filename;
        if (req.files["gst_cer"]?.[0]?.filename) detailPayload.gst_cer = req.files["gst_cer"][0].filename;
        if (req.files["pharm_cer"]?.[0]?.filename) detailPayload.pharm_cer = req.files["pharm_cer"][0].filename;
      } else if (userType === "medical equipments" || userType === "medical equipment") {
        if (body.ven_bus_name) detailPayload.ven_bus_name = body.ven_bus_name;
        if (body.owner_name) detailPayload.owner_name = body.owner_name;
        if (body.business_type) detailPayload.business_type = body.business_type;
        if (body.description) detailPayload.description = body.description;
        if (body.address) detailPayload.address = body.address;
        if (body.location) detailPayload.location = body.location;
        if (req.files["address_proof"]?.[0]?.filename) detailPayload.address_proof = req.files["address_proof"][0].filename;
        if (req.files["qual_cer"]?.[0]?.filename) detailPayload.qual_cer = req.files["qual_cer"][0].filename;
        if (req.files["app_comp"]?.[0]?.filename) detailPayload.app_comp = req.files["app_comp"][0].filename;
      }

      if (Object.keys(detailPayload).length > 0) {
        const detailTableMap = {
          hospital: "hospitals",
          ambulance: "ambulances",
          "lab test": "labs",
          lab: "labs",
          insurance: "insurances",
          medicines: "medicines",
          "medical equipments": "med_equipments",
          "medical equipment": "med_equipments",
        };

        const tableName = detailTableMap[userType];
        if (tableName) {
          const [existingRows] = await pool.query("SELECT id FROM ?? WHERE users_id = ?", [tableName, userId]);
          const columnEntries = Object.entries(detailPayload);
          const setClause = columnEntries.map(([key]) => `\`${key}\` = ?`).join(", ");

          if (existingRows.length > 0) {
            const valuesForUpdate = [...columnEntries.map(([, value]) => value), userId];
            await pool.query(`UPDATE \`${tableName}\` SET ${setClause} WHERE users_id = ?`, valuesForUpdate);
          } else {
            const columns = ["users_id", ...columnEntries.map(([key]) => `\`${key}\``)];
            const placeholders = Array(columns.length).fill("?").join(", ");
            const valuesForInsert = [userId, ...columnEntries.map(([, value]) => value)];
            await pool.query(`INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${placeholders})`, valuesForInsert);
          }
        }
      }

      if (updates.length === 0 && Object.keys(detailPayload).length === 0) {
        return res.json({
          success: true,
          message: "No profile changes provided",
        });
      }

      if (updates.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
          values,
        );
      }

      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
      const user = rows[0];

      req.session.user = {
        id: user.id,
        name: user.name,
        type: user.users_type,
      };

      const [detailsRows] = await pool.query(
        `SELECT * FROM ${userType === "hospital" ? "hospitals" : userType === "ambulance" ? "ambulances" : userType === "lab test" || userType === "lab" ? "labs" : userType === "insurance" ? "insurances" : userType === "medicines" ? "medicines" : "med_equipments"} WHERE users_id = ?`,
        [userId],
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user.id,
          name: user.name,
          users_type: user.users_type,
          emailorcontact: user.emailorcontact,
          profile_photo: user.profile_photo,
        },
        details: detailsRows[0] || null,
      });
    } catch (error) {
      console.error("User profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Profile update failed",
        error: error.message,
      });
    }
  },
);

app.post("/api/user/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      success: true,
    });
  });
});

//11
app.get("/api/hospitals", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.session.user.id;
    const [hospitals] = await pool.query(
      `
                SELECT *
                FROM hospitals
                WHERE users_id = ?
                ORDER BY id DESC
                `,
      [userId],
    );
    res.json({
      success: true,
      hospitals,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//12
app.get("/api/hospital/availability", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.session.user.id;
    const [hospitals] = await pool.query(
      `
                SELECT *
                FROM hospitals
                WHERE users_id = ?
                `,
      [userId],
    );
    let availableHospitals = [];
    hospitals.forEach((hospital) => {
      if (!hospital.rooms) return;
      let rooms = [];
      try {
        if (typeof hospital.rooms === "string") {
          rooms = JSON.parse(hospital.rooms);
        } else {
          rooms = hospital.rooms;
        }
      } catch (error) {
        console.log(error);
        return;
      }
      const hasAvailableRoom = rooms.some(
        (room) =>
          room.availability && room.availability.toLowerCase() === "available",
      );
      if (hasAvailableRoom) {
        availableHospitals.push(hospital);
      }
    });
    res.json({
      success: true,
      hospitals: availableHospitals,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//13
app.post(
  "/api/add/hospital",
  upload.fields([
    {
      name: "hospital_images",
      maxCount: 100,
    },
    {
      name: "room_images",
      maxCount: 100,
    },
    {
      name: "hospital_reg_certificate",
      maxCount: 1,
    },
    {
      name: "shop_license",
      maxCount: 1,
    },
    {
      name: "medical_council_registration",
      maxCount: 1,
    },
    {
      name: "electricity_bill",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      if (!req.session.user) {
        return res.json({
          success: false,
          message: "Unauthorized",
        });
      }
      const userId = req.session.user.id;
      const hospitalImages =
        req.files["hospital_images"]?.map((file) => file.filename) || [];

      const roomImages =
        req.files["room_images"]?.map((file) => file.filename) || [];
      let imagePointer = 0;
      const parsedRooms = JSON.parse(body.rooms || "[]");
      parsedRooms.forEach((room) => {
        const count = parseInt(room.imageCount) || 0;
        room.images = roomImages.slice(imagePointer, imagePointer + count);
        imagePointer += count;
      });
      const finalRoomsJson = JSON.stringify(parsedRooms);

      await pool.query(
        `
                INSERT INTO hospitals
                (
                    users_id,
                    hospital_images,
                    hospital_name,
                    address,
                    facilities,
                    rooms,
                    doctors,
                    hospital_reg_certificate,
                    shop_license,
                    medical_council_registration,
                    electricity_bill
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        [
          userId,
          JSON.stringify(hospitalImages),
          body.hospital_name,
          body.address,
          body.facilities,
          finalRoomsJson,
          body.doctors,
          req.files["hospital_reg_certificate"]?.[0]?.filename || null,
          req.files["shop_license"]?.[0]?.filename || null,
          req.files["medical_council_registration"]?.[0]?.filename || null,
          req.files["electricity_bill"]?.[0]?.filename || null,
        ],
      );
      res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
      });
    }
  },
);

//14
app.get("/api/user/hospitals", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [hospitals] = await pool.query(
      `
                    SELECT
                        id,
                        hospital_name
                    FROM hospitals
                    WHERE users_id = ?
                    `,
      [userId],
    );
    res.json({
      success: true,
      hospitals,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

//15
app.post("/api/add/room", upload.array("room_images", 4), async (req, res) => {
  try {
    const {
      hospital_id,
      details,
      pricing,
      room_type,
      total_beds,
      availability,
    } = req.body;
    const roomImages = req.files?.map((file) => file.filename) || [];
    const [rows] = await pool.query(
      `
                    SELECT rooms
                    FROM hospitals
                    WHERE id = ?
                    `,
      [hospital_id],
    );
    let rooms = [];
    if (rows[0].rooms) {
      if (typeof rows[0].rooms === "string") {
        rooms = JSON.parse(rows[0].rooms);
      } else {
        rooms = rows[0].rooms;
      }
    }
    rooms.push({
      details,
      pricing,
      room_type,
      total_beds,
      availability,
      images: roomImages,
    });
    await pool.query(
      `
                UPDATE hospitals
                SET rooms = ?
                WHERE id = ?
                `,
      [JSON.stringify(rooms), hospital_id],
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

app.get("/api/availability", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.session.user.id;
    const [hospitals] = await pool.query(
      `
                    SELECT
                        id,
                        hospital_name,
                        rooms
                    FROM hospitals
                    WHERE users_id = ?
                    `,
      [userId],
    );
    const availableRooms = [];
    const unavailableRooms = [];
    hospitals.forEach((hospital) => {
      if (!hospital.rooms) return;
      let rooms = [];
      if (typeof hospital.rooms === "string") {
        rooms = JSON.parse(hospital.rooms);
      } else {
        rooms = hospital.rooms;
      }
      rooms.forEach((room, index) => {
        const roomData = {
          hospital_id: hospital.id,
          room_index: index,
          hospital_name: hospital.hospital_name,
          details: room.details,
          pricing: room.pricing,
          room_type: room.room_type,
          total_beds: room.total_beds,
          availability: room.availability,
          images: formatUploadPaths(room.images),
        };
        if (room.availability.toLowerCase() === "available") {
          availableRooms.push(roomData);
        } else {
          unavailableRooms.push(roomData);
        }
      });
    });
    res.json({
      success: true,
      availableRooms,
      unavailableRooms,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//16
app.put("/api/update/room", async (req, res) => {
  try {
    const { hospital_id, room_index, total_beds, availability } = req.body;
    const [rows] = await pool.query(
      `
            SELECT rooms
            FROM hospitals
            WHERE id = ?
            `,
      [hospital_id],
    );
    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Hospital Not Found",
      });
    }
    let rooms = rows[0].rooms;
    if (typeof rooms === "string") {
      rooms = JSON.parse(rooms);
    }
    rooms[room_index].total_beds = total_beds;
    rooms[room_index].availability = availability;
    await pool.query(
      `
            UPDATE hospitals
            SET rooms = ?
            WHERE id = ?
            `,
      [JSON.stringify(rooms), hospital_id],
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//17
app.get("/api/ambulances", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
      });
    }
    const userId = req.session.user.id;
    const [ambulances] = await pool.query(
      `
                    SELECT *
                    FROM ambulances
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
      [userId],
    );
    res.json({
      success: true,
      ambulances,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

//18
app.post(
  "/api/add/ambulance",
  upload.fields([
    {
      name: "lic",
      maxCount: 1,
    },
    {
      name: "rc",
      maxCount: 1,
    },
    {
      name: "veh_ins",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: "Login Required" });
      }
      const body = req.body;
      const userId = req.session.user.id;
      await pool.query(
        `
                INSERT INTO ambulances
                (
                    users_id,
                    ambulance_type,
                    base_chrge,
                    min_chrge,
                    night_chrg,
                    wait_chrg,
                    status,
                    eta,
                    book_time_slot,
                    area,
                    description,
                    lic,
                    rc,
                    driver_exp,
                    veh_ins
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        [
          userId,
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
          req.files["lic"]?.[0]?.filename || null,
          req.files["rc"]?.[0]?.filename || null,
          body.driver_exp,
          req.files["veh_ins"]?.[0]?.filename || null,
        ],
      );
      res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
      });
    }
  },
);

//19
app.get("/api/ambulance/availability", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Login Required",
        available: [],
        busy: [],
      });
    }

    const userId = req.session.user.id;
    const [ambulances] = await pool.query(
      `
                    SELECT *
                    FROM ambulances
                    WHERE users_id = ?
                    `,
      [userId],
    );
    const available = [];
    const busy = [];
    ambulances.forEach((ambulance) => {
      if (ambulance.status === "Available") {
        available.push(ambulance);
      } else {
        busy.push(ambulance);
      }
    });
    res.json({
      success: true,
      available,
      busy,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      available: [],
      busy: [],
    });
  }
});

app.put("/api/update/ambulance", async (req, res) => {
  try {
    const { id, base_chrge, status } = req.body;
    if (base_chrge && base_chrge !== 0) {
      await pool.query(
        `
                    UPDATE ambulances
                    SET
                    base_chrge = ?,
                    status = ?
                    WHERE id = ?
                    `,
        [base_chrge, status, id],
      );
    } else {
      await pool.query(
        `
                    UPDATE ambulances
                    SET
                    status = ?
                    WHERE id = ?
                    `,
        [status, id],
      );
    }
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

app.delete("/api/ambulance/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Login Required",
      });
    }

    const ambulanceId = req.params.id;
    const [ambulances] = await pool.query(
      `
                SELECT id
                FROM ambulances
                WHERE id = ?
                AND users_id = ?
                `,
      [ambulanceId, req.session.user.id],
    );

    if (ambulances.length === 0) {
      return res.json({
        success: false,
        message: "Unauthorized or Invalid Ambulance",
      });
    }

    await pool.query(
      `
            DELETE FROM ambulances
            WHERE id = ?
            `,
      [ambulanceId],
    );

    res.json({
      success: true,
      message: "Ambulance Deleted",
    });
  } catch (error) {
    console.log(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.json({
        success: false,
        message:
          "Cannot delete ambulance because it has active or past bookings.",
      });
    }

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//20
app.get("/api/user/insurances", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const userId = req.session.user.id;
    const [insurances] = await pool.query(
      `
                    SELECT *
                    FROM insurances
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
      [userId],
    );
    res.json({
      success: true,
      insurances: insurances,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//21
app.post(
  "/api/add/insurance",
  upload.fields([
    {
      name: "reg_doc",
      maxCount: 1,
    },
    {
      name: "policy_doc",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({
          success: false,
          message: "Please Login First",
        });
      }
      const userId = req.session.user.id;
      const {
        comp_name,
        comp_type,
        ins_description,
        irdai_number,
        comp_pan,
        gst_number,
        ins_address,
        claim_type,
        required_docs,
        claim_approval_time,
        contact_number,
        ins_email,
      } = req.body;
      const regDoc = req.files.reg_doc ? req.files.reg_doc[0].filename : null;
      const addressProof = req.files.policy_doc
        ? req.files.policy_doc[0].filename
        : null;
      await pool.query(
        `INSERT INTO insurances(
                    users_id, comp_name, comp_type, description, irdai, comp_pan, gst, incorp_cert, offc_add,
                    add_proof, claim_type, doc_req, claim_time, cust_sup_num, email_sup)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
        [
          userId,
          safeString(comp_name),
          safeString(comp_type),
          safeString(ins_description),
          safeString(irdai_number),
          safeString(comp_pan),
          safeString(gst_number),
          regDoc,
          safeString(ins_address),
          addressProof,
          safeString(claim_type),
          safeString(required_docs),
          safeString(claim_approval_time),
          safeString(contact_number),
          safeString(ins_email),
        ],
      );
      res.json({
        success: true,
        message: "Insurance Added Successfully",
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

//22
app.get("/api/labs", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
      });
    }
    const userId = req.session.user.id;
    const [labs] = await pool.query(
      `
                    SELECT *
                    FROM labs
                    WHERE users_id = ?
                    ORDER BY id DESC
                    `,
      [userId],
    );
    res.json({
      success: true,
      labs,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

// Vendor Payouts Endpoint
app.get("/api/vendor/payouts", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.json({ success: false, payouts: [] });
    }
    const vendorId = req.session.user.id;
    const [payouts] = await pool.query(
      `SELECT * FROM vendor_payouts WHERE vendor_id = ? ORDER BY id DESC`,
      [vendorId]
    );
    res.json({ success: true, payouts });
  } catch (error) {
    console.error("Error fetching vendor payouts:", error);
    res.json({ success: false, payouts: [] });
  }
});

//23
app.post(
  "/api/add/lab",
  upload.fields([
    {
      name: "lab_reg",
      maxCount: 1,
    },
    {
      name: "nabl",
      maxCount: 1,
    },
    {
      name: "path_qual_cer",
      maxCount: 1,
    },
    {
      name: "pathologist_proofs",
      maxCount: 100,
    },
    {
      name: "pathologist_certs",
      maxCount: 100,
    },
    {
      name: "pathologist_images",
      maxCount: 100,
    },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({
          success: false,
          message: "Unauthorized",
        });
      }
      const body = req.body;
      const userId = req.session.user.id;

      const pathologists = JSON.parse(body.pathologist || "[]");
      const pathologistProofs = req.files["pathologist_proofs"] || [];
      const pathologistCerts = req.files["pathologist_certs"] || [];
      const pathologistImages = req.files["pathologist_images"] || [];
      let proofPointer = 0;
      let certPointer = 0;
      let imagePointer = 0;
      pathologists.forEach((p) => {
        if (p.hasProof) {
          p.proof = pathologistProofs[proofPointer++]?.filename || null;
        } else {
          p.proof = null;
        }
        if (p.hasCert) {
          p.cert = pathologistCerts[certPointer++]?.filename || null;
        } else {
          p.cert = null;
        }
        if (p.hasImage) {
          p.image = pathologistImages[imagePointer++]?.filename || null;
        } else {
          p.image = null;
        }
      });

      await pool.query(
        `
                INSERT INTO labs
                (
                    users_id,
                    lab_name,
                    address,
                    location,
                    description,
                    lab_type,
                    test,
                    home_coll,
                    extra_chrg,
                    available_areas,
                    lab_reg,
                    nabl,
                    path_qual_cer,
                    pathologist,
                    adv_equipment,
                    lab_hrs,
                    test_time,
                    emergency_test,
                    test_price
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                `,
        [
          userId,
          body.lab_name,
          body.address,
          body.location,
          body.description,
          body.lab_type,
          body.test,
          body.home_coll,
          body.extra_chrg ? parseInt(body.extra_chrg) : 0,
          body.available_areas,
          req.files["lab_reg"]?.[0]?.filename || null,
          req.files["nabl"]?.[0]?.filename || null,
          req.files["path_qual_cer"]?.[0]?.filename || null,
          JSON.stringify(pathologists),
          body.adv_equipment,
          body.lab_hrs,
          body.test_time,
          body.emergency_test,
          body.test_price,
        ],
      );
      res.json({
        success: true,
        message: "Lab Added Successfully",
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

//24
app.post(
  "/api/add/medicine",
  upload.fields([
    {
      name: "medicine_image",
      maxCount: 1,
    },
    {
      name: "medicine_excel_file",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({
          success: false,
          message: "Unauthorized Access",
        });
      }
      const userId = req.session.user.id;
      const body = req.body;
      const medicineImage = req.files?.medicine_image?.[0]?.filename || null;
      const excelFile = req.files?.medicine_excel_file?.[0] || null;
      if (excelFile) {
        const workbook = XLSX.readFile(excelFile.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        for (const med of data) {
          await pool.query(
            `
                        INSERT INTO med_lists
                        (
                            vendor_id,
                            medicine_name,
                            generic_name,
                            brand_name,
                            medicine_type,
                            category,
                            manufacturer,
                            composition,
                            mrp,
                            selling_price,
                            gst_percentage,
                            discount_percentage,
                            stock_quantity,
                            minimum_stock_alert,
                            batch_number,
                            manufacturing_date,
                            expiry_date,
                            prescription_required,
                            schedule_type,
                            uses_info,
                            dosage_instructions,
                            side_effects,
                            warnings,
                            storage_instructions,
                            delivery_available,
                            delivery_charge,
                            medicine_image,
                            barcode_number,
                            medicine_status,
                            featured_medicine,
                            user_id
                        )
                        VALUES
                        (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                            ?
                        )
                        `,
            [
              userId,
              med.medicine_name || "",
              med.generic_name || null,
              med.brand_name || null,
              med.medicine_type || "Tablet",
              med.category || null,
              med.manufacturer || null,
              med.composition || null,
              parseFloat(med.mrp) || 0,
              parseFloat(med.selling_price) || 0,
              parseFloat(med.gst_percentage) || 0,
              parseFloat(med.discount_percentage) || 0,
              parseInt(med.stock_quantity) || 0,
              parseInt(med.minimum_stock_alert) || 10,
              med.batch_number || null,
              med.manufacturing_date || null,
              med.expiry_date || null,
              med.prescription_required || "No",
              med.schedule_type || "OTC",
              med.uses_info || null,
              med.dosage_instructions || null,
              med.side_effects || null,
              med.warnings || null,
              med.storage_instructions || null,
              med.delivery_available || "Yes",
              parseFloat(med.delivery_charge) || 0,
              null,
              med.barcode_number || null,
              med.medicine_status || "Active",
              med.featured_medicine || "No",
              userId,
            ],
          );
        }
        return res.json({
          success: true,
          message: "Excel Medicines Added Successfully",
        });
      }
      if (!body.medicine_name || !body.mrp || !body.selling_price) {
        return res.json({
          success: false,
          message: "Please Fill Required Fields",
        });
      }
      await pool.query(
        `
                INSERT INTO med_lists
                (
                    vendor_id,
                    medicine_name,
                    generic_name,
                    brand_name,
                    medicine_type,
                    category,
                    manufacturer,
                    composition,
                    mrp,
                    selling_price,
                    gst_percentage,
                    discount_percentage,
                    stock_quantity,
                    minimum_stock_alert,
                    batch_number,
                    manufacturing_date,
                    expiry_date,
                    prescription_required,
                    schedule_type,
                    uses_info,
                    dosage_instructions,
                    side_effects,
                    warnings,
                    storage_instructions,
                    delivery_available,
                    delivery_charge,
                    medicine_image,
                    barcode_number,
                    medicine_status,
                    featured_medicine,
                    user_id
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?
                )
                `,
        [
          userId,
          body.medicine_name,
          body.generic_name || null,
          body.brand_name || null,
          body.medicine_type || "Tablet",
          body.category || null,
          body.manufacturer || null,
          body.composition || null,
          parseFloat(body.mrp) || 0,
          parseFloat(body.selling_price) || 0,
          parseFloat(body.gst_percentage) || 0,
          parseFloat(body.discount_percentage) || 0,
          parseInt(body.stock_quantity) || 0,
          parseInt(body.minimum_stock_alert) || 10,
          body.batch_number || null,
          body.manufacturing_date || null,
          body.expiry_date || null,
          body.prescription_required || "No",
          body.schedule_type || "OTC",
          body.uses_info || null,
          body.dosage_instructions || null,
          body.side_effects || null,
          body.warnings || null,
          body.storage_instructions || null,
          body.delivery_available || "Yes",
          parseFloat(body.delivery_charge) || 0,
          medicineImage,
          body.barcode_number || null,
          body.medicine_status || "Active",
          body.featured_medicine || "No",
          userId,
        ],
      );
      return res.json({
        success: true,
        message: "Medicine Added Successfully",
      });
    } catch (error) {
      console.log("Medicine Insert Error:", error);
      return res.json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

//25
app.get("/api/medicines", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.session.user.id;
    const [medicines] = await pool.query(
      `
            SELECT *
            FROM med_lists
            WHERE vendor_id=?
            ORDER BY medicine_id DESC
            `,
      [userId],
    );
    return res.json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.log("Load Medicines Error:", error);
    return res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//26
app.post(
  "/api/add/equipment-product",
  upload.fields([
    {
      name: "thumbnail_image",
      maxCount: 1,
    },
    {
      name: "product_manual",
      maxCount: 1,
    },
    {
      name: "product_video",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res.json({
          success: false,
        });
      }
      const body = req.body;
      const vendorId = req.session.user.id;
      await pool.query(
        `
                INSERT INTO med_eq_prd
                (
                    vendor_id,
                    product_name,
                    brand_name,
                    category,
                    sub_category,
                    model_number,
                    manufacturer,
                    country_of_origin,
                    product_description,
                    mrp,
                    selling_price,
                    stock_quantity,
                    stock_status,
                    warranty_period,
                    delivery_available,
                    delivery_charge,
                    thumbnail_image,
                    product_manual,
                    product_video
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        [
          vendorId,
          body.product_name,
          body.brand_name,
          body.category,
          body.sub_category,
          body.model_number,
          body.manufacturer,
          body.country_of_origin,
          body.product_description,
          body.mrp,
          body.selling_price,
          body.stock_quantity,
          body.stock_status,
          body.warranty_period,
          body.delivery_available,
          body.delivery_charge,
          req.files["thumbnail_image"]?.[0]?.filename || null,
          req.files["product_manual"]?.[0]?.filename || null,
          req.files["product_video"]?.[0]?.filename || null,
        ],
      );
      res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
      });
    }
  },
);

//27
app.get("/api/equipment-products", async (req, res) => {
  try {
    const vendorId = req.session.user.id;
    const [products] = await pool.query(
      `
                    SELECT *
                    FROM med_eq_prd
                    WHERE vendor_id = ?
                    ORDER BY product_id DESC
                    `,
      [vendorId],
    );
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

//28
app.get("/api/featured-hospitals", async (req, res) => {
  try {
    const [hospitals] = await pool.query(`
        SELECT 
            hospitals.id,
            hospitals.hospital_name,
            hospitals.address,
            hospitals.location,
            hospitals.facilities,
            hospitals.hospital_images,
            hospitals.rooms
        FROM hospitals
        INNER JOIN users 
        ON hospitals.users_id = users.id
        WHERE users.status = 'approved'
        ORDER BY hospitals.id DESC
        `);
    const formattedHospitals = hospitals.map((hospital) => {
      let image = "";
      let totalBeds = 0;
      let startingPrice = 0;
      let facilities = [];
      let parsedImages = [];
      let parsedRooms = [];
      if (Array.isArray(hospital.hospital_images)) {
        parsedImages = hospital.hospital_images;
      } else {
        try {
          parsedImages = JSON.parse(hospital.hospital_images || "[]");
        } catch (error) {
          parsedImages = [];
        }
      }
      if (Array.isArray(hospital.rooms)) {
        parsedRooms = hospital.rooms;
      } else {
        try {
          parsedRooms = JSON.parse(hospital.rooms || "[]");
        } catch (error) {
          parsedRooms = [];
        }
      }
      if (parsedImages.length > 0) {
        const firstImage = parsedImages[0];
        if (firstImage) {
          image = `/uploads/${firstImage}`;
        }
      }
      parsedRooms.forEach((room) => {
        totalBeds += Number(room.total_beds || 0);

        const roomPrice = Number(room.pricing || 0);

        if (startingPrice === 0 || roomPrice < startingPrice) {
          startingPrice = roomPrice;
        }
      });
      if (hospital.facilities) {
        facilities = hospital.facilities
          .split(",")
          .map((facility) => facility.trim())
          .slice(0, 3);
      }
      return {
        id: hospital.id,
        hospital_name: hospital.hospital_name,
        location: hospital.location || hospital.address,
        image,
        images: parsedImages.map((img) => "/uploads/" + img),
        totalBeds,
        facilities,
        pricing: startingPrice,
      };
    });
    res.json({
      success: true,
      hospitals: formattedHospitals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//29
app.post(
  "/api/product-register",
  upload.fields([
    {
      name: "profile_photo",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      const [existing] = await pool.query(
        `SELECT id
             FROM product_users
             WHERE email = ?
             OR phone = ?`,
        [body.email, body.phone],
      );
      if (existing.length > 0) {
        return res.json({
          success: false,
          message: "Email or Phone already exists",
        });
      }
      await pool.query(
        `
            INSERT INTO product_users
            (
                full_name,
                email,
                phone,
                password,
                gender,
                dob,
                blood_group,
                profile_photo,
                address,
                city,
                state,
                pincode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          body.full_name,
          body.email,
          body.phone,
          body.password,
          body.gender,
          body.dob || null,
          body.blood_group || null,
          req.files["profile_photo"]?.[0]?.filename || null,
          body.address || null,
          body.city || null,
          body.state || null,
          body.pincode || null,
        ],
      );
      res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

//30
app.post("/api/product-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      `
                SELECT *
                FROM product_users
                WHERE email = ?
                AND password = ?
                `,
      [email, password],
    );
    if (users.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const user = users[0];
    req.session.productUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };
    req.session.save((err) => {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          message: "Session Error",
        });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
        },
      });
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//31
app.get("/api/all-featured-hospitals", async (req, res) => {
  try {
    const [hospitals] = await pool.query(`
        SELECT 
            hospitals.id,
            hospitals.hospital_name,
            hospitals.address,
            hospitals.location,
            hospitals.facilities,
            hospitals.hospital_images,
            hospitals.rooms
        FROM hospitals
        INNER JOIN users 
        ON hospitals.users_id = users.id
        WHERE users.status = 'approved'
        ORDER BY hospitals.id DESC
        `);
    const formattedHospitals = hospitals.map((hospital) => {
      let image = "";
      let totalBeds = 0;
      let startingPrice = 0;
      let facilities = [];
      let parsedImages = [];
      let parsedRooms = [];
      if (Array.isArray(hospital.hospital_images)) {
        parsedImages = hospital.hospital_images;
      } else {
        try {
          parsedImages = JSON.parse(hospital.hospital_images || "[]");
        } catch (error) {
          parsedImages = [];
        }
      }
      if (Array.isArray(hospital.rooms)) {
        parsedRooms = hospital.rooms;
      } else {
        try {
          parsedRooms = JSON.parse(hospital.rooms || "[]");
        } catch (error) {
          parsedRooms = [];
        }
      }
      if (parsedImages.length > 0) {
        const firstImage = parsedImages[0];
        if (firstImage) {
          image = `/uploads/${firstImage}`;
        }
      }
      parsedRooms.forEach((room) => {
        totalBeds += Number(room.total_beds || 0);

        const roomPrice = Number(room.pricing || 0);

        if (startingPrice === 0 || roomPrice < startingPrice) {
          startingPrice = roomPrice;
        }
      });
      if (hospital.facilities) {
        facilities = hospital.facilities
          .split(",")
          .map((facility) => facility.trim())
          .slice(0, 3);
      }
      return {
        id: hospital.id,
        hospital_name: hospital.hospital_name,
        location: hospital.location || hospital.address,
        image,
        images: parsedImages.map((img) => "/uploads/" + img),
        totalBeds,
        facilities,
        pricing: startingPrice,
      };
    });
    res.json({
      success: true,
      hospitals: formattedHospitals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//32
app.get("/api/all-ambulances", async (req, res) => {
  try {
    const [ambulances] = await pool.query(`
            SELECT
                ambulances.*
            FROM ambulances
            INNER JOIN users
            ON ambulances.users_id = users.id
            WHERE users.status = 'approved' and
            ambulances.status = 'Available'
            ORDER BY ambulances.id DESC
        `);
    const formattedAmbulances = ambulances.map((ambulance) => {
      return {
        id: ambulance.id,
        ambulance_type: ambulance.ambulance_type,
        area: ambulance.area,
        status: ambulance.status,
        eta: ambulance.eta,
        driver_exp: ambulance.driver_exp,
        base_chrge: ambulance.base_chrge,
        description: ambulance.description,
      };
    });
    res.json({
      success: true,
      ambulances: formattedAmbulances,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//33
app.get("/api/all-labs", async (req, res) => {
  try {
    const [labs] = await pool.query(`
            SELECT
                labs.*
            FROM labs
            INNER JOIN users
            ON labs.users_id = users.id
            WHERE users.status = 'approved'
            ORDER BY labs.id DESC
        `);
    const formattedLabs = labs.map((lab) => {
      let labTypes = [];
      let tests = [];
      try {
        labTypes = JSON.parse(lab.lab_type || "[]");
      } catch (error) {
        labTypes = [];
      }
      try {
        tests = JSON.parse(lab.test || "[]");
      } catch (error) {
        tests = [];
      }
      return {
        id: lab.id,
        lab_name: lab.lab_name,
        address: lab.address,
        description: lab.description,
        labTypes,
        tests,
        home_coll: lab.home_coll,
        emergency_test: lab.emergency_test,
        test_price: lab.test_price,
        available_areas: lab.available_areas,
        pathologist: lab.pathologist,
      };
    });
    res.json({
      success: true,
      labs: formattedLabs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//34
app.get("/api/all-insurances", async (req, res) => {
  try {
    const [insurances] = await pool.query(`
            SELECT insurances.*
            FROM insurances
            INNER JOIN users
            ON insurances.users_id = users.id
            WHERE users.status = 'approved'
            ORDER BY insurances.id DESC
        `);
    res.json({
      success: true,
      insurances,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//35
app.get("/api/all-medicines", async (req, res) => {
  try {
    const [medicines] = await pool.query(`
            SELECT
                med_lists.*
            FROM med_lists
            INNER JOIN users
            ON med_lists.vendor_id = users.id
            WHERE users.status = 'approved'
            ORDER BY med_lists.medicine_id DESC
        `);
    const formattedMedicines = medicines.map((medicine) => {
      return {
        medicine_id: medicine.medicine_id,
        medicine_name: medicine.medicine_name,
        generic_name: medicine.generic_name,
        brand_name: medicine.brand_name,
        medicine_type: medicine.medicine_type,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        mrp: medicine.mrp,
        selling_price: medicine.selling_price,
        stock_quantity: medicine.stock_quantity,
        medicine_image: medicine.medicine_image,
        delivery_charge: medicine.delivery_charge,
      };
    });
    res.json({
      success: true,
      medicines: formattedMedicines,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//36
app.get("/api/all-equipments", async (req, res) => {
  try {
    const [equipments] = await pool.query(`
            SELECT
                med_eq_prd.*
            FROM med_eq_prd
            INNER JOIN users
            ON med_eq_prd.vendor_id = users.id
            WHERE users.status = 'approved'
            ORDER BY product_id DESC
        `);
    res.json({
      success: true,
      equipments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//37
app.get("/api/hospital/bookings", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        bookings: [],
      });
    }

    const userId = req.session.user.id;

    console.log("Hospital Owner:", userId);

    const [bookings] = await pool.query(
      `
            SELECT

                uhb.*,

                h.hospital_name

            FROM
            user_hospital_bookings uhb

            INNER JOIN hospitals h
            ON uhb.hospital_id = h.id

            WHERE h.users_id = ?

            ORDER BY uhb.id DESC
            `,
      [userId],
    );

    console.log(bookings);

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      bookings: [],
    });
  }
});

//38
app.get("/api/hospital/:id", async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const [rows] = await pool.execute(
      `
            SELECT * FROM hospitals
            WHERE id = ?
        `,
      [hospitalId],
    );
    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }
    const hospital = rows[0];
    if (typeof hospital.hospital_images === "string") {
      hospital.hospital_images = JSON.parse(hospital.hospital_images);
    }
    if (typeof hospital.rooms === "string") {
      hospital.rooms = JSON.parse(hospital.rooms);
    }
    if (typeof hospital.doctors === "string") {
      hospital.doctors = JSON.parse(hospital.doctors);
    }
    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error",
    });
  }
});

//39
app.post("/api/book-hospital", async (req, res) => {
  try {
    const {
      user_id,
      hospital_id,
      patient_name,
      patient_age,
      patient_gender,
      room_type,
      bed_type,
      admission_date,
      discharge_date,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    if (
      !user_id ||
      !hospital_id ||
      !patient_name ||
      !patient_age ||
      !patient_gender ||
      !room_type ||
      !admission_date ||
      !discharge_date
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    let paymentStatus = "Paid";
    if (
      razorpay_signature !== "pending" &&
      generated_signature !== razorpay_signature
    ) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }
    if (razorpay_signature === "pending") {
      paymentStatus = "Pending";
    }
    const [result] = await pool.execute(
      `INSERT INTO
            user_hospital_bookings(
                user_id,
                hospital_id,
                patient_name,
                patient_age,
                patient_gender,
                room_type,
                bed_type,
                admission_date,
                discharge_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                payment_status
            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        user_id,
        hospital_id,
        patient_name,
        patient_age,
        patient_gender,
        room_type,
        bed_type,
        admission_date,
        discharge_date,
        total_amount,
        razorpay_order_id,
        razorpay_payment_id,
        paymentStatus,
      ],
    );
    res.json({
      success: true,
      message: "Hospital booking successful",
      booking_id: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//40
app.post("/api/book-ambulance", async (req, res) => {
  try {
    const {
      user_id,
      ambulance_id,
      patient_name,
      patient_condition,
      pickup_address,
      destination_address,
      booking_date,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    if (
      !user_id ||
      !ambulance_id ||
      !patient_name ||
      !pickup_address ||
      !destination_address ||
      !booking_date
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generated_signature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }
    const [result] = await pool.execute(
      `INSERT INTO
            user_ambulance_bookings(
                user_id,
                ambulance_id,
                patient_name,
                patient_condition,
                pickup_address,
                destination_address,
                booking_date,
                total_amount,
                razorpay_order_id,
                razorpay_payment_id,
                payment_status
            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        user_id,
        ambulance_id,
        patient_name,
        patient_condition,
        pickup_address,
        destination_address,
        booking_date,
        total_amount,
        razorpay_order_id,
        razorpay_payment_id,
        paymentStatus,
      ],
    );
    await pool.execute(
      `
            UPDATE ambulances
            SET status = ?
            WHERE id = ?
            `,
      ["Busy / On trip", ambulance_id],
    );
    res.json({
      success: true,
      message: "Ambulance booking successful",
      booking_id: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//41
app.get("/api/ambulance/bookings", async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `
                SELECT user_ambulance_bookings.*,
                ambulances.status
                AS ambulance_status
                FROM user_ambulance_bookings
                LEFT JOIN ambulances
                ON user_ambulance_bookings.ambulance_id=ambulances.id
                WHERE user_ambulance_bookings.booking_status
                NOT LIKE '%completed%'
                ORDER BY
                user_ambulance_bookings.id
                DESC
                `,
    );
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

app.post("/api/ambulance/bookings/add", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Login Required",
      });
    }

    const {
      ambulance_id,
      patient_name,
      total_amount,
      patient_condition,
      pickup_address,
      destination_address,
      booking_status,
      payment_status,
    } = req.body;

    const [ambulances] = await pool.query(
      `
                SELECT id
                FROM ambulances
                WHERE id = ?
                AND users_id = ?
                `,
      [ambulance_id, req.session.user.id],
    );

    if (ambulances.length === 0) {
      return res.json({
        success: false,
        message: "Unauthorized or Invalid Ambulance",
      });
    }

    await pool.query(
      `
            INSERT INTO user_ambulance_bookings
            (
                ambulance_id,
                patient_name,
                total_amount,
                patient_condition,
                pickup_address,
                destination_address,
                booking_status,
                payment_status,
                booking_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
      [
        ambulance_id,
        patient_name,
        total_amount,
        patient_condition,
        pickup_address,
        destination_address,
        booking_status,
        payment_status,
      ],
    );

    res.json({
      success: true,
      message: "Booking Added",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

app.post("/api/ambulance/add-manual-booking", async (req, res) => {
  try {
    const vendor_id = req.session.vendor ? req.session.vendor.id : null;
    const {
      patient_name,
      patient_condition,
      pickup_address,
      destination_address,
      ambulance_type,
      booking_date,
      total_amount,
    } = req.body;

    let ambulance_id = null;
    if (vendor_id) {
      const [ambulances] = await pool.query(
        "SELECT id FROM ambulances WHERE users_id = ? AND ambulance_type = ? LIMIT 1",
        [vendor_id, ambulance_type],
      );
      if (ambulances.length > 0) {
        ambulance_id = ambulances[0].id;
      } else {
        const [anyAmbulances] = await pool.query(
          "SELECT id FROM ambulances WHERE users_id = ? LIMIT 1",
          [vendor_id],
        );
        if (anyAmbulances.length > 0) {
          ambulance_id = anyAmbulances[0].id;
        }
      }
    }

    const [result] = await pool.query(
      `
            INSERT INTO user_ambulance_bookings (
                ambulance_id,
                patient_name,
                patient_condition,
                pickup_address,
                destination_address,
                booking_date,
                total_amount,
                booking_status,
                payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
        `,
      [
        ambulance_id,
        patient_name,
        patient_condition,
        pickup_address,
        destination_address,
        booking_date,
        total_amount,
      ],
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Database Error" });
  }
});

//42
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Order creation failed",
    });
  }
});

//43
app.post("/api/book-lab-test", async (req, res) => {
  try {
    const {
      user_id,
      lab_vendor_id,
      test_name,
      patient_name,
      sample_collection_type,
      booking_date,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const sql = `
                INSERT INTO
                user_lab_test_bookings
                (
                    user_id,
                    lab_vendor_id,
                    test_name,
                    patient_name,
                    sample_collection_type,
                    booking_date,
                    total_amount,
                    payment_status
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
            `;
    pool.query(
      sql,
      [
        user_id,
        lab_vendor_id,
        test_name,
        patient_name,
        sample_collection_type,
        booking_date,
        total_amount,
        "paid",
      ],
      (error, result) => {
        if (error) {
          console.log(error);
          return res.json({
            success: false,
            message: "Database Error",
          });
        }
        res.json({
          success: true,
          message: "Lab Test Booked",
        });
      },
    );
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//44
app.post("/api/buy-insurance", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      insurance_vendor_id,
      plan_name,
      premium_amount,
      plan_duration,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const [plans] = await pool.query(
      `
                SELECT id, comp_name, ins_price, claim_price
                FROM insurances
                WHERE id = ?
                `,
      [insurance_vendor_id],
    );

    if (plans.length === 0) {
      return res.json({
        success: false,
        message: "Insurance plan not found",
      });
    }

    const plan = plans[0];
    const durationMonths = Math.max(1, Number(plan_duration) || 1);
    const monthlyPremium =
      parseAmount(plan.ins_price) || parseAmount(premium_amount);
    const payablePremium = calculateInsurancePremium(
      monthlyPremium,
      durationMonths,
    );
    const finalPremium = parseAmount(premium_amount) || payablePremium;
    const coverage_amount = parseAmount(plan.claim_price) || finalPremium * 20;
    const policy_number = "POL" + Math.floor(100000 + Math.random() * 900000);
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    await pool.query(
      `
                INSERT INTO
                user_insurance_purchases
                (
                    user_id, insurance_vendor_id, plan_name, policy_number, coverage_amount, premium_amount, start_date,
                    expiry_date, insurance_status, payment_status
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                    'active',
                    'paid'
                )
                `,
      [
        req.session.productUser.id,
        insurance_vendor_id,
        plan_name || plan.comp_name,
        policy_number,
        coverage_amount,
        finalPremium,
        startDate,
        expiryDate,
      ],
    );
    res.json({
      success: true,
      message: "Insurance Purchased Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

app.get("/api/user/insurance-policies", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.productUser.id;

    await pool.query(
      `
            UPDATE user_insurance_purchases
            SET insurance_status = 'expired'
            WHERE user_id = ?
            AND expiry_date < CURDATE()
            AND insurance_status = 'active'
            `,
      [userId],
    );

    const [policies] = await pool.query(
      `
            SELECT
                p.*,
                i.comp_name,
                i.comp_type,
                i.claim_type,
                i.claim_time,
                i.claim_price,
                i.ins_price,
                i.cust_sup_num,
                i.email_sup,
                (
                    SELECT COUNT(*)
                    FROM user_insurance_claims c
                    WHERE c.insurance_purchase_id = p.id
                ) AS claim_count
            FROM user_insurance_purchases p
            LEFT JOIN insurances i
            ON p.insurance_vendor_id = i.id
            WHERE p.user_id = ?
            ORDER BY p.id DESC
            `,
      [userId],
    );

    res.json({
      success: true,
      policies,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

app.get("/api/user/insurance-claims", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.productUser.id;

    const [claims] = await pool.query(
      `
            SELECT
                c.*,
                p.policy_number,
                p.plan_name,
                p.coverage_amount,
                i.comp_name,
                i.claim_type
            FROM user_insurance_claims c
            LEFT JOIN user_insurance_purchases p
            ON c.insurance_purchase_id = p.id
            LEFT JOIN insurances i
            ON p.insurance_vendor_id = i.id
            WHERE c.user_id = ?
            ORDER BY c.id DESC
            `,
      [userId],
    );

    res.json({
      success: true,
      claims,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

app.post(
  "/api/user/insurance-claims",
  upload.single("claim_documents"),
  async (req, res) => {
    try {
      if (!req.session.productUser) {
        return res.json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.session.productUser.id;
      const { insurance_purchase_id, claim_amount, claim_reason } = req.body;

      const claimAmount = parseAmount(claim_amount);

      if (
        !insurance_purchase_id ||
        claimAmount <= 0 ||
        !safeString(claim_reason)
      ) {
        return res.json({
          success: false,
          message: "Please fill claim details correctly",
        });
      }

      const [policies] = await pool.query(
        `
                SELECT id, coverage_amount, insurance_status
                FROM user_insurance_purchases
                WHERE id = ?
                AND user_id = ?
                `,
        [insurance_purchase_id, userId],
      );

      if (policies.length === 0) {
        return res.json({
          success: false,
          message: "Policy not found",
        });
      }

      const policy = policies[0];
      const coverageAmount = parseAmount(policy.coverage_amount);

      if (String(policy.insurance_status || "").toLowerCase() !== "active") {
        return res.json({
          success: false,
          message: "Only active policies can be claimed",
        });
      }

      if (coverageAmount > 0 && claimAmount > coverageAmount) {
        return res.json({
          success: false,
          message: "Claim amount cannot exceed coverage amount",
        });
      }

      await pool.query(
        `
                INSERT INTO user_insurance_claims
                (
                    user_id,
                    insurance_purchase_id,
                    claim_amount,
                    claim_reason,
                    medical_documents,
                    claim_status
                )
                VALUES (?, ?, ?, ?, ?, 'pending')
                `,
        [
          userId,
          insurance_purchase_id,
          claimAmount,
          safeString(claim_reason),
          req.file?.filename || null,
        ],
      );

      res.json({
        success: true,
        message: "Claim submitted successfully",
      });
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

app.post("/api/user/insurance-renewal", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.productUser.id;
    const { purchase_id, plan_duration, premium_amount } = req.body;

    const durationMonths = Math.max(1, Number(plan_duration) || 1);

    const [policies] = await pool.query(
      `
            SELECT
                p.*,
                i.ins_price
            FROM user_insurance_purchases p
            LEFT JOIN insurances i
            ON p.insurance_vendor_id = i.id
            WHERE p.id = ?
            AND p.user_id = ?
            `,
      [purchase_id, userId],
    );

    if (policies.length === 0) {
      return res.json({
        success: false,
        message: "Policy not found",
      });
    }

    const policy = policies[0];
    const monthlyPremium =
      parseAmount(policy.ins_price) || parseAmount(policy.premium_amount);
    const payablePremium = calculateInsurancePremium(
      monthlyPremium,
      durationMonths,
    );
    const finalPremium = parseAmount(premium_amount) || payablePremium;
    const now = new Date();
    const currentExpiry = policy.expiry_date
      ? new Date(policy.expiry_date)
      : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const nextExpiry = new Date(baseDate);
    nextExpiry.setMonth(nextExpiry.getMonth() + durationMonths);

    await pool.query(
      `
            UPDATE user_insurance_purchases
            SET
                start_date = ?,
                expiry_date = ?,
                premium_amount = ?,
                insurance_status = 'active',
                payment_status = 'paid'
            WHERE id = ?
            AND user_id = ?
            `,
      [now, nextExpiry, finalPremium, purchase_id, userId],
    );

    res.json({
      success: true,
      message: "Policy renewed successfully",
      expiry_date: nextExpiry,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//45

// ======================= NEW CHECKOUT FLOW =======================

app.post("/api/checkout", upload.single("prescription"), async (req, res) => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
        if (!req.session.productUser) {
            return res.json({ success: false, message: "Unauthorized. Please login." });
        }
        
        const userId = req.session.productUser.id;
        const cart = JSON.parse(req.body.cart || '[]');
        const deliveryAddress = req.body.delivery_address || 'No address provided';
        const prescriptionFile = req.file ? req.file.filename : null;

        if (!cart || cart.length === 0) {
            return res.json({ success: false, message: "Cart is empty" });
        }

        let totalCartAmount = 0;
        let createdOrders = []; // To track { type, id }

        // Group items by type and vendor
        const grouped = { medicine: {}, equipment: {} };

        for (let item of cart) {
            if (item.type === 'medicine') {
                const [medRows] = await conn.query(`SELECT * FROM med_lists WHERE medicine_id = ?`, [item.id]);
                if (medRows.length === 0) throw new Error(`Medicine ${item.name} not found`);
                const med = medRows[0];
                const vendorId = med.vendor_id;
                
                if (!grouped.medicine[vendorId]) grouped.medicine[vendorId] = { items: [], total: 0, requiresPrescription: false };
                
                const price = Number(med.selling_price) || 0;
                const subtotal = price * item.qty;
                totalCartAmount += subtotal;
                grouped.medicine[vendorId].total += subtotal;
                if (med.prescription_required === 'Yes' || med.prescription_required === 'yes') {
                    grouped.medicine[vendorId].requiresPrescription = true;
                }
                
                grouped.medicine[vendorId].items.push({
                    medicine_id: med.medicine_id,
                    qty: item.qty,
                    price: price,
                    subtotal: subtotal
                });
            } else if (item.type === 'equipment') {
                const [eqRows] = await conn.query(`SELECT * FROM med_eq_prd WHERE product_id = ?`, [item.id]);
                if (eqRows.length === 0) throw new Error(`Equipment ${item.name} not found`);
                const eq = eqRows[0];
                const vendorId = eq.vendor_id;
                
                if (!grouped.equipment[vendorId]) grouped.equipment[vendorId] = { items: [], total: 0 };
                
                const price = Number(eq.selling_price) || 0;
                const subtotal = price * item.qty;
                totalCartAmount += subtotal;
                grouped.equipment[vendorId].total += subtotal;
                
                grouped.equipment[vendorId].items.push({
                    equipment_id: eq.product_id,
                    qty: item.qty,
                    price: price,
                    subtotal: subtotal
                });
            }
        }

        // Create local orders
        for (const vendorId in grouped.medicine) {
            const group = grouped.medicine[vendorId];
            const prescStatus = group.requiresPrescription ? 'PENDING' : 'NOT_REQUIRED';
            if (group.requiresPrescription && !prescriptionFile) {
                throw new Error("Prescription is required for some medicines in your cart.");
            }

            const [orderRes] = await conn.query(
                `INSERT INTO user_medicine_orders (user_id, medicine_vendor_id, delivery_address, total_amount, payment_method, payment_status, order_status, prescription_file, prescription_status)
                 VALUES (?, ?, ?, ?, 'online', 'pending', 'PENDING_PAYMENT', ?, ?)`,
                [userId, vendorId, deliveryAddress, group.total, prescriptionFile, prescStatus]
            );
            const orderId = orderRes.insertId;
            createdOrders.push({ type: 'medicine', id: orderId });

            for (let item of group.items) {
                await conn.query(
                    `INSERT INTO user_medicine_order_items (medicine_order_id, medicine_id, quantity, price, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.medicine_id, item.qty, item.price, item.subtotal]
                );
            }
        }

        for (const vendorId in grouped.equipment) {
            const group = grouped.equipment[vendorId];
            const [orderRes] = await conn.query(
                `INSERT INTO user_equipment_orders (user_id, equipment_vendor_id, order_type, delivery_address, total_amount, payment_status, order_status)
                 VALUES (?, ?, 'buy', ?, ?, 'pending', 'PENDING_PAYMENT')`,
                [userId, vendorId, deliveryAddress, group.total]
            );
            const orderId = orderRes.insertId;
            createdOrders.push({ type: 'equipment', id: orderId });

            for (let item of group.items) {
                await conn.query(
                    `INSERT INTO user_equipment_order_items (equipment_order_id, equipment_id, quantity, price, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.equipment_id, item.qty, item.price, item.subtotal]
                );
            }
        }

        if (totalCartAmount <= 0) throw new Error("Cart total is zero");

        // Create Razorpay Order
        const rzpOptions = {
            amount: Math.round(totalCartAmount * 100),
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };
        const rzpOrder = await razorpay.orders.create(rzpOptions);

        // Update local orders with razorpay_order_id
        for (let ord of createdOrders) {
            if (ord.type === 'medicine') {
                await conn.query(`UPDATE user_medicine_orders SET razorpay_order_id = ? WHERE id = ?`, [rzpOrder.id, ord.id]);
            } else {
                await conn.query(`UPDATE user_equipment_orders SET razorpay_order_id = ? WHERE id = ?`, [rzpOrder.id, ord.id]);
            }
        }

        await conn.commit();
        conn.release();

        res.json({
            success: true,
            razorpay_order_id: rzpOrder.id,
            amount: rzpOptions.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error("Checkout Error:", error);
        res.json({ success: false, message: error.message || "Checkout failed" });
    }
});

app.post("/api/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
            
        if (expectedSignature !== razorpay_signature) {
            // Update to FAILED
            await pool.query(`UPDATE user_medicine_orders SET payment_status = 'failed', order_status = 'CANCELLED' WHERE razorpay_order_id = ?`, [razorpay_order_id]);
            await pool.query(`UPDATE user_equipment_orders SET payment_status = 'failed', order_status = 'CANCELLED' WHERE razorpay_order_id = ?`, [razorpay_order_id]);
            return res.json({ success: false, message: "Invalid payment signature" });
        }

        // Success
        await pool.query(`UPDATE user_medicine_orders SET payment_status = 'paid', order_status = 'CONFIRMED', razorpay_payment_id = ? WHERE razorpay_order_id = ?`, [razorpay_payment_id, razorpay_order_id]);
        await pool.query(`UPDATE user_equipment_orders SET payment_status = 'paid', order_status = 'CONFIRMED', razorpay_payment_id = ? WHERE razorpay_order_id = ?`, [razorpay_payment_id, razorpay_order_id]);

        // Create transaction logs (optional but good practice based on existing app logic)
        const [medOrders] = await pool.query(`SELECT user_id, id, total_amount FROM user_medicine_orders WHERE razorpay_order_id = ?`, [razorpay_order_id]);
        for(let ord of medOrders) {
            await pool.query(`INSERT INTO user_payments (user_id, payment_for, reference_id, payment_method, transaction_id, amount, payment_status) VALUES (?, 'medicine_order', ?, 'razorpay', ?, ?, 'success')`, [ord.user_id, ord.id, razorpay_payment_id, ord.total_amount]);
        }
        
        const [eqOrders] = await pool.query(`SELECT user_id, id, total_amount FROM user_equipment_orders WHERE razorpay_order_id = ?`, [razorpay_order_id]);
        for(let ord of eqOrders) {
            await pool.query(`INSERT INTO user_payments (user_id, payment_for, reference_id, payment_method, transaction_id, amount, payment_status) VALUES (?, 'equipment_order', ?, 'razorpay', ?, ?, 'success')`, [ord.user_id, ord.id, razorpay_payment_id, ord.total_amount]);
        }

        res.json({ success: true, message: "Payment verified successfully" });
    } catch(err) {
        console.error("Payment Verify Error:", err);
        res.json({ success: false, message: "Payment verification failed" });
    }
});

app.post("/api/vendor/order/status", async (req, res) => {
    try {
        if (!req.session.user && !req.session.admin) return res.json({ success: false, message: "Unauthorized" });
        const { order_id, type, order_status, prescription_status } = req.body;
        
        if (type === 'medicine') {
            const updates = [];
            const params = [];
            if (order_status) { updates.push('order_status = ?'); params.push(order_status); }
            if (prescription_status) { updates.push('prescription_status = ?'); params.push(prescription_status); }
            
            if (updates.length > 0) {
                params.push(order_id);
                await pool.query(`UPDATE user_medicine_orders SET ${updates.join(', ')} WHERE id = ?`, params);
            }
        } else if (type === 'equipment') {
            if (order_status) {
                await pool.query(`UPDATE user_equipment_orders SET order_status = ? WHERE id = ?`, [order_status, order_id]);
            }
        }
        res.json({ success: true });
    } catch(err) {
        console.error("Status Update Error:", err);
        res.json({ success: false });
    }
});

// ======================= END NEW CHECKOUT FLOW =======================

app.post("/api/buy-product", async (req, res) => {
  try {
    const {
      user_id,
      product_type,
      product_id,
      quantity,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
    } = req.body;

    let product;

    // ========================= MEDICINE =========================

    if (product_type === "medicine") {
      // PRODUCT TABLE = med_lists

      const [medicineRows] = await pool.query(
        `
                SELECT *
                FROM med_lists
                WHERE medicine_id = ?
                `,
        [product_id],
      );

      console.log("Medicine Rows:", medicineRows);

      if (!medicineRows.length) {
        return res.json({
          success: false,
          message: "Medicine Not Found",
        });
      }

      product = medicineRows[0];

      const productPrice = Number(product.selling_price) || 0;

      // CREATE ORDER

      const [orderResult] = await pool.query(
        `
                INSERT INTO
                user_medicine_orders
                (
                    user_id,
                    medicine_vendor_id,
                    total_amount,
                    payment_method,
                    payment_status,
                    order_status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'online',
                    'paid',
                    'placed'
                )
                `,
        [user_id, product.vendor_id, total_amount],
      );

      const orderId = orderResult.insertId;

      // INSERT ITEM

      await pool.query(
        `
                INSERT INTO
                user_medicine_order_items
                (
                    medicine_order_id,
                    medicine_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
        [orderId, product.medicine_id, quantity, productPrice, total_amount],
      );

      // PAYMENT ENTRY

      await pool.query(
        `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'medicine_order',
                    ?,
                    'razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,
        [user_id, orderId, razorpay_payment_id, total_amount],
      );
    }

    // ========================= EQUIPMENT =========================
    else if (product_type === "equipment") {
      // PRODUCT TABLE = med_eq_prd

      const [equipmentRows] = await pool.query(
        `
                SELECT *
                FROM med_eq_prd
                WHERE product_id = ?
                `,
        [product_id],
      );

      console.log("Equipment Rows:", equipmentRows);

      if (!equipmentRows.length) {
        return res.json({
          success: false,
          message: "Equipment Not Found",
        });
      }

      product = equipmentRows[0];

      const productPrice = Number(product.selling_price) || 0;

      // CREATE ORDER

      const [orderResult] = await pool.query(
        `
                INSERT INTO
                user_equipment_orders
                (
                    user_id,
                    equipment_vendor_id,
                    order_type,
                    total_amount,
                    payment_status,
                    order_status
                )
                VALUES
                (
                    ?,
                    ?,
                    'buy',
                    ?,
                    'paid',
                    'placed'
                )
                `,
        [user_id, product.vendor_id, total_amount],
      );

      const orderId = orderResult.insertId;

      // INSERT ITEM

      await pool.query(
        `
                INSERT INTO
                user_equipment_order_items
                (
                    equipment_order_id,
                    equipment_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
        [orderId, product.product_id, quantity, productPrice, total_amount],
      );

      // PAYMENT ENTRY

      await pool.query(
        `
                INSERT INTO
                user_payments
                (
                    user_id,
                    payment_for,
                    reference_id,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    'equipment_order',
                    ?,
                    'razorpay',
                    ?,
                    ?,
                    'success'
                )
                `,
        [user_id, orderId, razorpay_payment_id, total_amount],
      );
    } else {
      return res.json({
        success: false,
        message: "Invalid Product Type",
      });
    }

    // ========================= INVOICE =========================

    const invoiceNumber = "INV" + Date.now();

    return res.json({
      success: true,

      message: "Purchase Successful",

      invoice_url: `/invoice/${invoiceNumber}`,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//46
app.get("/invoice/:invoiceNumber", async (req, res) => {
  const invoice = req.params.invoiceNumber;
  res.send(`
            <html>
                <head>
                    <title>
                        Invoice
                    </title>
                </head>
                <body style="
                    font-family:Poppins;
                    padding:40px;
                ">
                    <h1>
                        HospiKare Invoice
                    </h1>
                    <hr>
                    <h2>
                        Invoice Number:
                        ${invoice}
                    </h2>
                    <p>
                        Payment Successful
                    </p>
                </body>
            </html>
        `);
});

//47
app.put("/api/update-booking-status", async (req, res) => {
  try {
    const { booking_id, ambulance_id, booking_status, ambulance_status } =
      req.body;

    // UPDATE BOOKING STATUS

    await pool.query(
      `
                UPDATE
                user_ambulance_bookings

                SET
                booking_status = ?

                WHERE id = ?
                `,

      [booking_status, booking_id],
    );

    // UPDATE AMBULANCE STATUS
    if (ambulance_status !== null && ambulance_status !== undefined) {
      await pool.query(
        `
                    UPDATE
                    ambulances

                    SET
                    status = ?

                    WHERE id = ?
                    `,
        [ambulance_status, ambulance_id],
      );
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,

      message: "Server Error",
    });
  }
});

//48
app.get("/api/insurance/bookings", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorUserId = req.session.user.id;

    await pool.query(
      `
            UPDATE user_insurance_purchases p
            INNER JOIN insurances i
            ON p.insurance_vendor_id = i.id
            SET p.insurance_status = 'expired'
            WHERE i.users_id = ?
            AND p.expiry_date < CURDATE()
            AND p.insurance_status = 'active'
            `,
      [vendorUserId],
    );

    const [bookings] = await pool.query(
      `
                SELECT
                    p.*,
                    product_users.full_name,
                    product_users.email,
                    product_users.phone,
                    insurances.comp_name
                FROM user_insurance_purchases p
                LEFT JOIN product_users
                ON p.user_id = product_users.id
                LEFT JOIN insurances
                ON p.insurance_vendor_id = insurances.id
                WHERE insurances.users_id = ?
                ORDER BY p.id DESC
                `,
      [vendorUserId],
    );

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//51
app.post("/api/lab/bookings/add", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      lab_vendor_id,
      test_name,
      patient_name,
      sample_collection_type,
      booking_date,
      total_amount,
      booking_status,
      payment_status,
    } = req.body;

    const [labs] = await pool.query(
      "SELECT id FROM labs WHERE id = ? AND users_id = ?",
      [lab_vendor_id, req.session.user.id],
    );
    if (labs.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid Lab Center Selected" });
    }

    const query = `
            INSERT INTO user_lab_test_bookings 
            (user_id, lab_vendor_id, test_name, patient_name, sample_collection_type, booking_date, total_amount, booking_status, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    await pool.query(query, [
      req.session.user.id,
      lab_vendor_id,
      test_name,
      patient_name,
      sample_collection_type,
      booking_date,
      total_amount,
      booking_status,
      payment_status,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/lab/bookings", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const vendorUserId = req.session.user.id;
    const [bookings] = await pool.query(
      `
            SELECT
                user_lab_test_bookings.*,
                product_users.full_name,
                product_users.email,
                product_users.phone,
                labs.lab_name
            FROM user_lab_test_bookings
            LEFT JOIN product_users ON user_lab_test_bookings.user_id = product_users.id
            LEFT JOIN labs ON user_lab_test_bookings.lab_vendor_id = labs.id
            WHERE labs.users_id = ?
            ORDER BY user_lab_test_bookings.id DESC
            `,
      [vendorUserId],
    );
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
});

app.post("/api/lab/booking/status", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const { booking_id, status } = req.body;
    await pool.query(
      `UPDATE user_lab_test_bookings SET booking_status = ? WHERE id = ?`,
      [status, booking_id],
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
});

//49
app.get("/api/lab/patients", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorUserId = req.session.user.id;

    const [patients] = await pool.query(
      `
                SELECT

                    user_lab_test_bookings.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,
                    product_users.gender,
                    product_users.city,
                    product_users.state,
                    product_users.profile_photo,

                    labs.lab_name

                FROM user_lab_test_bookings

                LEFT JOIN product_users

                ON user_lab_test_bookings.user_id =
                product_users.id

                LEFT JOIN labs

                ON user_lab_test_bookings.lab_vendor_id =
                labs.id

                WHERE labs.users_id = ?

                ORDER BY user_lab_test_bookings.id DESC
                `,
      [vendorUserId],
    );

    res.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//50
app.get("/api/lab/reports", async (req, res) => {
  try {
    const vendorUserId = req.session.user.id;

    const [reports] = await pool.query(
      `
                SELECT

                    user_lab_test_bookings.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,

                    labs.lab_name

                FROM user_lab_test_bookings

                LEFT JOIN product_users

                ON user_lab_test_bookings.user_id =
                product_users.id

                LEFT JOIN labs

                ON user_lab_test_bookings.lab_vendor_id =
                labs.id

                WHERE labs.users_id = ?

                ORDER BY user_lab_test_bookings.id DESC
                `,
      [vendorUserId],
    );

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//51
app.post("/api/upload/report", upload.single("report"), async (req, res) => {
  try {
    const { booking_id } = req.body;

    if (!req.file) {
      return res.json({
        success: false,
        message: "No File Uploaded",
      });
    }

    const reportFile = req.file.filename;

    await pool.query(
      `
            UPDATE
            user_lab_test_bookings

            SET
            report_file = ?

            WHERE id = ?
            `,
      [reportFile, booking_id],
    );

    res.json({
      success: true,
      file: reportFile,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
});

//52
app.get("/api/insurance/customers", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
      });
    }

    const vendorUserId = req.session.user.id;

    await pool.query(
      `
            UPDATE user_insurance_purchases p
            INNER JOIN insurances i
            ON p.insurance_vendor_id = i.id
            SET p.insurance_status = 'expired'
            WHERE i.users_id = ?
            AND p.expiry_date < CURDATE()
            AND p.insurance_status = 'active'
            `,
      [vendorUserId],
    );

    const [customers] = await pool.query(
      `
                SELECT

                    user_insurance_purchases.*,

                    product_users.full_name,
                    product_users.email,
                    product_users.phone,
                    product_users.gender,
                    product_users.city,
                    product_users.state,
                    product_users.profile_photo,

                    insurances.comp_name

                FROM user_insurance_purchases

                LEFT JOIN product_users

                ON user_insurance_purchases.user_id =
                product_users.id

                LEFT JOIN insurances

                ON user_insurance_purchases.insurance_vendor_id =
                insurances.id

                WHERE insurances.users_id = ?

                ORDER BY
                user_insurance_purchases.id DESC
                `,
      [vendorUserId],
    );

    res.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

app.get("/api/insurance/claims", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorUserId = req.session.user.id;

    await pool.query(
      `
            UPDATE user_insurance_purchases p
            INNER JOIN insurances i
            ON p.insurance_vendor_id = i.id
            SET p.insurance_status = 'expired'
            WHERE i.users_id = ?
            AND p.expiry_date < CURDATE()
            AND p.insurance_status = 'active'
            `,
      [vendorUserId],
    );

    const [claims] = await pool.query(
      `
            SELECT
                c.*,
                p.policy_number,
                p.plan_name,
                p.coverage_amount,
                p.premium_amount,
                p.insurance_status,
                product_users.full_name,
                product_users.email,
                product_users.phone,
                insurances.comp_name,
                insurances.claim_type
            FROM user_insurance_claims c
            LEFT JOIN user_insurance_purchases p
            ON c.insurance_purchase_id = p.id
            LEFT JOIN product_users
            ON c.user_id = product_users.id
            LEFT JOIN insurances
            ON p.insurance_vendor_id = insurances.id
            WHERE insurances.users_id = ?
            ORDER BY FIELD(c.claim_status, 'pending', 'approved', 'rejected'), c.id DESC
            `,
      [vendorUserId],
    );

    res.json({
      success: true,
      claims,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

app.post("/api/insurance/claims/status", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorUserId = req.session.user.id;
    const { claim_id, status } = req.body;
    const allowedStatuses = new Set(["pending", "approved", "rejected"]);
    const nextStatus = String(status || "").toLowerCase();

    if (!claim_id || !allowedStatuses.has(nextStatus)) {
      return res.json({
        success: false,
        message: "Invalid claim status",
      });
    }

    const [claims] = await pool.query(
      `
            SELECT c.id
            FROM user_insurance_claims c
            LEFT JOIN user_insurance_purchases p
            ON c.insurance_purchase_id = p.id
            LEFT JOIN insurances
            ON p.insurance_vendor_id = insurances.id
            WHERE c.id = ?
            AND insurances.users_id = ?
            `,
      [claim_id, vendorUserId],
    );

    if (claims.length === 0) {
      return res.json({
        success: false,
        message: "Claim not found",
      });
    }

    await pool.query(
      `
            UPDATE user_insurance_claims
            SET claim_status = ?
            WHERE id = ?
            `,
      [nextStatus, claim_id],
    );

    res.json({
      success: true,
      message: "Claim status updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//53
// ==================== UPDATED VENDOR ORDERS ====================
app.get("/api/medicine/orders", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: "Unauthorized" });
        const vendorId = req.session.user.id;
        
        const sql = `
            SELECT umo.id, umo.total_amount, umo.payment_status, umo.order_status, umo.ordered_at, umo.delivery_address, umo.prescription_status, umo.prescription_file,
            p.full_name, p.email, p.phone,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', ml.medicine_name, 'qty', umoi.quantity, 'price', umoi.price)) 
             FROM user_medicine_order_items umoi JOIN med_lists ml ON umoi.medicine_id = ml.medicine_id 
             WHERE umoi.medicine_order_id = umo.id) AS products
            FROM user_medicine_orders umo 
            LEFT JOIN product_users p ON umo.user_id = p.id
            WHERE umo.medicine_vendor_id = ?
            ORDER BY umo.id DESC
        `;
        const [orders] = await pool.query(sql, [vendorId]);
        res.json({ success: true, orders });
    } catch(err) {
        console.error(err);
        res.json({ success: false });
    }
});

app.get("/api/equipment/orders", async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: false, message: "Unauthorized" });
        const vendorId = req.session.user.id;
        
        const sql = `
            SELECT ueo.id, ueo.total_amount, ueo.payment_status, ueo.order_status, ueo.created_at as ordered_at, ueo.delivery_address,
            p.full_name, p.email, p.phone,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', mep.product_name, 'qty', ueoi.quantity, 'price', ueoi.price)) 
             FROM user_equipment_order_items ueoi JOIN med_eq_prd mep ON ueoi.equipment_id = mep.product_id 
             WHERE ueoi.equipment_order_id = ueo.id) AS products
            FROM user_equipment_orders ueo 
            LEFT JOIN product_users p ON ueo.user_id = p.id
            WHERE ueo.equipment_vendor_id = ?
            ORDER BY ueo.id DESC
        `;
        const [orders] = await pool.query(sql, [vendorId]);
        res.json({ success: true, orders });
    } catch(err) {
        console.error(err);
        res.json({ success: false });
    }
});
// ==================== END UPDATED VENDOR ORDERS ====================

app.get("/api/medicine/orders_OLD", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const vendorId = req.session.user.id;
    const sql = `
            SELECT
                umo.id,
                umo.total_amount,
                umo.payment_status,
                umo.order_status,
                umo.ordered_at,
                p.full_name,
                p.email,
                p.phone,
                umoi.quantity,
                umoi.price,
                umoi.subtotal,
                ml.medicine_name
            FROM user_medicine_orders umo
            LEFT JOIN product_users p
            ON umo.user_id = p.id
            LEFT JOIN user_medicine_order_items umoi
            ON umo.id = umoi.medicine_order_id
            LEFT JOIN med_lists ml
            ON umoi.medicine_id = ml.medicine_id
            WHERE ml.vendor_id = ?
            ORDER BY umo.id DESC
        `;
    const [orders] = await pool.query(sql, [vendorId]);
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});
//53b - Dashboard Data
app.get("/api/medicine/dashboard", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const vendorId = req.session.user.id;

    // Stock metrics
    const [stockResult] = await pool.query(
      `SELECT COUNT(*) as total_medicines, SUM(IF(stock_quantity <= minimum_stock_alert, 1, 0)) as low_stock FROM med_lists WHERE vendor_id = ?`,
      [vendorId],
    );

    // Payments metrics
    const [paymentResult] = await pool.query(
      `SELECT SUM(umoi.subtotal) as total_revenue
             FROM user_medicine_order_items umoi
             LEFT JOIN user_medicine_orders umo ON umoi.medicine_order_id = umo.id
             LEFT JOIN med_lists ml ON umoi.medicine_id = ml.medicine_id
             WHERE ml.vendor_id = ? AND umo.payment_status != 'failed'`,
      [vendorId],
    );

    // Monthly orders graph data
    const [monthlyOrders] = await pool.query(
      `SELECT DATE_FORMAT(umo.ordered_at, '%b %Y') as month, COUNT(DISTINCT umo.id) as order_count, SUM(umoi.subtotal) as revenue
             FROM user_medicine_orders umo
             LEFT JOIN user_medicine_order_items umoi ON umo.id = umoi.medicine_order_id
             LEFT JOIN med_lists ml ON umoi.medicine_id = ml.medicine_id
             WHERE ml.vendor_id = ? AND umo.ordered_at >= DATE_SUB(NOW(), INTERVAL 11 MONTH)
             GROUP BY DATE_FORMAT(umo.ordered_at, '%b %Y'), YEAR(umo.ordered_at), MONTH(umo.ordered_at)
             ORDER BY YEAR(umo.ordered_at) ASC, MONTH(umo.ordered_at) ASC`,
      [vendorId],
    );

    const last12Months = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const monthStr = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      last12Months.push({
        month: monthStr,
        order_count: 0,
        revenue: 0,
      });
    }

    monthlyOrders.forEach((order) => {
      const index = last12Months.findIndex((m) => m.month === order.month);
      if (index !== -1) {
        last12Months[index].order_count = order.order_count;
        last12Months[index].revenue = order.revenue || 0;
      }
    });

    res.json({
      success: true,
      stock: stockResult[0] || { total_medicines: 0, low_stock: 0 },
      revenue: paymentResult[0]?.total_revenue || 0,
      monthlyOrders: last12Months,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server Error" });
  }
});

//54
app.get("/api/equipment/orders_OLD", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorId = req.session.user.id;

    const sql = `
            SELECT

                ueo.id,
                ueo.order_type,
                ueo.total_amount,
                ueo.payment_status,
                ueo.order_status,
                ueo.created_at,

                pu.full_name,
                pu.email,
                pu.phone,

                ueoi.quantity,
                ueoi.price,
                ueoi.subtotal,

                mep.product_name

            FROM user_equipment_orders ueo

            LEFT JOIN product_users pu
            ON ueo.user_id = pu.id

            LEFT JOIN user_equipment_order_items ueoi
            ON ueo.id = ueoi.equipment_order_id

            LEFT JOIN med_eq_prd mep
            ON ueoi.equipment_id = mep.product_id

            WHERE mep.vendor_id = ?

            ORDER BY ueo.id DESC
        `;

    const [orders] = await pool.query(sql, [vendorId]);

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//55
app.get("/api/equipment/customers", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const vendorId = req.session.user.id;

    const sql = `
            SELECT DISTINCT

                pu.id,
                pu.full_name,
                pu.email,
                pu.phone,
                pu.gender,
                pu.city,
                pu.state,
                pu.profile_photo,

                COUNT(ueo.id) AS total_orders,
                SUM(ueo.total_amount) AS total_spent,
                MAX(ueo.created_at) AS last_order_at

            FROM user_equipment_orders ueo

            LEFT JOIN product_users pu
            ON ueo.user_id = pu.id

            WHERE ueo.equipment_vendor_id = ?

            GROUP BY pu.id

            ORDER BY total_orders DESC
        `;

    const [customers] = await pool.query(sql, [vendorId]);

    res.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//56
app.get("/api/user/orders", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.productUser.id;

    const [medicineOrders] = await pool.query(
      `
                SELECT
                    id,
                    total_amount,
                    payment_status,
                    order_status,
                    ordered_at AS created_at,
                    'Medicine' AS type
                FROM user_medicine_orders
                WHERE user_id = ?
                `,
      [userId],
    );

    const [equipmentOrders] = await pool.query(
      `
                SELECT
                    id,
                    total_amount,
                    payment_status,
                    order_status,
                    created_at,
                    'Equipment' AS type
                FROM user_equipment_orders
                WHERE user_id = ?
                `,
      [userId],
    );

    const allOrders = [...medicineOrders, ...equipmentOrders];

    allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      orders: allOrders,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//57
app.get("/api/user/history", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
      });
    }

    const userId = req.session.productUser.id;

    const history = [];

    /* ================= AMBULANCE ================= */

    const [ambulances] = await pool.query(
      `
                SELECT
                    id,
                    patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Ambulance Booking' AS type
                FROM user_ambulance_bookings
                WHERE user_id = ?
                `,
      [userId],
    );

    history.push(...ambulances);

    /* ================= LAB ================= */

    const [labs] = await pool.query(
      `
                SELECT
                    id,
                    test_name AS patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Lab Test' AS type
                FROM user_lab_test_bookings
                WHERE user_id = ?
                `,
      [userId],
    );

    history.push(...labs);

    /* ================= HOSPITAL ================= */

    const [hospitals] = await pool.query(
      `
                SELECT
                    id,
                    patient_name,
                    total_amount,
                    booking_status,
                    created_at,
                    'Hospital Booking' AS type
                FROM user_hospital_bookings
                WHERE user_id = ?
                `,
      [userId],
    );

    history.push(...hospitals);

    history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//58
app.get("/api/user/payments", async (req, res) => {
  try {
    if (!req.session.productUser) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.session.productUser.id;

    /* ================= FETCH PAYMENTS ================= */

    const [paymentRows] = await pool.query(
      `
                SELECT
                    id,
                    payment_for,
                    payment_method,
                    transaction_id,
                    amount,
                    payment_status,
                    paid_at
                FROM user_payments
                WHERE user_id = ?
                ORDER BY paid_at DESC
                `,
      [userId],
    );

    res.json({
      success: true,
      payments: paymentRows,
    });
  } catch (error) {
    console.log("Payments API Error:", error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//59
app.get("/api/admin/bookings", async (req, res) => {
  const bookings = [];

  const [hospital] = await pool.query(`
        SELECT
            id,
            patient_name AS user_name,
            total_amount,
            booking_status AS status,
            created_at,
            'Hospital' AS type
        FROM user_hospital_bookings
        `);

  const [lab] = await pool.query(`
        SELECT
            id,
            patient_name AS user_name,
            total_amount,
            booking_status AS status,
            created_at,
            'Lab' AS type
        FROM user_lab_test_bookings
        `);

  const [ambulance] = await pool.query(`
        SELECT
            id,
            patient_name AS user_name,
            total_amount,
            booking_status AS status,
            created_at,
            'Ambulance' AS type
        FROM user_ambulance_bookings
        `);

  bookings.push(...hospital);
  bookings.push(...lab);
  bookings.push(...ambulance);

  res.json({
    success: true,
    bookings,
  });
});

//60
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = [];

    // 1. Medicine
    
    // 2. Equipment
    // 1. Medicine
      const [medicine] = await pool.query(`
        SELECT umo.id, pu.full_name AS user_name, umo.total_amount, umo.payment_status, umo.order_status, 
        'Medicine' AS type, umo.ordered_at AS created_at, umo.delivery_address, umo.prescription_status, umo.prescription_file,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', ml.medicine_name, 'qty', umoi.quantity, 'price', umoi.price)) 
         FROM user_medicine_order_items umoi JOIN med_lists ml ON umoi.medicine_id = ml.medicine_id 
         WHERE umoi.medicine_order_id = umo.id) AS products
        FROM user_medicine_orders umo LEFT JOIN product_users pu ON umo.user_id = pu.id`);

      // 2. Equipment
      const [equipment] = await pool.query(`
        SELECT ueo.id, pu.full_name AS user_name, ueo.total_amount, ueo.payment_status, ueo.order_status, 
        'Equipment' AS type, ueo.created_at, ueo.delivery_address, NULL as prescription_status, NULL as prescription_file,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', mep.product_name, 'qty', ueoi.quantity, 'price', ueoi.price)) 
         FROM user_equipment_order_items ueoi JOIN med_eq_prd mep ON ueoi.equipment_id = mep.product_id 
         WHERE ueoi.equipment_order_id = ueo.id) AS products
        FROM user_equipment_orders ueo LEFT JOIN product_users pu ON ueo.user_id = pu.id`);
    // 3. Hospital Bookings
    const [hospital] = await pool.query(`SELECT hb.id, pu.full_name AS user_name, hb.total_amount, hb.booking_status AS payment_status, hb.booking_status AS order_status, 'Hospital Booking' AS type, hb.created_at FROM user_hospital_bookings hb LEFT JOIN product_users pu ON hb.user_id = pu.id`);
    // 4. Ambulance Bookings
    const [ambulance] = await pool.query(`SELECT ab.id, pu.full_name AS user_name, ab.total_amount, ab.booking_status AS payment_status, ab.booking_status AS order_status, 'Ambulance Booking' AS type, ab.created_at FROM user_ambulance_bookings ab LEFT JOIN product_users pu ON ab.user_id = pu.id`);
    // 5. Insurance
    const [insurance] = await pool.query(`SELECT ip.id, pu.full_name AS user_name, ip.premium_amount AS total_amount, ip.payment_status AS payment_status, ip.insurance_status AS order_status, 'Insurance' AS type, ip.created_at FROM user_insurance_purchases ip LEFT JOIN product_users pu ON ip.user_id = pu.id`);
    // 6. Lab Tests
    const [labs] = await pool.query(`SELECT lb.id, pu.full_name AS user_name, lb.total_amount, lb.payment_status AS payment_status, lb.booking_status AS order_status, 'Lab Booking' AS type, lb.created_at FROM user_lab_test_bookings lb LEFT JOIN product_users pu ON lb.user_id = pu.id`);

    orders.push(...medicine, ...equipment, ...hospital, ...ambulance, ...insurance, ...labs);

    // Sort descending by date
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

//61
app.get("/api/admin/payments", async (req, res) => {
  try {
    const [payments] = await pool.query(`
            SELECT
                user_payments.*,
                product_users.full_name AS user_name
            FROM user_payments

            LEFT JOIN product_users
            ON user_payments.user_id = product_users.id

            ORDER BY paid_at DESC
            `);

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//62
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = [];

    /* ================= MEDICINES ================= */

    const [medicines] = await pool.query(`
            SELECT
                medicine_id AS id,
                medicine_name AS product_name,
                medicine_image AS image,
                selling_price AS price,
                stock_quantity AS stock,
                'Medicine' AS type,
                users.name AS vendor_name
            FROM med_lists

            LEFT JOIN users
            ON med_lists.vendor_id = users.id
            `);

    /* ================= EQUIPMENTS ================= */

    const [equipments] = await pool.query(`
            SELECT
                product_id AS id,
                product_name,
                thumbnail_image AS image,
                selling_price AS price,
                stock_quantity AS stock,
                'Equipment' AS type,
                users.name AS vendor_name
            FROM med_eq_prd

            LEFT JOIN users
            ON med_eq_prd.vendor_id = users.id
            `);

    products.push(...medicines);
    products.push(...equipments);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//63
app.post("/api/admin/create-vendor-payment", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { vendorId, amount } = req.body;

    const finalAmount = parseInt(amount);

    if (!finalAmount || finalAmount <= 0) {
      return res.json({
        success: false,
        message: "No Revenue Available",
      });
    }

    const options = {
      amount: finalAmount * 100,
      currency: "INR",

      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      amount: options.amount,

      orderId: order.id,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,

      message: "Payment Creation Failed",
    });
  }
});

//64
app.post("/api/admin/verify-vendor-payment", async (req, res) => {
  try {
    const { vendorId, amount, razorpay_payment_id } = req.body;

    /* ================= SAVE PAYOUT ================= */

    await pool.query(
      `
            INSERT INTO vendor_payouts
            (
                vendor_id,
                amount,
                razorpay_payment_id,
                payout_status
            )
            VALUES
            (?, ?, ?, ?)
            `,
      [vendorId, amount, razorpay_payment_id, "paid"],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//65
app.get("/api/admin/vendor-invoice/:vendorId", async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    // ================= VENDOR =================

    const [vendorRows] = await pool.query(
      `
            SELECT
                *
            FROM
                users
            WHERE
                id = ?
            `,
      [vendorId],
    );

    if (vendorRows.length === 0) {
      return res.json({
        success: false,

        message: "Vendor Not Found",
      });
    }

    const vendor = vendorRows[0];

    const [serviceRows] = await pool.query(
      `
            SELECT
                'Medicine Orders' AS title,
                'Paid medicine order revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(total_amount), 0) AS amount
            FROM user_medicine_orders
            WHERE medicine_vendor_id = ?
            AND payment_status = 'paid'

            UNION ALL

            SELECT
                'Equipment Orders' AS title,
                'Paid medical equipment order revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(total_amount), 0) AS amount
            FROM user_equipment_orders
            WHERE equipment_vendor_id = ?
            AND payment_status = 'paid'

            UNION ALL

            SELECT
                'Hospital Bookings' AS title,
                'Paid hospital room booking revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(b.total_amount), 0) AS amount
            FROM user_hospital_bookings b
            INNER JOIN hospitals h
            ON b.hospital_id = h.id
            WHERE h.users_id = ?
            AND b.payment_status = 'paid'

            UNION ALL

            SELECT
                'Lab Test Bookings' AS title,
                'Paid lab test booking revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(b.total_amount), 0) AS amount
            FROM user_lab_test_bookings b
            INNER JOIN labs l
            ON b.lab_vendor_id = l.id
            WHERE l.users_id = ?
            AND b.payment_status = 'paid'

            UNION ALL

            SELECT
                'Ambulance Bookings' AS title,
                'Paid ambulance booking revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(b.total_amount), 0) AS amount
            FROM user_ambulance_bookings b
            INNER JOIN ambulances a
            ON b.ambulance_id = a.id
            WHERE a.users_id = ?
            AND LOWER(b.payment_status) = 'paid'

            UNION ALL

            SELECT
                'Insurance Premiums' AS title,
                'Paid insurance premium revenue' AS description,
                COUNT(*) AS quantity,
                COALESCE(SUM(p.premium_amount), 0) AS amount
            FROM user_insurance_purchases p
            INNER JOIN insurances i
            ON p.insurance_vendor_id = i.id
            WHERE i.users_id = ?
            AND p.payment_status = 'paid'
            `,
      [vendorId, vendorId, vendorId, vendorId, vendorId, vendorId],
    );

    // ================= PAYOUTS =================
    const [payouts] = await pool.query(
      `
    SELECT

        id,

        vendor_id,

        CAST(
            amount
            AS DECIMAL(10,2)
        ) AS amount,

        razorpay_payment_id,

        payout_status,

        paid_at

    FROM
        vendor_payouts

    WHERE
        vendor_id = ?

    ORDER BY
        id DESC
    `,
      [vendorId],
    );
    // ================= TOTAL =================

    const serviceItems = serviceRows
      .map((row) => ({
        title: row.title,
        description: row.description,
        quantity: Number(row.quantity || 0),
        amount: Number(row.amount || 0),
      }))
      .filter((row) => row.quantity > 0 || row.amount > 0);

    const grossRevenue = serviceItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    let total = 0;

    payouts.forEach((p) => {
      total += Number(p.amount || 0);
    });

    const paidAmount = total;
    const remainingAmount = Math.max(grossRevenue - paidAmount, 0);
    const invoiceStatus =
      grossRevenue <= 0
        ? "No Revenue"
        : remainingAmount <= 0
          ? "Paid"
          : "Unpaid";

    res.json({
      success: true,

      vendor,

      payouts,

      total,

      serviceItems,

      summary: {
        grossRevenue,
        paidAmount,
        remainingAmount,
        invoiceStatus,
      },
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,

      message: "Server Error",
    });
  }
});

//68
app.post("/api/admin/update-commission", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { user_type, commission_percent } = req.body;
    await pool.query(
      `
            INSERT INTO commissions
            (
                user_type,
                commission_percent
            )
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            commission_percent =
            VALUES(commission_percent)
            `,
      [user_type, commission_percent],
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

//69
app.put("/api/admin/update-commission/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { percent } = req.body;

    await pool.query(
      `
            UPDATE commissions

            SET
            commission_percent = ?

            WHERE id = ?
            `,
      [percent, id],
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//70
app.get("/api/commission-preview/:type/:amount", async (req, res) => {
  try {
    const type = req.params.type;
    const amount = Number(req.params.amount);
    const commissionPercent = await getCommissionPercent(type);
    const calculation = calculateCommissionAmount(amount, commissionPercent);
    res.json({
      success: true,
      ...calculation,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
    });
  }
});

//72
app.get("/api/admin/commissions", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [commissions] = await pool.query(
      `
            SELECT *
            FROM commissions
            ORDER BY id DESC
            `,
    );

    res.json({
      success: true,
      commissions,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//75
app.get("/api/user/invoices", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.session.user.id;
    const [hospitalInvoices] = await pool.query(
      `
                    SELECT
                        id,
                        'Hospital Booking'
                        AS payment_for,

                        hospital_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_hospital_bookings

                    WHERE user_id = ?
                    `,
      [userId],
    );

    /* ================= LAB ================= */

    const [labInvoices] = await pool.query(
      `
                    SELECT
                        id,
                        'Lab Test'
                        AS payment_for,

                        lab_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_lab_test_bookings

                    WHERE user_id = ?
                    `,
      [userId],
    );

    /* ================= MEDICINE ================= */

    const [medicineInvoices] = await pool.query(
      `
                    SELECT
                        id,
                        'Medicine Order'
                        AS payment_for,

                        medicine_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_medicine_orders

                    WHERE user_id = ?
                    `,
      [userId],
    );

    /* ================= EQUIPMENT ================= */

    const [equipmentInvoices] = await pool.query(
      `
                    SELECT
                        id,
                        'Medical Equipment'
                        AS payment_for,

                        product_name
                        AS location,

                        total_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_equipment_orders

                    WHERE user_id = ?
                    `,
      [userId],
    );

    /* ================= INSURANCE ================= */

    const [insuranceInvoices] = await pool.query(
      `
                    SELECT
                        id,
                        'Insurance'
                        AS payment_for,

                        insurance_name
                        AS location,

                        premium_amount
                        AS amount,

                        payment_status,

                        created_at
                        AS paid_at

                    FROM user_insurance_purchases

                    WHERE user_id = ?
                    `,
      [userId],
    );

    /* ================= MERGE ================= */

    const invoices = [
      ...hospitalInvoices,

      ...labInvoices,

      ...medicineInvoices,

      ...equipmentInvoices,

      ...insuranceInvoices,
    ];

    /* ================= SORT ================= */

    invoices.sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at));

    res.json({
      success: true,

      invoices,
    });
  } catch (error) {
    console.log("Invoice Error:", error);

    res.json({
      success: false,
    });
  }
});

//76
app.get("/api/user/invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;

    let invoiceData = null;

    let invoiceType = "";

    /* =======================================================
               PAYMENT INVOICE
            ======================================================= */

    if (invoiceId.startsWith("PAY-")) {
      const paymentId = invoiceId.replace("PAY-", "");

      const [payments] = await pool.query(
        `
                        SELECT
                            *
                        FROM user_payments
                        WHERE id = ?
                        `,
        [paymentId],
      );

      if (payments.length > 0) {
        const payment = payments[0];

        /* ================= MEDICINE PAYMENT ================= */

        if (payment.payment_for === "medicine_order") {
          const [medicineOrders] = await pool.query(
            `
                                SELECT

                                    umo.*,

                                    medicines.pharm_name,

                                    medicines.address
                                    AS pharmacy_address,

                                    users.name
                                    AS vendor_name,

                                    med_lists.medicine_name,

                                    user_medicine_order_items.quantity,

                                    user_medicine_order_items.price,

                                    user_medicine_order_items.subtotal

                                FROM user_medicine_orders umo

                                LEFT JOIN medicines
                                ON medicines.users_id =
                                umo.medicine_vendor_id

                                LEFT JOIN users
                                ON users.id =
                                umo.medicine_vendor_id

                                LEFT JOIN user_medicine_order_items
                                ON user_medicine_order_items.medicine_order_id =
                                umo.id

                                LEFT JOIN med_lists
                                ON med_lists.medicine_id =
                                user_medicine_order_items.medicine_id

                                WHERE umo.id = ?
                                `,
            [payment.reference_id],
          );

          if (medicineOrders.length > 0) {
            invoiceData = {
              ...medicineOrders[0],

              transaction_id: payment.transaction_id,

              payment_method: payment.payment_method,

              paid_at: payment.paid_at,
            };

            invoiceType = "Medicine Order";
          }
        } else if (payment.payment_for === "equipment_order") {

        /* ================= EQUIPMENT PAYMENT ================= */
          const [equipmentOrders] = await pool.query(
            `
                                SELECT

                                    ueo.*,

                                    med_eq_prd.product_name,

                                    med_eq_prd.brand_name,

                                    med_eq_prd.category,

                                    med_eq_prd.selling_price,

                                    med_equipments.ven_bus_name,

                                    med_equipments.address,

                                    users.name
                                    AS vendor_name,

                                    user_equipment_order_items.quantity,

                                    user_equipment_order_items.price,

                                    user_equipment_order_items.subtotal

                                FROM user_equipment_orders ueo

                                LEFT JOIN user_equipment_order_items
                                ON user_equipment_order_items.equipment_order_id =
                                ueo.id

                                LEFT JOIN med_eq_prd
                                ON med_eq_prd.product_id =
                                user_equipment_order_items.equipment_id

                                LEFT JOIN med_equipments
                                ON med_equipments.users_id =
                                ueo.equipment_vendor_id

                                LEFT JOIN users
                                ON users.id =
                                ueo.equipment_vendor_id

                                WHERE ueo.id = ?
                                `,
            [payment.reference_id],
          );

          if (equipmentOrders.length > 0) {
            invoiceData = {
              ...equipmentOrders[0],

              transaction_id: payment.transaction_id,

              payment_method: payment.payment_method,

              paid_at: payment.paid_at,
            };

            invoiceType = "Equipment Order";
          }
        }
      }
    } else if (invoiceId.startsWith("ORD-")) {

    /* =======================================================
               ORDER INVOICE
            ======================================================= */
      const orderId = invoiceId.replace("ORD-", "");

      /* ================= MEDICINE ORDER ================= */

      const [medicineOrders] = await pool.query(
        `
                        SELECT

                            umo.*,

                            medicines.pharm_name,

                            medicines.address
                            AS pharmacy_address,

                            users.name
                            AS vendor_name,

                            med_lists.medicine_name,

                            user_medicine_order_items.quantity,

                            user_medicine_order_items.price,

                            user_medicine_order_items.subtotal

                        FROM user_medicine_orders umo

                        LEFT JOIN medicines
                        ON medicines.users_id =
                        umo.medicine_vendor_id

                        LEFT JOIN users
                        ON users.id =
                        umo.medicine_vendor_id

                        LEFT JOIN user_medicine_order_items
                        ON user_medicine_order_items.medicine_order_id =
                        umo.id

                        LEFT JOIN med_lists
                        ON med_lists.medicine_id =
                        user_medicine_order_items.medicine_id

                        WHERE umo.id = ?
                        `,
        [orderId],
      );

      if (medicineOrders.length > 0) {
        invoiceData = medicineOrders[0];

        invoiceType = "Medicine Order";
      }

      /* ================= EQUIPMENT ORDER ================= */

      if (!invoiceData) {
        const [equipmentOrders] = await pool.query(
          `
                            SELECT

                                ueo.*,

                                med_eq_prd.product_name,

                                med_eq_prd.brand_name,

                                med_eq_prd.category,

                                med_eq_prd.selling_price,

                                med_equipments.ven_bus_name,

                                med_equipments.address,

                                users.name
                                AS vendor_name,

                                user_equipment_order_items.quantity,

                                user_equipment_order_items.price,

                                user_equipment_order_items.subtotal

                            FROM user_equipment_orders ueo

                            LEFT JOIN user_equipment_order_items
                            ON user_equipment_order_items.equipment_order_id =
                            ueo.id

                            LEFT JOIN med_eq_prd
                            ON med_eq_prd.product_id =
                            user_equipment_order_items.equipment_id

                            LEFT JOIN med_equipments
                            ON med_equipments.users_id =
                            ueo.equipment_vendor_id

                            LEFT JOIN users
                            ON users.id =
                            ueo.equipment_vendor_id

                            WHERE ueo.id = ?
                            `,
          [orderId],
        );

        if (equipmentOrders.length > 0) {
          invoiceData = equipmentOrders[0];

          invoiceType = "Equipment Order";
        }
      }
    }

    /* =======================================================
               NOT FOUND
            ======================================================= */

    if (!invoiceData) {
      return res.send(`
                    <h1>
                        Invoice Not Found
                    </h1>
                `);
    }

    /* =======================================================
               HTML
            ======================================================= */

    res.send(`

                <html>

                    <head>

                        <title>
                            Invoice
                        </title>

                        <style>

                            body{

                                font-family:Arial;
                                background:#f5f5f5;
                                padding:40px;

                            }

                            .invoiceBox{

                                max-width:900px;
                                margin:auto;
                                background:white;
                                padding:30px;
                                border-radius:12px;
                                box-shadow:
                                    0 0 15px rgba(
                                        0,
                                        0,
                                        0,
                                        0.1
                                    );

                            }

                            h1{

                                color:#ff1493;
                                margin-bottom:20px;

                            }

                            table{

                                width:100%;
                                border-collapse:collapse;

                            }

                            td{

                                border:1px solid #ddd;
                                padding:12px;

                            }

                            .heading{
                                color:#ff1493;
                                font-weight:bold;

                            }

                            .downloadBtn{

                                margin-top:20px;
                                background:#ff1493;
                                color:white;
                                border:none;
                                padding:12px 20px;
                                border-radius:6px;
                                cursor:pointer;

                            }

                        </style>

                    </head>

                    <body>

                        <div class="invoiceBox">
                        <div class="invoiceHeader">

    <div class="leftLogo">

        <img
            src="/assets/logo.png"
            alt="Hospikare Logo"
        >

    </div>

    <div class="centerHeading">


        <p>
            Medical & Healthcare Services
        </p>

    </div>

</div>

                            <h1>
                                ${invoiceType} Invoice
                            </h1>

                            <table>

                                <tr>

                                    <td class="heading">
                                        Invoice ID
                                    </td>

                                    <td>
                                        ${invoiceId}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Product / Service
                                    </td>

                                    <td>
                                        ${invoiceData.product_name || invoiceData.medicine_name || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Quantity
                                    </td>

                                    <td>
                                        ${invoiceData.quantity || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Vendor
                                    </td>

                                    <td>
                                        ${invoiceData.vendor_name || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Business
                                    </td>

                                    <td>
                                        ${invoiceData.pharm_name || invoiceData.ven_bus_name || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Address
                                    </td>

                                    <td>
                                        ${invoiceData.pharmacy_address || invoiceData.address || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Amount
                                    </td>

                                    <td>
                                        ₹${invoiceData.total_amount || invoiceData.subtotal || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Payment Status
                                    </td>

                                    <td>
                                        ${invoiceData.payment_status || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Transaction ID
                                    </td>

                                    <td>
                                        ${invoiceData.transaction_id || invoiceData.razorpay_payment_id || "-"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Payment Method
                                    </td>

                                    <td>
                                        ${invoiceData.payment_method || "Online"}
                                    </td>

                                </tr>

                                <tr>

                                    <td class="heading">
                                        Date
                                    </td>

                                    <td>
                                        ${new Date(
                                          invoiceData.paid_at ||
                                            invoiceData.created_at ||
                                            invoiceData.ordered_at,
                                        ).toLocaleString()}
                                    </td>

                                </tr>

                            </table>

                            <button
                                class="downloadBtn"

                                onclick="
                                    window.print()
                                "
                            >

                                Download Invoice

                            </button>

                        </div>

                    </body>

                </html>

            `);
  } catch (error) {
    console.log("Invoice Error:", error);

    res.send(`
                <h1>
                    Invoice Error
                </h1>
            `);
  }
});

//77
app.get("/api/vendor/payments", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Login Required",
      });
    }
    const vendorId = req.session.user.id;
    const [payments] = await pool.query(
      `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                ORDER BY
                    paid_at DESC
                `,
      [vendorId],
    );
    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//78
app.get("/api/payments", async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const vendorId = req.session.user.id;

    const [payments] = await pool.query(
      `
            SELECT

            uab.id,
            uab.id as booking_id,

            pu.full_name,

            uab.total_amount as amount,

            uab.vendor_amount,

            uab.admin_commission,

            uab.razorpay_payment_id,

            uab.payment_status,

            uab.created_at

            FROM user_ambulance_bookings uab

            JOIN ambulances a
            ON a.id = uab.ambulance_id

            JOIN product_users pu
            ON pu.id = uab.user_id

            WHERE

            a.users_id = ?

            AND

            uab.payment_status='paid'

            ORDER BY uab.id DESC
            `,

      [vendorId],
    );

    res.json({
      success: true,

      payments,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

//79
app.get("/api/vendor/dashboard", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: "Login Required",
      });
    }

    const vendorId = req.session.user.id;

    const isValidDashboardDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
    const dateFrom = isValidDashboardDate(req.query.dateFrom)
      ? req.query.dateFrom
      : "";
    const dateTo = isValidDashboardDate(req.query.dateTo)
      ? req.query.dateTo
      : "";
    const orderDateSql = [
      dateFrom ? "AND DATE(ordered_at) >= ?" : "",
      dateTo ? "AND DATE(ordered_at) <= ?" : "",
    ]
      .filter(Boolean)
      .join("\n");
    const payoutDateSql = [
      dateFrom ? "AND DATE(paid_at) >= ?" : "",
      dateTo ? "AND DATE(paid_at) <= ?" : "",
    ]
      .filter(Boolean)
      .join("\n");
    const dashboardDateParams = [
      ...(dateFrom ? [dateFrom] : []),
      ...(dateTo ? [dateTo] : []),
    ];

    const [[medicineStats]] = await pool.query(
      `
                SELECT
                    COUNT(*) AS totalProducts,
                    SUM(stock_quantity) AS totalStock
                FROM
                    med_lists
                WHERE
                    vendor_id = ?
                `,
      [vendorId],
    );

    const [[orderStats]] = await pool.query(
      `
                SELECT
                    COUNT(*) AS totalOrders,
                    IFNULL(SUM(total_amount),0) AS totalRevenue
                FROM
                    user_medicine_orders
                WHERE
                    medicine_vendor_id = ?
                    AND payment_status='paid'
                    ${orderDateSql}
                `,
      [vendorId, ...dashboardDateParams],
    );

    const [recentOrders] = await pool.query(
      `
                SELECT
                    *
                FROM
                    user_medicine_orders
                WHERE
                    medicine_vendor_id = ?
                    ${orderDateSql}
                ORDER BY
                    ordered_at DESC
                LIMIT 5
                `,
      [vendorId, ...dashboardDateParams],
    );

    const [recentPayments] = await pool.query(
      `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                    ${payoutDateSql}
                ORDER BY
                    paid_at DESC
                LIMIT 5
                `,
      [vendorId, ...dashboardDateParams],
    );

    res.json({
      success: true,
      dashboard: {
        totalProducts: medicineStats.totalProducts || 0,

        totalStock: medicineStats.totalStock || 0,

        totalOrders: orderStats.totalOrders || 0,

        totalRevenue: orderStats.totalRevenue || 0,

        recentOrders,
        recentPayments,
      },
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });
  }
});

//80
app.get("/api/vendor/mdeqdashboard", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
      });
    }

    const vendorId = req.session.user.id;

    const isValidDashboardDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
    const dateFrom = isValidDashboardDate(req.query.dateFrom)
      ? req.query.dateFrom
      : "";
    const dateTo = isValidDashboardDate(req.query.dateTo)
      ? req.query.dateTo
      : "";
    const productDateSql = [
      dateFrom ? "AND DATE(created_at) >= ?" : "",
      dateTo ? "AND DATE(created_at) <= ?" : "",
    ]
      .filter(Boolean)
      .join("\n");
    const orderDateSql = [
      dateFrom ? "AND DATE(created_at) >= ?" : "",
      dateTo ? "AND DATE(created_at) <= ?" : "",
    ]
      .filter(Boolean)
      .join("\n");
    const payoutDateSql = [
      dateFrom ? "AND DATE(paid_at) >= ?" : "",
      dateTo ? "AND DATE(paid_at) <= ?" : "",
    ]
      .filter(Boolean)
      .join("\n");
    const dashboardDateParams = [
      ...(dateFrom ? [dateFrom] : []),
      ...(dateTo ? [dateTo] : []),
    ];

    const [[products]] = await pool.query(
      `
                SELECT
                    COUNT(*) AS totalProducts,
                    IFNULL(
                        SUM(stock_quantity),
                        0
                    ) AS totalStock
                FROM
                    med_eq_prd
                WHERE
                    vendor_id = ?
                    ${productDateSql}
                `,
      [vendorId, ...dashboardDateParams],
    );

    const [[orders]] = await pool.query(
      `
                SELECT
                    COUNT(*) AS totalOrders,
                    IFNULL(
                        SUM(total_amount),
                        0
                    ) AS totalRevenue
                FROM
                    user_equipment_orders
                WHERE
                    equipment_vendor_id = ?
                    AND payment_status='paid'
                    ${orderDateSql}
                `,
      [vendorId, ...dashboardDateParams],
    );

    const [recentOrders] = await pool.query(
      `
                SELECT
                    *
                FROM
                    user_equipment_orders
                WHERE
                    equipment_vendor_id = ?
                    ${orderDateSql}
                ORDER BY
                    created_at DESC
                LIMIT 5
                `,
      [vendorId, ...dashboardDateParams],
    );

    const [recentPayments] = await pool.query(
      `
                SELECT
                    *
                FROM
                    vendor_payouts
                WHERE
                    vendor_id = ?
                    ${payoutDateSql}
                ORDER BY
                    paid_at DESC
                LIMIT 5
                `,
      [vendorId, ...dashboardDateParams],
    );

    res.json({
      success: true,

      dashboard: {
        totalProducts: products.totalProducts,

        totalStock: products.totalStock,

        totalOrders: orders.totalOrders,

        totalRevenue: orders.totalRevenue,

        recentOrders,

        recentPayments,
      },
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

async function startServer() {
  try {
    await ensureInsuranceClaimTables();
  } catch (error) {
    console.error("Insurance claim table setup failed:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
  });
}

startServer();


















