with open('css/hosp_data.css', 'r', encoding='utf-8') as f:
    content = f.read()

gallery_css = """
.roomImageGallery {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    overflow-x: auto;
    padding-bottom: 8px;
}
.roomImageGallery::-webkit-scrollbar {
    height: 6px;
}
.roomImageGallery::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}
.roomImg {
    width: 100px;
    height: 70px;
    border-radius: 10px;
    object-fit: cover;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    transition: transform 0.2s ease;
}
.roomImg:hover {
    transform: scale(1.05);
}
"""

content += gallery_css

with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added room image CSS!")
