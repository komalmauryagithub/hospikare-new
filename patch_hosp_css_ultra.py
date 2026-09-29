with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write("""* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}
body {
    background: #f4f7fb;
    color: #1e293b;
}
.hero-section {
    position: relative;
    width: 100%;
    height: 400px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
    padding-bottom: 40px;
}
.hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0) 100%);
}
.hero-content {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 24px;
    color: white;
}
.hero-content h1 {
    font-size: 42px;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: -1px;
}
.hero-content p {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 8px;
}
.hero-content p i { color: #60a5fa; }

.hospitalDetailsContainer {
    max-width: 1200px;
    margin: -20px auto 60px auto;
    padding: 0 24px;
    position: relative;
    z-index: 20;
}
.mainGrid {
    display: grid;
    grid-template-columns: 2.2fr 1fr;
    gap: 32px;
    align-items: start;
}
@media(max-width: 900px) {
    .mainGrid { grid-template-columns: 1fr; }
}

.leftSide {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.sectionCard {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    border: 1px solid #f1f5f9;
}
.sectionCard h2 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 24px;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 16px;
}

.facilityContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.facilityContainer span {
    background: #f8fafc;
    color: #334155;
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
}

/* Rooms */
.roomsContainer {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.roomCard {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.2s;
}
.roomCard:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.roomInfo h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
}
.roomInfo p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
}
.roomPrice {
    font-size: 20px;
    font-weight: 800;
    color: #2563eb;
}
.roomAction .btn {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 700;
    border-radius: 9999px;
    padding: 10px 24px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}
.roomAction .btn:hover {
    background: #2563eb;
    color: white;
}

/* Doctors */
.doctorContainer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
@media(max-width: 600px) { .doctorContainer { grid-template-columns: 1fr; } }
.doctorCard {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}
.doctorHeader {
    display: flex;
    align-items: center;
    gap: 16px;
}
.doctorIcon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e0e7ff;
    color: #4f46e5;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.doctorContent h3 {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
}
.doctorContent p {
    font-size: 13px;
    color: #64748b;
}

/* Sticky Right Sidebar */
.rightSide {
    position: sticky;
    top: 24px;
}
.bookingWidget {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    text-align: center;
}
.bookingWidget h3 {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 12px;
}
.bookingWidget p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 24px;
}
.bookBtn {
    background: #2563eb;
    color: white;
    padding: 16px;
    width: 100%;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
    transition: all 0.2s ease;
}
.bookBtn:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37,99,235,0.3);
}

/* Modal Styling */
.modal {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}
.modal.active { display: flex; }
.modal-content {
    background: white;
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 450px;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.close-modal {
    position: absolute;
    top: 20px;
    right: 24px;
    font-size: 28px;
    cursor: pointer;
    color: #64748b;
}
.form-group {
    margin-bottom: 16px;
    text-align: left;
}
.form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
}
.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.2s;
    background: #f8fafc;
}
.form-group input:focus, .form-group select:focus {
    border-color: #3b82f6;
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
""")
print("Replaced hosp_data.css with ultra-premium layout!")
