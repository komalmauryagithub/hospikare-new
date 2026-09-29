import urllib.request
import urllib.parse
import json
import uuid

# This is hard because of sessions.
# I'll just check the DB to see if the user ID has edit_allowed = 1 right now.
