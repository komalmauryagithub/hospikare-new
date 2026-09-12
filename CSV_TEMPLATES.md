# CSV Import Templates for HospiKare Registration

## Overview
You can now import **Doctors** and **Rooms** using CSV files in the registration form. This guide shows the exact format required.

---

## 1. DOCTORS CSV Format

### File Name: `doctors.csv`

### Required Columns:
```
doctor_name, qualification, experience
```

### Example:
```csv
doctor_name,qualification,experience
Dr. Raj Kumar,MBBS - General Medicine,15 years
Dr. Priya Singh,MD - Pediatrics,8 years
Dr. Amit Patel,MD - Surgery,12 years
Dr. Neha Sharma,BAMS - Ayurveda,6 years
```

### How to Use:
1. Click **"Import CSV"** button in Doctors section
2. Select your `doctors.csv` file
3. Click **"Upload & Import"**
4. All doctors appear in the form
5. **Add one photo manually** for each doctor using the file input

### Important Notes:
- Minimum columns: `doctor_name, qualification, experience`
- No spaces around commas (though they're trimmed automatically)
- Each row = One doctor
- Only one image is accepted per doctor, added manually after import

---

## 2. ROOMS CSV Format

### File Name: `rooms.csv`

### Required Columns:
```
room_type, details, pricing, total_beds, availability
```

### Room Types Allowed:
- `General`
- `ICU`
- `Deluxe`

### Availability Values:
- `Available`
- `Full`

### Example:
```csv
room_type,details,pricing,total_beds,availability
General,AC Room with TV,5000,2,Available
ICU,ICU with Ventilator,15000,1,Available
Deluxe,Luxury Suite with WiFi,8000,2,Full
General,Basic Ward,3000,4,Available
```

### How to Use:
1. Click **"Import Rooms CSV"** button in Rooms section
2. Select your `rooms.csv` file
3. Click **"Upload & Import"**
4. All rooms appear in the form
5. **Add up to 4 images** for each room using the image input
6. You can upload multiple images at once - only first 4 will be used

### Important Notes:
- Minimum columns: `room_type, details, pricing, total_beds, availability`
- All 5 columns are required
- Room types must be: General, ICU, or Deluxe
- Availability must be: Available or Full
- **Images: Max 4 per room** (automatically limited)
- Images can be added/edited after import

---

## 3. HOSPITAL IMAGES

### Image Upload Rules:
- **Maximum: 4 images** per hospital
- **File Types**: JPG, PNG, GIF, WebP
- **Size Limit**: Up to 5MB per image (typically)

### How to Upload:
1. In "Hospital Images" section, select 1-4 images
2. If you select more than 4, only first 4 will be used
3. Images display in the users' panel

---

## 4. CSV File Preparation Tips

### Using Excel/Google Sheets:
1. Create columns: `room_type`, `details`, `pricing`, `total_beds`, `availability`
2. Add your data in rows
3. **Save As** → **CSV (.csv)** format
4. Upload in the form

### Using Text Editor:
1. Open Notepad or any text editor
2. Type data in CSV format (commas separate columns)
3. Save as `rooms.csv` or `doctors.csv`
4. Upload

### Common Mistakes to Avoid:
- ❌ Including extra blank rows
- ❌ Using special characters in room type (must be: General, ICU, or Deluxe)
- ❌ Forgetting to include all required columns
- ❌ Mixing different separators (only use commas)
- ❌ Including quotes around values (usually causes parsing issues)

---

## 5. Complete Example CSV Files

### Complete Doctors Example:
```csv
doctor_name,qualification,experience
Dr. Vikram Singh,MBBS - Internal Medicine,20 years
Dr. Anjali Sharma,MD - Gynecology,15 years
Dr. Rohan Gupta,BDS - Dentistry,8 years
Dr. Meera Patel,MBBS - Orthopedics,12 years
Dr. Arjun Kumar,MD - Cardiology,18 years
```

### Complete Rooms Example:
```csv
room_type,details,pricing,total_beds,availability
General,Simple AC Room,4500,2,Available
ICU,Advanced ICU with Monitoring,18000,1,Available
Deluxe,Premium Room with Balcony,10000,2,Available
General,Ward with Shared Bathroom,2500,4,Full
ICU,ICU with Ventilator Support,22000,1,Available
Deluxe,VIP Suite with Private Bath,12000,1,Available
```

---

## 6. Image Handling

### For Doctors:
- Add images **after importing CSV**
- Click on file input below each doctor's name
- Select and upload 1 image per doctor

### For Rooms:
- Upload **up to 4 images** per room
- After CSV import, image input appears for each room
- Select multiple files at once (automatically limited to 4)
- Or upload individually

### Hospital Images:
- Select 1-4 images
- Only first 4 will be used if more selected
- Images visible in users' panel

---

## 7. Troubleshooting

### "CSV must contain columns: doctor_name, qualification, experience"
- Check column names exactly match (case-insensitive is OK)
- Make sure no typos in column headers
- Re-save the CSV file

### "CSV file must contain header and at least one record"
- Ensure first row has column names
- Ensure you have at least 2 rows (header + 1 data row)

### "Room type not recognized"
- Room types must be exactly: `General`, `ICU`, or `Deluxe`
- Check for typos or extra spaces

### Images not appearing after import
- For rooms: Click file input and upload (max 4)
- For doctors: Add images individually
- Reload page if needed

---

## 8. File Validation

✅ **Valid CSV Structure:**
```
room_type,details,pricing,total_beds,availability
General,AC with TV,5000,2,Available
ICU,With Ventilator,15000,1,Available
```

❌ **Invalid CSV Structure:**
```
room_type | details | pricing | total_beds | availability
(Wrong separator - should be comma)

General,"AC with, TV",5000,2,Available
(Quoted values - may cause parsing issues)
```

---

**Questions?** Check the format examples above and ensure:
1. All required columns are present
2. Data matches expected values
3. File is saved as `.csv`
4. No extra blank rows at end
5. No special characters in critical fields
