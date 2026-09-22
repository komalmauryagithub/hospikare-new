const navItems = document.querySelectorAll(".navItem");

/* ================= NAVIGATION ================= */

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("activeNav");
        });
        item.classList.add("activeNav");
        const text = item.innerText.toLowerCase();
        if(text.includes("orders")){
            loadOrders();
        }
        else if(text.includes("history")){
            loadHistory();
        }
        else if(text.includes("payment")){
            loadPayments();
        }
    });
});

/* ================= DEFAULT ================= */

loadOrders();

/* ================= UTILITIES ================= */

function getUserIdQuery() {
    const userStr = localStorage.getItem("hk_user");
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            if (userObj && userObj.id) {
                return "?user_id=" + userObj.id;
            }
        } catch(e) {}
    }
    return "";
}

/* ================= ORDERS ================= */

async function loadOrders(){
    try{
        const [resOrders, resHistory] = await Promise.all([
            fetch('/api/user/orders' + getUserIdQuery(), { credentials: 'same-origin' }),
            fetch('/api/user/history' + getUserIdQuery(), { credentials: 'same-origin' })
        ]);
        
        const result = await resOrders.json();
        const historyResult = await resHistory.json();
        
        if (!result.orders) result.orders = [];
        
        if (historyResult.success && historyResult.history) {
            historyResult.history.forEach(h => {
                result.orders.push({
                    id: h.id,
                    type: h.type,
                    total_amount: h.total_amount,
                    payment_status: (h.booking_status === 'paid' || h.booking_status === 'completed' || h.booking_status === 'approved') ? 'paid' : (h.booking_status || 'pending'),
                    order_status: h.booking_status || 'pending',
                    tracking_token: h.tracking_token,
                    created_at: h.created_at || new Date().toISOString()
                });
            });
        }
        
        // Sort everything by date descending
        result.orders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        let html = `
        <div class="activityBox">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 700;">My Orders</h2>
                <button onclick="window.location.href='/users.html'" style="background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#94a3b8';" onmouseout="this.style.background='white'; this.style.borderColor='#cbd5e1';">
                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div style="width: 100%; overflow-x: auto; border-radius: 8px;"><table class="activityTable" style="margin-top: 0; min-width: 600px;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Invoice</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if(result.success && result.orders.length > 0) {
            result.orders.forEach(order => {
                let invoiceBtnHtml = "";
                let isPaid = order.payment_status && order.payment_status.toLowerCase() === 'paid';
                if (isPaid) {
                    invoiceBtnHtml = `<button class="invoice-btn" onclick="viewCustomerInvoice(${order.id}, '${order.type}', ${order.total_amount})"><i class="fa-solid fa-file-invoice"></i> View Invoice</button>`;
                } else {
                    invoiceBtnHtml = `<span style="color: #94a3b8; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;"><i class="fa-regular fa-clock"></i> Pending Payment</span>`;
                }
                
                // Add Track Button if applicable
                if (order.tracking_token && order.order_status.toLowerCase() !== 'completed' && order.order_status.toLowerCase() !== 'cancelled') {
                    invoiceBtnHtml += `<button onclick="window.open('/user-tracking.html?token=${order.tracking_token}', '_blank')" style="margin-top: 8px; width: 100%; background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 4px rgba(59,130,246,0.3);"><i class="fa-solid fa-location-dot fa-bounce"></i> Track</button>`;
                }

                const pStat = (order.payment_status || "Pending").toLowerCase();
                let pBg = '#fef3c7', pCol = '#b45309';
                if (pStat === 'paid') { pBg = '#dcfce7'; pCol = '#166534'; }
                else if (pStat === 'failed' || pStat === 'cancelled') { pBg = '#fee2e2'; pCol = '#991b1b'; }

                const oStat = (order.order_status || "Pending").toLowerCase();
                let oBg = '#fef3c7', oCol = '#b45309';
                if (oStat === 'completed' || oStat === 'delivered' || oStat === 'placed' || oStat === 'approved') { oBg = '#e0e7ff'; oCol = '#3730a3'; }
                else if (oStat === 'cancelled') { oBg = '#fee2e2'; oCol = '#991b1b'; }

                html += `
                <tr>
                    <td style="font-weight: 700; color: #1e293b;">#${order.id}</td>
                    <td style="font-weight: 600; color: #334155;">${order.type}</td>
                    <td style="font-weight: 700; color: #0f172a;">₹${order.total_amount}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; justify-content: center; background: ${pBg}; color: ${pCol}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${order.payment_status || "Pending"}</span>
                    </td>
                    <td>
                        <span style="display: inline-flex; align-items: center; justify-content: center; background: ${oBg}; color: ${oCol}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${order.order_status || "Pending"}</span>
                    </td>
                    <td>${invoiceBtnHtml}</td>
                </tr>
                `;
            });
        }
        else{
            html += `
            <tr>
                <td colspan="6" style="text-align: center; color: #94A3B8; padding: 40px; font-size: 14px;">
                    <i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 12px; display: block; color: #CBD5E1;"></i>
                    No Orders Found
                </td>
            </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        </div>
        `;

        document.getElementById("mainContainer").innerHTML = html;
    }
    catch(error){
        console.log("Orders Error:", error);
    }
}

/* ================= HISTORY ================= */

async function loadHistory(){
    try{
        const response = await fetch('/api/user/history' + getUserIdQuery(), { credentials: 'same-origin' });
        const result = await response.json();
        
        let html = `
        <div class="activityBox">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 700;">My History</h2>
                <button onclick="window.location.href='/users.html'" style="background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#94a3b8';" onmouseout="this.style.background='white'; this.style.borderColor='#cbd5e1';">
                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div style="width: 100%; overflow-x: auto; border-radius: 8px;"><table class="activityTable" style="margin-top: 0; min-width: 600px;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if(result.success && result.history && result.history.length > 0) {
            result.history.forEach(h => {
                const oStat = (h.booking_status || "Pending").toLowerCase();
                let oBg = '#fef3c7', oCol = '#b45309';
                if (oStat === 'completed' || oStat === 'delivered' || oStat === 'placed' || oStat === 'approved' || oStat === 'paid') { oBg = '#e0e7ff'; oCol = '#3730a3'; }
                else if (oStat === 'cancelled') { oBg = '#fee2e2'; oCol = '#991b1b'; }

                html += `
                <tr>
                    <td style="font-weight: 700; color: #1e293b;">#${h.id}</td>
                    <td style="font-weight: 600; color: #334155;">${h.type}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; justify-content: center; background: ${oBg}; color: ${oCol}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${h.booking_status || "Pending"}</span>
                    </td>
                    <td style="font-weight: 700; color: #0f172a;">₹${h.total_amount}</td>
                    <td style="color: #64748b; font-weight: 500;">${new Date(h.created_at).toLocaleDateString()}</td>
                </tr>
                `;
            });
        }
        else{
            html += `
            <tr>
                <td colspan="5" style="text-align: center; color: #94A3B8; padding: 40px; font-size: 14px;">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size: 28px; margin-bottom: 12px; display: block; color: #CBD5E1;"></i>
                    No History Found
                </td>
            </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        </div>
        `;

        document.getElementById("mainContainer").innerHTML = html;
    }
    catch(error){
        console.log("History Error:", error);
    }
}

/* ================= PAYMENTS ================= */

async function loadPayments(){
    try{
        const response = await fetch('/api/user/payments' + getUserIdQuery(), { credentials: 'same-origin' });
        const result = await response.json();

        let html = `
        <div class="activityBox">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 700;">My Payments</h2>
                <button onclick="window.location.href='/users.html'" style="background: white; color: #475569; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#94a3b8';" onmouseout="this.style.background='white'; this.style.borderColor='#cbd5e1';">
                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div style="width: 100%; overflow-x: auto; border-radius: 8px;"><table class="activityTable" style="margin-top: 0; min-width: 600px;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Payment For</th>
                        <th>Method</th>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if(result.success && result.payments.length > 0){
            result.payments.forEach(payment => {
                const pStat = (payment.payment_status || "Pending").toLowerCase();
                let pBg = '#fef3c7', pCol = '#b45309';
                if (pStat === 'paid') { pBg = '#dcfce7'; pCol = '#166534'; }
                else if (pStat === 'failed' || pStat === 'cancelled') { pBg = '#fee2e2'; pCol = '#991b1b'; }

                html += `
                <tr>
                    <td style="font-weight: 700; color: #1e293b;">#${payment.id}</td>
                    <td style="font-weight: 600; color: #334155;">${payment.payment_for}</td>
                    <td style="font-weight: 500;">${payment.payment_method}</td>
                    <td style="font-weight: 500; font-family: monospace; color: #64748b;">${payment.transaction_id}</td>
                    <td style="font-weight: 700; color: #0f172a;">₹${payment.amount}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; justify-content: center; background: ${pBg}; color: ${pCol}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${payment.payment_status || "Pending"}</span>
                    </td>
                    <td style="color: #64748b; font-weight: 500;">${new Date(payment.paid_at).toLocaleDateString()}</td>
                </tr>
                `;
            });
        }
        else{
            html += `
            <tr>
                <td colspan="7" style="text-align: center; color: #94A3B8; padding: 40px; font-size: 14px;">
                    <i class="fa-solid fa-credit-card" style="font-size: 28px; margin-bottom: 12px; display: block; color: #CBD5E1;"></i>
                    No Payments Found
                </td>
            </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        </div>
        `;

        document.getElementById("mainContainer").innerHTML = html;
    }
    catch(error){
        console.log("Payment Load Error:", error);
    }
}

window.viewCustomerInvoice = function(id, type, amount) {
    const data = {
        isVendor: false,
        invoiceNo: `INV-2026-${String(id).padStart(4,"0")}`,
        orderRef: `ORD-${type.toUpperCase()}-${id}`,
        date: new Date().toLocaleString(),
        status: "PAID",
        name: "Customer",
        phone: "As per account",
        address: "Delivery Address",
        kyc: "Verified User",
        paymentMode: "Online",
        txId: "TXN_" + Math.floor(Math.random()*1000000),
        items: [{
            name: `${type} Booking/Order #${id}`,
            qty: 1,
            price: Number(amount),
            total: Number(amount)
        }],
        subtotal: Number(amount),
        grandTotal: Number(amount)
    };
    const html = window.generateGSTInvoiceHtml(data);
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Invoice #${data.invoiceNo}</title></head><body style="margin:0; background:#f0f0f0;"><div style="text-align:center; padding:20px;"><button onclick="window.print()" style="background:#2563eb; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; font-size:16px;">Print Invoice</button></div>${html}</body></html>`);
    win.document.close();
};

