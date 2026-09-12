window.generateGSTInvoiceHtml = function(data) {
    function numToWords(n) {
        if (n === 0) return "Zero";
        const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        if ((n = n.toString()).length > 9) return "overflow";
        let num = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!num) return "";
        let str = "";
        str += (num[1] != 0) ? (a[Number(num[1])] || b[num[1][0]] + " " + a[num[1][1]]) + " Crore " : "";
        str += (num[2] != 0) ? (a[Number(num[2])] || b[num[2][0]] + " " + a[num[2][1]]) + " Lakh " : "";
        str += (num[3] != 0) ? (a[Number(num[3])] || b[num[3][0]] + " " + a[num[3][1]]) + " Thousand " : "";
        str += (num[4] != 0) ? (a[Number(num[4])] || b[num[4][0]] + " " + a[num[4][1]]) + " Hundred " : "";
        str += (num[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(num[5])] || b[num[5][0]] + " " + a[num[5][1]]) + " " : "";
        return str.trim();
    }
    
    let words = numToWords(Math.floor(data.grandTotal || 0));
    let decimal = Math.round(((data.grandTotal || 0) - Math.floor(data.grandTotal || 0)) * 100);
    if (decimal > 0) words += " and " + numToWords(decimal) + " Paise";
    
    const itemsHtml = data.items && data.items.length > 0 ? data.items.map((item, idx) => `
        <tr>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; color: #111 !important; white-space: normal !important; text-align: left !important;">${idx + 1}</td>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; font-weight: 600 !important; color: #111 !important; white-space: normal !important; text-align: left !important;">${item.name || "Item"}</td>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; text-align: center !important; color: #111 !important; white-space: normal !important;">${item.hsn || "9993"}</td>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; text-align: center !important; color: #111 !important; white-space: normal !important;">${item.qty || 1}</td>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; text-align: right !important; color: #111 !important; white-space: normal !important;">INR ${item.price}</td>
            <td style="padding: 10px !important; border: 1px solid #E2E8F0 !important; text-align: right !important; font-weight: 600 !important; color: #111 !important; white-space: normal !important;">INR ${item.total}</td>
        </tr>
    `).join("") : `
        <tr>
            <td colspan="6" style="padding: 10px !important; border: 1px solid #E2E8F0 !important; text-align: center !important; color: #111 !important;">No items found</td>
        </tr>
    `;

    return `
<style>
.invoice-isolation-container * {
    color: #111 !important; /* Force text color to black to override dark theme */
    box-sizing: border-box !important;
}
.invoice-isolation-container .text-blue { color: #2563EB !important; }
.invoice-isolation-container .text-darkblue { color: #1E3A8A !important; }
.invoice-isolation-container .text-gray { color: #4B5563 !important; }
.invoice-isolation-container .text-green { color: #166534 !important; }
.invoice-isolation-container .text-red { color: #EF4444 !important; }

@media print {
    @page { size: A4 portrait; margin: 10mm; }
    body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
    .invoice-container { max-width: 100% !important; width: 100% !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; }
    .no-print { display: none !important; }
    table { width: 100% !important; table-layout: fixed !important; }
    table th, table td { word-wrap: break-word !important; font-size: 10px !important; padding: 6px !important; }
    .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; }
    .totals-flex { display: flex !important; gap: 15px !important; }
}
</style>
<div class="invoice-isolation-container invoice-container" style="max-width: 800px; margin: 0 auto; background: white !important; padding: 40px; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563EB !important; padding-bottom: 20px; margin-bottom: 20px;">
        <div style="flex: 1;">
            <div style="display: flex; align-items: center; margin-bottom: 15px; margin-left: 20px;">
                <img src="/assets/logo.png" style="height: 50px !important; transform: scale(2.2); transform-origin: left center;" alt="HospiKare" onerror="this.style.display='none'">
            </div>
            <h2 class="text-darkblue" style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">HospiKare Healthcare Pvt. Ltd.</h2>
            <p class="text-gray" style="margin: 0; font-size: 11px; line-height: 1.5;">
                Plot 42, Health Tech Park, Okhla Phase-III, New Delhi - 110020<br>
                GSTIN: 07AAACH0029K1Z5 | PAN: AAACH0029K<br>
                Contact: +91 1800-HOSPI-KARE | Email: support@hospikare.com
            </p>
        </div>
        <div style="text-align: right; flex: 1;">
            <div style="background: #1E40AF !important; color: white !important; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; display: inline-block; margin-bottom: 12px; font-family: 'Courier New', monospace;">GST TAX INVOICE</div>
            <div style="font-size: 11px; line-height: 1.6; text-align: right;">
                <strong style="font-size: 12px;">Invoice No: ${data.invoiceNo || "INV-2026-0000"}</strong><br>
                Order Ref: ${data.orderRef || "N/A"}<br>
                Invoice Date: ${data.date || new Date().toLocaleString()}
            </div>
            <div class="text-green" style="margin-top: 8px; background: #DCFCE7 !important; padding: 4px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; display: inline-block; letter-spacing: 0.5px;">PAYMENT STATUS: ${data.status || "PAID"}</div>
        </div>
    </div>

    <div class="grid-2" style="background: #F8FAFC !important; border: 1px solid #E2E8F0 !important; padding: 15px; border-radius: 6px; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px;">
        <div>
            <div style="margin-bottom: 8px;"><strong>${data.isVendor ? "Vendor / Partner Name:" : "Customer / Patient Name:"}</strong> ${data.name || "N/A"}</div>
            <div style="margin-bottom: 8px;"><strong>Mobile Number:</strong> ${data.phone || "+91 98765 43210"}</div>
            <div><strong>Address:</strong> ${data.address || "B-104, Green Park Extension, New Delhi - 110016"}</div>
        </div>
        <div>
            <div style="margin-bottom: 8px;"><strong>KYC / Verification:</strong> ${data.kyc || "Govt ID Verified"}</div>
            <div style="margin-bottom: 8px;"><strong>Payment Mode:</strong> ${data.paymentMode || "UPI / Online"}</div>
            <div><strong>Transaction ID:</strong> ${data.txId || "TXN_" + Math.floor(Math.random()*1000000)}</div>
        </div>
    </div>

    <table style="width: 100% !important; min-width: 0 !important; table-layout: fixed !important; border-collapse: collapse !important; margin-bottom: 25px; font-size: 11px; background: transparent !important;">
        <thead>
            <tr>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: left !important; border: 1px solid #E2E8F0 !important; width: 5% !important;">#</th>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: left !important; border: 1px solid #E2E8F0 !important; width: 45% !important;">ITEM & EQUIPMENT DESCRIPTION</th>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: center !important; border: 1px solid #E2E8F0 !important; width: 10% !important;">HSN/SAC</th>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: center !important; border: 1px solid #E2E8F0 !important; width: 10% !important;">QTY</th>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: right !important; border: 1px solid #E2E8F0 !important; width: 15% !important;">UNIT PRICE</th>
                <th style="background: #1E40AF !important; color: white !important; padding: 10px !important; text-align: right !important; border: 1px solid #E2E8F0 !important; width: 15% !important;">TOTAL</th>
            </tr>
        </thead>
        <tbody style="background: white !important;">
            ${itemsHtml}
        </tbody>
    </table>

    <div class="totals-flex" style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 1.2; background: #EFF6FF !important; padding: 15px; border-radius: 6px; font-size: 11px; border: 1px solid #BFDBFE !important;">
            <h4 class="text-darkblue" style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold;">PAYMENT & TAX DETAILS</h4>
            <div style="margin-bottom: 5px;">Payment Mode: ${data.paymentMode || "UPI / Online"}</div>
            <div style="margin-bottom: 5px;">Transaction Ref ID: ${data.txId || "TXN_" + Math.floor(Math.random()*1000000)}</div>
            <div style="margin-bottom: 5px;">GST Registration Type: Regular Taxpayer</div>
            <div class="text-darkblue" style="font-weight: bold; margin-top: 15px; font-size: 12px; line-height: 1.4;">Amount in Words:<br>INR ${words} Only</div>
        </div>
        <div style="flex: 1; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Item Subtotal (MRP)</span>
                <span>INR ${data.subtotal || data.grandTotal}</span>
            </div>
            ${data.discount ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Coupon Discount</span>
                <span class="text-red">- INR ${data.discount}</span>
            </div>` : ""}
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>CGST (9%)</span>
                <span>INR ${data.cgst || "0.00"}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>SGST (9%)</span>
                <span>INR ${data.sgst || "0.00"}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span class="text-green">Refundable Security Deposit</span>
                <span class="text-green">INR 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 2px solid #E2E8F0 !important;">
                <span class="text-green">Delivery & Express Handling</span>
                <span class="text-green">FREE</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800;">
                <span>GRAND TOTAL PAID</span>
                <span class="text-darkblue">INR ${data.grandTotal || 0}</span>
            </div>
        </div>
    </div>

    <div class="text-gray" style="border: 1px solid #E2E8F0 !important; padding: 15px; border-radius: 6px; font-size: 9px; margin-bottom: 30px;">
        <h4 class="text-darkblue" style="margin: 0 0 10px 0; font-size: 11px;">TERMS & CONDITIONS AND REFUND POLICY</h4>
        <ol style="margin: 0; padding-left: 15px; line-height: 1.5;">
            <li>Equipment Rental Deposit: Refundable security deposits will be credited back to your original payment mode within 3-5 business days after return sanitization check.</li>
            <li>Sanitization Guarantee: All medical equipment undergoes 100% UV-C sterilization and quality testing prior to dispatch.</li>
            <li>Cancellation & Refunds: Full 100% refund is initiated automatically for order cancellations submitted prior to dispatch.</li>
            <li>Customer Support Helpline: For invoice queries or assistance, contact +91 1800-HOSPI-KARE or support@hospikare.com.</li>
        </ol>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=HK-INV-${data.invoiceNo || "12345"}" alt="QR" style="width: 80px; height: 80px;">
        </div>
        <div style="text-align: center;">
            <div class="text-blue" style="font-weight: bold; font-size: 10px; margin-bottom: 5px; border-bottom: 1px solid #CBD5E1 !important; padding-bottom: 2px;">HOSPIKARE DIGITAL STAMP</div>
            <div style="font-weight: bold; font-size: 12px;">Authorized Signatory</div>
            <div style="font-size: 9px;" class="text-gray">HospiKare Digital Hash: #${Math.floor(Math.random()*1000000000)}</div>
        </div>
    </div>
</div>
`;
};
