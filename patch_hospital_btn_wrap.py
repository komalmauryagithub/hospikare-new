import re

with open('js/users.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Wrap the buttons in .hospitalBottom for featuredHospitalCard
pattern = r'<div class="bedsCount">([^<]*)<i class="fa-solid fa-bed"></i>([^<]*)<span>\$\{escapeHtml\(hospital\.totalBeds \|\| 0\)\} Beds</span>([^<]*)</div>([^<]*)<button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="\$\{escapeAttr\(hospital\.id\)\}">'

replacement = '''<div class="bedsCount">\\1<i class="fa-solid fa-bed"></i>\\2<span> Beds</span>\\3</div>\\4<div style="display:flex; gap:8px;"><button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="">'''

content = re.sub(pattern, replacement, content)

# Close the wrapper div after viewBtn
pattern2 = r'<i class="fa-solid fa-indian-rupee-sign"></i>([^<]*)<span>\$\{escapeHtml\(hospital\.pricing \|\| 0\)\}</span>([^<]*)</button>([^<]*)</div>([^<]*)</article>'

replacement2 = '''<i class="fa-solid fa-indian-rupee-sign"></i>\\1<span></span>\\2</button></div>\\3</div>\\4</article>'''

content = re.sub(pattern2, replacement2, content)

with open('js/users.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Wrapped buttons!")
