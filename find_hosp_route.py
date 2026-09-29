import re

with open('server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "INSERT INTO" in line and "user_hospital_bookings" in lines[i+1]:
        print(f"Found INSERT around line {i}")
        # search upwards for app.post
        for j in range(i, -1, -1):
            if "app.post(" in lines[j]:
                print(f"API Route: {lines[j].strip()}")
                break
