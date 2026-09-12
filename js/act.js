const navItems =
    document.querySelectorAll(
        ".navItem"
    );

/* ================= NAVIGATION ================= */

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {

                nav.classList.remove(
                    "activeNav"
                );

            });

            item.classList.add(
                "activeNav"
            );

            const text =
                item.innerText
                .toLowerCase();

            if(
                text.includes(
                    "orders"
                )
            ){

                loadOrders();

            }

            else if(
                text.includes(
                    "history"
                )
            ){

                loadHistory();

            }

            else if(
                text.includes(
                    "payment"
                )
            ){

                loadPayments();

            }

        }
    );

});

/* ================= DEFAULT ================= */

loadOrders();

/* ================= ORDERS ================= */

async function loadOrders(){
    try{
        const [resOrders, resHistory] = await Promise.all([
            fetch('/api/user/orders'),
            fetch('/api/user/history')
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
                    created_at: h.created_at || new Date().toISOString()
                });
            });
        }
        
        // Sort everything by date descending
        result.orders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        let html = `
        <div class="activityBox">
            <h2>My Orders</h2>
            <table class="activityTable">
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
                    invoiceBtnHtml = `<span style="color: #94A3B8; font-size: 13px; font-weight: 600;">Not Paid</span>`;
                }

                html += `
                <tr>
                    <td style="font-weight: 600; color: #1E40AF;">#${order.id}</td>
                    <td style="font-weight: 500;">${order.type}</td>
                    <td style="font-weight: 600;">₹${order.total_amount}</td>
                    <td>
                        <span style="background: ${isPaid ? '#DCFCE7' : '#FEF2F2'}; color: ${isPaid ? '#166534' : '#991B1B'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${order.payment_status || "Pending"}</span>
                    </td>
                    <td>
                        <span style="background: #F1F5F9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${order.order_status || "Pending"}</span>
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

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "Orders Error:",
            error
        );

    }

}

/* ================= HISTORY ================= */

async function loadHistory(){

    try{

        const response =
            

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "History Error:",
            error
        );

    }

}

async function loadPayments(){

    try{

        const response =
            await fetch(
                '/api/user/payments'
            );

        const result =
            await response.json();

        let html = `
        <div class="activityBox">

            <h2>
                Payment History
            </h2>

            <table class="activityTable">

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

        if(
            result.success &&
            result.payments.length > 0
        ){

            result.payments.forEach(
                payment => {

                html += `
                <tr>

                    <td>
                        #${payment.id}
                    </td>

                    <td>
                        ${payment.payment_for}
                    </td>

                    <td>
                        ${payment.payment_method}
                    </td>

                    <td>
                        ${payment.transaction_id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_status}
                    </td>

                    <td>
                        ${new Date(
                            payment.paid_at
                        ).toLocaleDateString()}
                    </td>

                </tr>
                `;
            });

        }
        else{

            html += `
            <tr>

                <td colspan="7" style="text-align: center; color: #94A3B8; padding: 40px; font-size: 14px;"><i class="fa-solid fa-credit-card" style="font-size: 28px; margin-bottom: 12px; display: block; color: #CBD5E1;"></i>No Payments Found</td>

            </tr>
            `;
        }

        html += `
                </tbody>

            </table>

        </div>
        `;

        document.getElementById(
            "mainContainer"
        ).innerHTML = html;

    }
    catch(error){

        console.log(
            "Payment Load Error:",
            error
        );

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







