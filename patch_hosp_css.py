with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write("""* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
}
body {
    background: #f8fafc;
    color: #0f172a;
}
.hospitalDetailsContainer {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 24px;
}
.hospitalBanner {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 40px;
    background: white;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
}
.bannerImages {
    display: flex;
    height: 350px;
    gap: 4px;
    background: #e2e8f0;
}
.bannerImages img {
    flex: 1;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}
.bannerImages img:hover {
    flex: 1.2;
}
.bannerContent {
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
}
.bannerContent h1 {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    text-transform: capitalize;
    letter-spacing: -0.5px;
}
.hospitalAddress {
    font-size: 15px;
    color: #64748b;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}
.hospitalAddress i { color: #3b82f6; }
.bookBtn {
    background: #2563eb;
    color: white;
    padding: 14px 28px;
    border-radius: 9999px;
    font-size: 16px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    transition: all 0.2s ease;
}
.bookBtn:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37,99,235,0.3);
}

.mainGrid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 32px;
}
@media(max-width: 900px) {
    .mainGrid { grid-template-columns: 1fr; }
}
.sectionCard {
    background: white;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
    border: 1px solid #f1f5f9;
}
.sectionCard h2 {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 24px;
    letter-spacing: -0.5px;
}
.facilityContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.facilityContainer span {
    background: #eff6ff;
    color: #1d4ed8;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 600;
    text-transform: capitalize;
}

.roomsContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.roomCard {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    background: #f8fafc;
    transition: border-color 0.2s;
}
.roomCard:hover {
    border-color: #cbd5e1;
}
.roomCard h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
}
.roomCard p {
    font-size: 16px;
    color: #3b82f6;
    font-weight: 700;
}
.availability {
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 9999px;
    text-transform: uppercase;
}
.available { background: #dcfce7; color: #166534; }
.unavailable { background: #fee2e2; color: #991b1b; }
.roomImageGallery {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    overflow-x: auto;
}
.roomImg {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    cursor: pointer;
    border: 1px solid #e2e8f0;
}

.doctorContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.doctorCard {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}
.doctorIcon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #eff6ff;
    color: #3b82f6;
    font-size: 24px;
    flex-shrink: 0;
}
.doctorContent h3 {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
    text-transform: capitalize;
}
.doctorContent p {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 4px;
}
.doctorContent span {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 600;
}
""")
print("Replaced hosp_data.css!")
