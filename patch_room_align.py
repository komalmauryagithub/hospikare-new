with open('css/hosp_data.css', 'r', encoding='utf-8') as f:
    content = f.read()

old_card = '''.roomCard {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.2s;
}'''

new_card = '''.roomCard {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.2s;
}'''

content = content.replace(old_card, new_card)

with open('css/hosp_data.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed roomCard alignment in CSS!")
