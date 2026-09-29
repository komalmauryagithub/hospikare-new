import cssutils
import logging

cssutils.log.setLevel(logging.CRITICAL)

try:
    sheet = cssutils.parseFile('css/users.css')
    print("CSS parsed successfully! Rules count:", len(sheet.cssRules))
except Exception as e:
    print("CSS ERROR:", str(e))
