import re

# 1. Update lt.html
html_path = r'd:\Office work\Hospikare_final\hospikare (2) (1)\hospikare\lt.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add sidebar menu item
html = re.sub(
    r'<div class="menuItem" id="labsBtn">.*?</div>',
    '<div class="menuItem" id="labsBtn">\n              <i class="fa-solid fa-flask"></i>\n              <span>Lab Tests</span>\n          </div>\n          <div class="menuItem" id="labDetailsMenuBtn">\n              <i class="fa-solid fa-file-medical"></i>\n              <span>Lab Details</span>\n          </div>',
    html, flags=re.DOTALL
)

# Move the section outside
html = html.replace(
    '<!-- ================= LAB DETAILS ================= -->\n            <div id="labDetailsSubSection" style="margin-top:40px;">',
    '</div>\n\n        <!-- ================= LAB DETAILS ================= -->\n        <div id="labDetailsSection" style="display:none;">'
)
# We also need to remove the closing </div> of the labSection that was AFTER the sub section
# Originally it was:
#             </div> <!-- labDetailsSubSection close -->
#         </div> <!-- labSection close -->
html = html.replace(
    '                    </table>\n                </div>\n            </div>\n        </div>',
    '                    </table>\n                </div>\n            </div>'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated HTML.")
