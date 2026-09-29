import re

with open('mdeq.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

scripts_block_pattern = r'<script src="/js/vendor-dashboard-ui\.js\?v=.*?"></script>\s*<script src="/js/vendor-panel-controls\.js\?v=.*?"></script>\s*<script src="/js/mdeq\.js\?v=.*?"></script>\s*<script src="/js/sidebar-toggle\.js\?v=.*?"></script>\s*<script src="/js/ui-interactions\.js\?v=.*?"></script>'

m = re.search(scripts_block_pattern, html)
if m:
    scripts_block = m.group(0)
    # Remove it from current location
    html = html.replace(scripts_block, '')
    
    # Insert it right before </body>
    html = html.replace('</body>', scripts_block + '\n</body>')
    
    with open('mdeq.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Moved scripts to end of body")
else:
    print("Scripts block not found")
