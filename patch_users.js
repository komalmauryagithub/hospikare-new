const fs = require("fs");
let html = fs.readFileSync("users.html", "utf8");

const newCards = `<div class="grid grid-cols-3" style="gap: 20px;">
    <!-- Hospital Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #e0e7ff; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-hospital"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Hospitals</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Find nearby hospitals, view facilities, doctors, beds and book appointments easily.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#featuredHospitalSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #4f46e5; color: white;">Explore</a>
            </div>
        </div>
    </article>
    <!-- Ambulance Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #dcfce7; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-truck-medical"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Ambulance</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Book emergency ambulance services quickly with real-time availability and support.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#ambulanceSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #16a34a; color: white;">Explore</a>
            </div>
        </div>
    </article>
    <!-- Medicines Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #fef3c7; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #fef3c7; color: #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-capsules"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Medicines</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Order medicines online from trusted medical stores with fast delivery support.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#medicineSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #d97706; color: white;">Explore</a>
            </div>
        </div>
    </article>
    <!-- Insurance Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #f3e8ff; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #f3e8ff; color: #9333ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-file-shield"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Insurance</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Compare and purchase health insurance plans with claim and policy support.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#insuranceSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #9333ea; color: white;">Explore</a>
            </div>
        </div>
    </article>
    <!-- Lab Tests Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #e0f2fe; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-flask"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Lab Tests</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Book pathology and diagnostic lab tests online with home sample collection.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#labsSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #0284c7; color: white;">Explore</a>
            </div>
        </div>
    </article>
    <!-- Medical Equipments Card -->
    <article class="ambulanceCard" style="background: white; border: 2px solid #fce7f3; border-radius: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div class="ambulanceContent" style="text-align: center; padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <div style="width: 64px; height: 64px; background: #fce7f3; color: #db2777; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-laptop-medical"></i>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Medical Equipments</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: auto;">Purchase or rent healthcare and medical equipments from verified vendors.</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <a href="#equipmentSection" class="btn btn-primary" style="width: 100%; border-radius: 8px; background: #db2777; color: white;">Explore</a>
            </div>
        </div>
    </article>
</div>`;

const pattern = /<div class="grid grid-cols-3">[\s\S]*?(?=<\/section>)/;
html = html.replace(pattern, newCards + "\n      ");
fs.writeFileSync("users.html", html, "utf8");
console.log("Patched users.html with new cards");

