import re

with open('js/ins.js', 'r', encoding='utf-8') as f:
    js = f.read()

bad_block = """if(id === "plansBtn"){
            loadInsurances();
        } else if(id === "companiesBtn"){
            loadCompanies();
            loadInsurances();
        } else if(id === "bookingsBtn"){"""

good_block = """if(id === "plansBtn"){
            loadInsurances();
        } else if(id === "companiesBtn"){
            loadCompanies();
        } else if(id === "bookingsBtn"){"""

js = js.replace(bad_block, good_block)

with open('js/ins.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed menu logic")
