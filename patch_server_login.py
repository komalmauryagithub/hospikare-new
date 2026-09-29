with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix req.session.productUser
old_session = '''req.session.productUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };'''
new_session = '''req.session.productUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_photo: user.profile_photo,
    };'''
content = content.replace(old_session, new_session)

# Fix res.json return
old_return = '''res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
        },
      });'''
new_return = '''res.json({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_photo: user.profile_photo,
        },
      });'''
content = content.replace(old_return, new_return)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated server.js to include profile_photo!")
