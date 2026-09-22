import re

with open('users.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the total amount section in Lab Booking Modal
old_lab_payment = '''                    <div style="background: var(--hk-blue-tint); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-4) 0;">
                        <span style="font-size: var(--text-sm); opacity: 0.8;">Total Amount</span>
                        <h3 id="labTestAmount" style="color: var(--hk-blue); margin-top: var(--space-2);">₹ 0</h3>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">Proceed Booking</button>'''

new_lab_payment = '''                    <div style="background: var(--hk-blue-tint); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-4) 0;">
                        <span style="font-size: var(--text-sm); opacity: 0.8;">Total Amount</span>
                        <h3 id="labTestAmount" style="color: var(--hk-blue); margin-top: var(--space-2);">₹ 0</h3>
                    </div>

                    <div class="input-group" style="margin-top:12px;">
                        <label style="font-weight:600;">Payment Type</label>
                        <div style="display:flex; gap:16px; margin-top:8px;">
                            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;">
                                <input type="radio" name="labPaymentType" value="full" checked style="accent-color:#2563eb; width:18px; height:18px;"> Full Payment
                            </label>
                            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:500;">
                                <input type="radio" name="labPaymentType" value="part" style="accent-color:#2563eb; width:18px; height:18px;"> Part Payment
                            </label>
                        </div>
                    </div>
                    <div id="labPartPaymentSection" style="display:none; margin-top:12px; padding:12px; background:var(--surface-alt, #f8fafc); border-radius:8px; border:1px solid var(--border-color, #e2e8f0); margin-bottom: 16px;">
                        <div class="input-group" style="margin-bottom:8px;">
                            <label style="font-weight:600;">Enter Amount to Pay Now</label>
                            <input type="number" id="labPartPayAmount" class="hk-input" placeholder="Enter amount" min="0">
                            <small id="labPartPayError" style="color:#ef4444; display:none; margin-top:4px;">Minimum 50% of total amount is required</small>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted, #64748b); margin-top:8px;">
                            <span>Paying Now: <strong id="labPayingNowDisplay">₹0</strong></span>
                            <span>Remaining: <strong id="labRemainingDisplay">₹0</strong></span>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">Proceed Booking</button>'''

# Because of ₹ symbol, let's just use regex to replace everything between the amount block and the submit button
content = re.sub(
    r'<div style="background: var\(--hk-blue-tint\); padding: var\(--space-4\); border-radius: var\(--radius-md\);? margin: var\(--space-4\) 0;">.*?<button type="submit" class="btn btn-primary" style="width: 100%;">Proceed Booking</button>',
    new_lab_payment,
    content,
    flags=re.DOTALL
)

with open('users.html', 'w', encoding='utf-8') as f:
    f.write(content)
