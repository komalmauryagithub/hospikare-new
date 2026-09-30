(() => {
    const USER_KEY = "productUser";
    const CART_KEY = "hospikareUserCart";
    const FALLBACK_IMAGE = "/assets/logo.png";

    async function handleInsuranceClaim(event) {
        event.preventDefault();
        if (!requireUser()) {
            return;
        }

        const formData = new FormData();
        formData.append("insurance_purchase_id", valueOf("claim_purchase_id"));
        formData.append("claim_amount", valueOf("claim_amount"));
        formData.append("claim_reason", valueOf("claim_reason"));
        formData.append("hospital_name", valueOf("claim_hospital_name") || "");
        formData.append("treatment_type", valueOf("claim_treatment_type") || "");

        const documentInput = $("#claim_documents");
        if (documentInput?.files?.[0]) {
            formData.append("claim_documents", documentInput.files[0]);
        }

        try {
            setFormBusy("insuranceClaimForm", true);
            const response = await fetch("/api/user/insurance-claims", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Claim could not be submitted");
                return;
            }

            toast("Claim submitted successfully");
            closeModal("insuranceClaimModal");
            $("#insuranceClaimForm")?.reset();
            loadUserInsuranceDashboard();
            loadInsurances();
        } catch (error) {
            console.error(error);
            toast("Claim could not be submitted");
        } finally {
            setFormBusy("insuranceClaimForm", false);
        }
    }

    function openInsuranceRenewal(purchaseId, policyName, monthlyPremium) {
        if (!requireUser()) {
            return;
        }

        state.selectedRenewalPurchaseId = purchaseId;
        state.selectedRenewalMonthlyPremium = parseMoney(monthlyPremium);
        $("#renew_purchase_id").value = purchaseId || "";
        $("#renew_policy_name").value = policyName || "Insurance Policy";
        $("#renew_monthly_premium").value = formatMoney(state.selectedRenewalMonthlyPremium);
        $("#renew_duration").value = "1";
        updateRenewalTotal();
        openModal("insuranceRenewalModal");
    }

    function updateRenewalTotal() {
        state.selectedRenewalAmount = calculateInsurancePremium(
            state.selectedRenewalMonthlyPremium,
            valueOf("renew_duration")
        );
        setText("renewTotalAmount", formatMoney(state.selectedRenewalAmount));
    }

    async function handleInsuranceRenewal(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) {
            return;
        }

        const duration = valueOf("renew_duration");
        updateRenewalTotal();

        await payAndRun({
            amount: state.selectedRenewalAmount,
            name: "HospiKare Insurance",
            description: "Policy Renewal Payment",
            prefillName: user.full_name,
            onSuccess: async response => {
                const renewalData = await postJson("/api/user/insurance-renewal", {
                    purchase_id: state.selectedRenewalPurchaseId || valueOf("renew_purchase_id"),
                    plan_duration: duration,
                    premium_amount: state.selectedRenewalAmount,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!renewalData.success) {
                    toast(renewalData.message || "Policy renewal failed");
                    return;
                }

                toast("Policy renewed successfully");
                closeModal("insuranceRenewalModal");
                $("#insuranceRenewalForm")?.reset();
                loadUserInsuranceDashboard();
                loadInsurances();
            }
        });
    }

    function openProductModal(type, id, name, brand, price) {
        if (!requireUser()) {
            return;
        }

        state.selectedProductType = type;
        state.selectedProductId = id;
        state.selectedProductPrice = Number(price) || 0;
        setText("productModalTitle", type === "equipment" ? "Buy Equipment" : "Buy Medicine");
        $("#buy_product_name").value = name || "";
        $("#buy_product_brand").value = brand || "";
        $("#buy_quantity").value = 1;
        updateProductTotal();
        openModal("productBuyModal");
    }

    function updateProductTotal() {
        const qty = Math.max(1, Number(valueOf("buy_quantity")) || 1);
        setText("productTotalAmount", formatMoney(qty * state.selectedProductPrice));
    }

    async function handleProductPurchase(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) {
            return;
        }

        const quantity = Math.max(1, Number(valueOf("buy_quantity")) || 1);
        const totalAmount = quantity * state.selectedProductPrice;

        await payAndRun({
            amount: totalAmount,
            name: "HospiKare",
            description: "Product Purchase",
            prefillName: user.full_name,
            onSuccess: async response => {
                const purchaseData = await postJson("/api/buy-product", {
                    user_id: user.id,
                    product_type: state.selectedProductType,
                    product_id: state.selectedProductId,
                    quantity,
                    total_amount: totalAmount,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id
                });

                if (!purchaseData.success) {
                    toast(purchaseData.message || "Purchase failed");
                    return;
                }

                toast("Purchase successful");
                if (purchaseData.invoice_url) {
                    window.open(purchaseData.invoice_url, "_blank");
                }
                closeModal("productBuyModal");
            }
        });
    }

    async function payAndRun({ amount, name, description, prefillName, onSuccess }) {
        if (!amount || Number(amount) <= 0) {
            toast("Amount is not valid");
            return;
        }

        if (!window.Razorpay) {
            toast("Payment gateway is still loading. Try again in a moment.");
            return;
        }

        try {
            const orderData = await postJson("/api/create-order", { amount: Number(amount) });
            if (!orderData.success) {
                toast(orderData.message || "Order creation failed");
                return;
            }

            const razorpay = new window.Razorpay({
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name,
                description,
                order_id: orderData.order.id,
                prefill: { name: prefillName || state.user?.full_name || "" },
                theme: { color: "#1f3a9a" },
                handler: onSuccess
            });

            razorpay.open();
        } catch (error) {
            console.error(error);
            toast("Payment could not start");
        }
    }

    function addToCart(item) {
        if (!requireUser()) {
            state.pendingCartItem = item;
            return;
        }

        const key = `${item.type}:${item.id}`;
        const existing = state.cart.find(cartItem => cartItem.key === key);

        if (existing) {
            existing.qty += 1;
        } else {
            state.cart.push({
                key,
                type: item.type,
                id: item.id,
                name: item.name || "Product",
                brand: item.brand || "No Brand",
                price: Number(item.price) || 0,
                qty: 1
            });
        }

        saveCart();
        updateCartUI();
        toast(`${item.name || "Product"} added to cart`);
    }

    function openCartModal() {
        if (!requireUser()) {
            return;
        }
        renderCart();
        openModal("cartModal");
    }

    function renderCart() {
        const cartItems = $("#cartItems");
        if (!cartItems) {
            return;
        }

        if (!state.cart.length) {
            cartItems.innerHTML = `<div class="emptyState">Your cart is empty.</div>`;
            setText("cartTotal", formatMoney(0));
            return;
        }

        cartItems.innerHTML = state.cart.map(item => `
            <div class="cartItem">
                <div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${escapeHtml(item.brand)} - ${escapeHtml(item.type)} - ${formatMoney(item.price)}</p>
                </div>
                <div class="cartItemControls">
                    <button type="button" data-cart-action="decrease" data-key="${escapeAttr(item.key)}" aria-label="Decrease quantity">-</button>
                    <strong>${escapeHtml(item.qty)}</strong>
                    <button type="button" data-cart-action="increase" data-key="${escapeAttr(item.key)}" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="cartRemoveBtn" data-cart-action="remove" data-key="${escapeAttr(item.key)}" aria-label="Remove item">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join("");

        setText("cartTotal", formatMoney(cartTotal()));
        const hasMedicine = state.cart.some(item => item.type === 'medicine');
        const prescGroup = document.getElementById('prescriptionUploadGroup');
        if (prescGroup) {
            prescGroup.style.display = hasMedicine ? 'block' : 'none';
        }
    }

    function updateCartItem(key, action) {
        const item = state.cart.find(cartItem => cartItem.key === key);
        if (!item) {
            return;
        }

        if (action === "increase") {
            item.qty += 1;
        }

        if (action === "decrease") {
            item.qty -= 1;
        }

        if (action === "remove" || item.qty <= 0) {
            state.cart = state.cart.filter(cartItem => cartItem.key !== key);
        }

        saveCart();
        renderCart();
        updateCartUI();
    }

    function updateCartUI() {
        const user = getSavedUser();
        const count = user ? state.cart.reduce((sum, item) => sum + item.qty, 0) : 0;
        $$(".cartCount").forEach(el => {
            el.textContent = String(count);
        });
    }

    function cartTotal() {
        return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    function showAuthModal() {
        switchAuthTab("login");
        openModal("authOverlay");
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) {
            return;
        }
        modal.style.display = "";
        modal.classList.add("active");
        document.body.classList.add("authLocked");
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) {
            return;
        }
        modal.classList.remove("active");
        modal.style.display = "";

        if (!$(".modal.active")) {
            document.body.classList.remove("authLocked");
        }
    }

    function closeAllModals() {
        $$(".modal.active").forEach(modal => closeModal(modal.id));
    }






    function requireUser() {
        state.user = getSavedUser();
        if (state.user) {
            return state.user;
        }

        toast("Please login first");
        showAuthModal();
        return null;
    }

    function getSavedUser() {
        try {
            const rawUser = localStorage.getItem(USER_KEY) || localStorage.getItem("hk_user");
            return rawUser ? JSON.parse(rawUser) : null;
        } catch (error) {
            return null;
        }
    }

    function getCart() {
        const user = getSavedUser();
        if (!user) {
            try { localStorage.removeItem(CART_KEY); } catch(e) {}
            return [];
        }
        try {
            const userCartKey = user.id ? `${CART_KEY}_${user.id}` : CART_KEY;
            const rawCart = localStorage.getItem(userCartKey) || localStorage.getItem(CART_KEY);
            const parsed = rawCart ? JSON.parse(rawCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            try { localStorage.removeItem(CART_KEY); } catch(e) {}
            return [];
        }
    }

    function saveCart() {
        const user = getSavedUser();
        if (!user) {
            return;
        }
        if (user.id) {
            localStorage.setItem(`${CART_KEY}_${user.id}`, JSON.stringify(state.cart));
        }
        localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    }

    async function apiGet(url) {
        const response = await fetch(url, { credentials: "same-origin" });
        return response.json();
    }

    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "same-origin"
        });
        return response.json();
    }

    function filterMedicines(query) {
        const term = String(query || "").trim().toLowerCase();
        if (!term) {
            return state.medicines;
        }

        return state.medicines.filter(medicine => {
            const haystack = [
                medicine.medicine_name,
                medicine.brand_name,
                medicine.category,
                medicine.generic_name,
                medicine.manufacturer
            ].join(" ").toLowerCase();

            return haystack.includes(term);
        });
    }

    
    function getImageUrl(imgPath) {
        if (!imgPath) return '';
        let normalized = String(imgPath).replace(/\\\\/g, '/');
        if (normalized.startsWith('http')) return normalized;
        if (normalized.startsWith('uploads/')) return '/' + normalized;
        if (normalized.startsWith('/uploads/')) return normalized;
        if (normalized.startsWith('/')) return normalized;
        return '/uploads/' + normalized;
    }
    
    function renderLoading(container, message) {
        if (container) {
            container.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
        }
    }

    function renderEmpty(container, message) {
        if (container) {
            container.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
        }
    }

    function setMinimumDateTime() {
        const bookingDate = $("#booking_date");
        if (!bookingDate) {
            return;
        }

        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        bookingDate.min = now.toISOString().slice(0, 16);
    }

    function setFormBusy(formId, isBusy) {
        const form = document.getElementById(formId);
        const button = form?.querySelector("button[type='submit']");
        if (button) {
            button.disabled = isBusy;
            button.dataset.originalText = button.dataset.originalText || button.textContent;
            button.textContent = isBusy ? "Please wait..." : button.dataset.originalText;
        }
    }

    function valueOf(id) {
        return document.getElementById(id)?.value?.trim() || "";
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function parseMoney(value) {
        const amount = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
        return Number.isFinite(amount) ? amount : 0;
    }

    function calculateInsurancePremium(monthlyPremium, durationMonths) {
        const months = Math.max(1, Number(durationMonths) || 1);
        let total = parseMoney(monthlyPremium) * months;

        if (months === 3) {
            total -= 200;
        } else if (months === 6) {
            total -= 700;
        } else if (months === 12) {
            total -= 2000;
        }

        return Math.max(total, 0);
    }

    function formatMoney(value) {
        const amount = parseMoney(value);
        return `Rs. ${amount.toLocaleString("en-IN")}`;
    }

    function formatDate(value) {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function listFrom(value) {
        if (Array.isArray(value)) {
            return value.filter(Boolean);
        }

        if (!value) {
            return [];
        }

        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) {
                return [];
            }

            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean);
                }
                if (parsed) {
                    return [String(parsed)];
                }
            } catch (error) {
                return trimmed.split(",").map(item => item.trim()).filter(Boolean);
            }
        }

        return [String(value)];
    }

    function escapeHtml(value) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return String(value ?? "").replace(/[&<>"']/g, char => entities[char]);
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function firstName(name) {
        return String(name || "User").trim().split(/\s+/)[0] || "User";
    }

    function toast(message) {
        let toastEl = $("#userToast");
        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.id = "userToast";
            toastEl.className = "toast";
            document.body.appendChild(toastEl);
        }

        toastEl.textContent = message;
        toastEl.classList.add("show");
        window.clearTimeout(toastEl.hideTimer);
        toastEl.hideTimer = window.setTimeout(() => {
            toastEl.classList.remove("show");
        }, 2800);
    }




















    const state = {
        user: null,
        medicines: [],
        cart: [],
        selectedAmbulanceId: null,
        selectedAmbulanceAmount: 0,
        selectedLabId: null,
        selectedLabAmount: 0,
        selectedTestName: "",
        selectedInsuranceId: null,
        selectedInsuranceAmount: 0,
        selectedInsurancePlan: "",
        selectedInsuranceBasePrice: 0,
        selectedRenewalPurchaseId: null,
        selectedRenewalMonthlyPremium: 0,
        selectedRenewalAmount: 0,
        selectedProductType: "",
        selectedProductId: null,
        selectedProductPrice: 0
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    document.addEventListener("DOMContentLoaded", init);
    window.addEventListener("pageshow", () => {
        state.user = getSavedUser();
        updateUserUI();
        if (state.user) {
            closeModal("authOverlay");
        }
    });

    async function loadUserInsuranceDashboard() {
        const container = $("#userPoliciesContainer");
        if (!container) return;

        const currentUser = getSavedUser();
        if (!currentUser) {
            container.innerHTML = `
                <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 32px 20px; text-align: center;">
                    <i class="fa-solid fa-shield-heart" style="font-size: 36px; color: #94a3b8; margin-bottom: 12px; display: block;"></i>
                    <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Login to View Your Policies & Claims</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Access your active health insurance policies, claim history, and renewal options.</p>
                    <button type="button" class="btn btn-primary btn-sm" data-action="open-login" style="padding: 8px 20px; font-weight: 700;">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> Login Now
                    </button>
                </div>
            `;
            return;
        }

        try {
            container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: #64748b;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px; display: block; color: #3b82f6;"></i>
                    Loading your policies and claims...
                </div>
            `;

            const userIdParam = currentUser && currentUser.id ? `?user_id=${currentUser.id}` : "";
            const [policiesData, claimsData] = await Promise.all([
                apiGet(`/api/user/insurance-policies${userIdParam}`),
                apiGet(`/api/user/insurance-claims${userIdParam}`)
            ]);

            const policies = (policiesData && policiesData.success && Array.isArray(policiesData.policies)) ? policiesData.policies : [];
            const claims = (claimsData && claimsData.success && Array.isArray(claimsData.claims)) ? claimsData.claims : [];

            if (!policies.length) {
                container.innerHTML = `
                    <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 32px 20px; text-align: center;">
                        <i class="fa-solid fa-folder-open" style="font-size: 36px; color: #94a3b8; margin-bottom: 12px; display: block;"></i>
                        <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">No Active Policies Yet</h4>
                        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">You have not purchased any health insurance policy yet. Choose a plan above to get started with instant coverage!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = policies.map((policy, idx) => {
                const status = String(policy.insurance_status || "active").toLowerCase();
                const isActive = status === "active";
                const policyName = policy.plan_name || policy.comp_name || "Health Insurance Policy";
                const premium = parseMoney(policy.ins_price) || parseMoney(policy.premium_amount);
                const coverage = parseMoney(policy.coverage_amount || policy.claim_price);

                // Match claims specifically for this policy:
                const policyClaims = claims.filter(c => 
                    (c.insurance_purchase_id && Number(c.insurance_purchase_id) === Number(policy.id)) ||
                    (c.policy_number && policy.policy_number && String(c.policy_number).trim() === String(policy.policy_number).trim())
                );

                // Store policy data globally for modal
                window._userPoliciesData = window._userPoliciesData || [];
                window._userPoliciesData[idx] = { policy, policyClaims, policyName, premium, coverage, status, isActive };

                return `
                    <article class="purchasedPolicyCard" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 22px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                        <div style="flex:1;min-width:0;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
                                <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">${escapeHtml(policyName)}</h3>
                                <span class="statusPill ${escapeAttr(status)}" style="padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                                    <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${escapeHtml(status)}
                                </span>
                            </div>
                            <div style="font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                                <span><i class="fa-solid fa-building-shield" style="color: #3b82f6;"></i> ${escapeHtml(policy.comp_name || "HospiKare Health")}</span>
                                <span><i class="fa-solid fa-hashtag" style="color: #3b82f6;"></i> ${escapeHtml(policy.policy_number || "POL-" + policy.id)}</span>
                                <span><i class="fa-solid fa-receipt" style="color: #f59e0b;"></i> ${policyClaims.length} Claims</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; flex-shrink:0;">
                            <button type="button" onclick="window._openPolicyDetailModal(${idx})" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 8px; padding: 8px 16px; font-size: 13px; background: #2563eb; color: #fff; border: none; cursor: pointer;">
                                <i class="fa-solid fa-eye"></i> View Details
                            </button>
                            <button class="btn btn-primary btn-sm" type="button" data-action="claim-insurance" data-purchase-id="${escapeAttr(policy.id)}" data-policy="${escapeAttr(policyName)}" data-coverage="${escapeAttr(coverage)}" ${isActive ? "" : "disabled"} style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 8px; padding: 8px 14px; font-size: 13px;">
                                <i class="fa-solid fa-file-medical"></i> File Claim
                            </button>
                            <button class="btn btn-outline-blue btn-sm" type="button" data-action="renew-insurance" data-purchase-id="${escapeAttr(policy.id)}" data-policy="${escapeAttr(policyName)}" data-premium="${escapeAttr(premium)}" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 8px; padding: 8px 14px; font-size: 13px;">
                                <i class="fa-solid fa-arrows-rotate"></i> Renew
                            </button>
                        </div>
                    </article>
                `;
            }).join("");

        } catch (err) {
            console.error("Insurance dashboard error:", err);
            container.innerHTML = `
                <div style="background: #ffffff; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center; color: #ef4444; font-size: 13px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    Failed to load insurance policies. Please try refreshing.
                </div>
            `;
        }
    }

    // ======= CATALOG POLICY MODAL =======
    window._openCatalogPolicyModal = function(policyId) {
        var data = window._catalogPoliciesData && window._catalogPoliciesData[policyId];
        if (!data) return;
        var policy = data.policy, policyClaims = data.policyClaims, policyName = data.policyName;
        var premium = data.premium, coverage = data.coverage, status = data.status, isActive = data.isActive;

        document.getElementById('policyDetailTitle').textContent = policyName;
        document.getElementById('policyDetailSub').innerHTML = '<i class="fa-solid fa-building-shield" style="color:#3b82f6;"></i> ' + escapeHtml(policy.comp_name || 'HospiKare Health') + ' &nbsp;|&nbsp; <i class="fa-solid fa-hashtag" style="color:#3b82f6;"></i> ' + escapeHtml(policy.policy_number || 'POL-' + policy.id);

        var claimsHtml = '';
        if (policyClaims.length > 0) {
            claimsHtml = '<div style="display:flex;flex-direction:column;gap:10px;">';
            for (var i = 0; i < policyClaims.length; i++) {
                var c = policyClaims[i];
                var cs = String(c.claim_status || 'pending').toLowerCase();
                var sc = '#f59e0b', sb = '#fffbeb', sbd = '#fef3c7', si = 'fa-clock';
                if (cs === 'approved' || cs === 'settled') { sc = '#10b981'; sb = '#ecfdf5'; sbd = '#a7f3d0'; si = 'fa-circle-check'; }
                else if (cs === 'rejected') { sc = '#ef4444'; sb = '#fef2f2'; sbd = '#fecaca'; si = 'fa-circle-xmark'; }
                claimsHtml += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + sc + ';border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">';
                claimsHtml += '<div style="flex:1;min-width:0;">';
                claimsHtml += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;"><strong style="font-size:14px;color:#0f172a;">Claim #' + c.id + '</strong>';
                claimsHtml += '<span style="display:inline-flex;align-items:center;gap:4px;background:' + sb + ';color:' + sc + ';border:1px solid ' + sbd + ';padding:2px 10px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;"><i class="fa-solid ' + si + '"></i> ' + escapeHtml(c.claim_status || 'Pending') + '</span></div>';
                if (c.hospital_name) claimsHtml += '<div style="font-size:13px;color:#334155;font-weight:600;margin-bottom:3px;"><i class="fa-solid fa-hospital" style="color:#3b82f6;margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.hospital_name) + '</div>';
                if (c.treatment_type) claimsHtml += '<div style="font-size:12px;color:#64748b;margin-bottom:3px;"><i class="fa-solid fa-stethoscope" style="margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.treatment_type) + '</div>';
                claimsHtml += '<div style="font-size:12px;color:#64748b;margin-top:3px;">Submitted ' + formatDate(c.created_at) + (c.claim_reason ? ' &bull; ' + escapeHtml(c.claim_reason) : '') + '</div>';
                if (c.admin_remarks) claimsHtml += '<div style="font-size:12px;color:#7c3aed;margin-top:5px;font-style:italic;"><i class="fa-solid fa-comment" style="margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.admin_remarks) + '</div>';
                claimsHtml += '</div>';
                claimsHtml += '<div style="text-align:right;flex-shrink:0;"><span style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Claim Amount</span>';
                claimsHtml += '<div style="font-size:16px;font-weight:800;color:#0f172a;">' + formatMoney(c.claim_amount) + '</div>';
                if (c.approved_amount) claimsHtml += '<div style="font-size:12px;color:#10b981;font-weight:700;margin-top:3px;">✅ Approved: ' + formatMoney(c.approved_amount) + '</div>';
                claimsHtml += '</div></div>';
            }
            claimsHtml += '</div>';
        } else {
            claimsHtml = '<div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:18px 20px;display:flex;align-items:center;gap:12px;color:#64748b;font-size:13px;"><i class="fa-regular fa-folder-open" style="font-size:18px;color:#94a3b8;"></i><span>No claims filed under this policy yet.</span></div>';
        }

        var bodyHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:20px;background:#f8fafc;padding:16px 20px;border-radius:12px;border:1px solid #edf2f7;">';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Coverage Amount</span><div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:3px;">' + formatMoney(coverage) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Premium Paid</span><div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:3px;">' + formatMoney(premium) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Valid Until</span><div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:3px;">' + formatDate(policy.expiry_date) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Status</span><div style="font-size:14px;font-weight:800;color:' + (isActive ? '#10b981' : '#ef4444') + ';margin-top:3px;text-transform:uppercase;">' + escapeHtml(status) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Claims Filed</span><div style="font-size:15px;font-weight:800;color:#3b82f6;margin-top:3px;">' + policyClaims.length + ' Claims</div></div>';
        bodyHtml += '</div>';
        bodyHtml += '<div style="margin-top:6px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><i class="fa-solid fa-receipt" style="color:#3b82f6;font-size:14px;"></i><h4 style="margin:0;font-size:14px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">Claims Under This Policy (' + policyClaims.length + ')</h4></div>';
        bodyHtml += claimsHtml + '</div>';

        document.getElementById('policyDetailBody').innerHTML = bodyHtml;
        document.getElementById('policyDetailModal').style.display = 'flex';
    };

    // ======= POLICY DETAIL MODAL =======
    window._openPolicyDetailModal = function(idx) {
        var data = window._userPoliciesData && window._userPoliciesData[idx];
        if (!data) return;
        var policy = data.policy, policyClaims = data.policyClaims, policyName = data.policyName;
        var premium = data.premium, coverage = data.coverage, status = data.status, isActive = data.isActive;

        document.getElementById('policyDetailTitle').textContent = policyName;
        document.getElementById('policyDetailSub').innerHTML = '<i class="fa-solid fa-building-shield" style="color:#3b82f6;"></i> ' + escapeHtml(policy.comp_name || 'HospiKare Health') + ' &nbsp;|&nbsp; <i class="fa-solid fa-hashtag" style="color:#3b82f6;"></i> ' + escapeHtml(policy.policy_number || 'POL-' + policy.id);

        var claimsHtml = '';
        if (policyClaims.length > 0) {
            claimsHtml = '<div style="display:flex;flex-direction:column;gap:10px;">';
            for (var i = 0; i < policyClaims.length; i++) {
                var c = policyClaims[i];
                var cs = String(c.claim_status || 'pending').toLowerCase();
                var sc = '#f59e0b', sb = '#fffbeb', sbd = '#fef3c7', si = 'fa-clock';
                if (cs === 'approved' || cs === 'settled') { sc = '#10b981'; sb = '#ecfdf5'; sbd = '#a7f3d0'; si = 'fa-circle-check'; }
                else if (cs === 'rejected') { sc = '#ef4444'; sb = '#fef2f2'; sbd = '#fecaca'; si = 'fa-circle-xmark'; }
                claimsHtml += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + sc + ';border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">';
                claimsHtml += '<div style="flex:1;min-width:0;">';
                claimsHtml += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;"><strong style="font-size:14px;color:#0f172a;">Claim #' + c.id + '</strong>';
                claimsHtml += '<span style="display:inline-flex;align-items:center;gap:4px;background:' + sb + ';color:' + sc + ';border:1px solid ' + sbd + ';padding:2px 10px;border-radius:999px;font-size:11px;font-weight:800;text-transform:uppercase;"><i class="fa-solid ' + si + '"></i> ' + escapeHtml(c.claim_status || 'Pending') + '</span></div>';
                if (c.hospital_name) claimsHtml += '<div style="font-size:13px;color:#334155;font-weight:600;margin-bottom:3px;"><i class="fa-solid fa-hospital" style="color:#3b82f6;margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.hospital_name) + '</div>';
                if (c.treatment_type) claimsHtml += '<div style="font-size:12px;color:#64748b;margin-bottom:3px;"><i class="fa-solid fa-stethoscope" style="margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.treatment_type) + '</div>';
                claimsHtml += '<div style="font-size:12px;color:#64748b;margin-top:3px;">Submitted ' + formatDate(c.created_at) + (c.claim_reason ? ' &bull; ' + escapeHtml(c.claim_reason) : '') + '</div>';
                if (c.admin_remarks) claimsHtml += '<div style="font-size:12px;color:#7c3aed;margin-top:5px;font-style:italic;"><i class="fa-solid fa-comment" style="margin-right:5px;font-size:11px;"></i>' + escapeHtml(c.admin_remarks) + '</div>';
                claimsHtml += '</div>';
                claimsHtml += '<div style="text-align:right;flex-shrink:0;"><span style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Claim Amount</span>';
                claimsHtml += '<div style="font-size:16px;font-weight:800;color:#0f172a;">' + formatMoney(c.claim_amount) + '</div>';
                if (c.approved_amount) claimsHtml += '<div style="font-size:12px;color:#10b981;font-weight:700;margin-top:3px;">✅ Approved: ' + formatMoney(c.approved_amount) + '</div>';
                claimsHtml += '</div></div>';
            }
            claimsHtml += '</div>';
        } else {
            claimsHtml = '<div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:18px 20px;display:flex;align-items:center;gap:12px;color:#64748b;font-size:13px;"><i class="fa-regular fa-folder-open" style="font-size:18px;color:#94a3b8;"></i><span>No claims filed under this policy yet.</span></div>';
        }

        var bodyHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:20px;background:#f8fafc;padding:16px 20px;border-radius:12px;border:1px solid #edf2f7;">';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Coverage Amount</span><div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:3px;">' + formatMoney(coverage) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Premium Paid</span><div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:3px;">' + formatMoney(premium) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Valid Until</span><div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:3px;">' + formatDate(policy.expiry_date) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Status</span><div style="font-size:14px;font-weight:800;color:' + (isActive ? '#10b981' : '#ef4444') + ';margin-top:3px;text-transform:uppercase;">' + escapeHtml(status) + '</div></div>';
        bodyHtml += '<div><span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:0.5px;">Claims Filed</span><div style="font-size:15px;font-weight:800;color:#3b82f6;margin-top:3px;">' + policyClaims.length + ' Claims</div></div>';
        bodyHtml += '</div>';
        bodyHtml += '<div style="margin-top:6px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><i class="fa-solid fa-receipt" style="color:#3b82f6;font-size:14px;"></i><h4 style="margin:0;font-size:14px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">Claims Under This Policy (' + policyClaims.length + ')</h4></div>';
        bodyHtml += claimsHtml + '</div>';

        document.getElementById('policyDetailBody').innerHTML = bodyHtml;
        document.getElementById('policyDetailModal').style.display = 'flex';
    };

    async function init() {
        // Sync session state with backend if available
        try {
            const res = await apiGet('/api/product-user/profile');
            if (res && res.success && res.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(res.user));
                localStorage.setItem("hk_user", JSON.stringify(res.user));
            }
        } catch(e) {}

        state.user = getSavedUser();
        state.cart = getCart();

        wireNavigation();
        wireAuth();
        wireModals();
        wireDynamicActions();
        wireCart();
        wireProductForm();
        updateUserUI();
        updateCartUI();

        closeModal("authOverlay");

        loadFeaturedHospitals();
        loadAmbulances();
        loadLabs();
        loadInsurances();
        loadUserInsuranceDashboard();
        loadMedicines();
        loadEquipments();
    }

    function wireNavigation() {
        const menuBtn = $("#menuBtn");
        const closeBtn = $("#closeBtn");
        const sidebar = $("#sidebar");
        const overlay = $("#overlay");

        const closeSidebar = () => {
            sidebar?.classList.remove("active");
            overlay?.classList.remove("active");
        };

        menuBtn?.addEventListener("click", () => {
            sidebar?.classList.add("active");
            overlay?.classList.add("active");
        });
        closeBtn?.addEventListener("click", closeSidebar);
        overlay?.addEventListener("click", closeSidebar);
        $$(".sidebarLinks a").forEach(link => link.addEventListener("click", closeSidebar));
    }

    function wireAuth() {
        $("#authOpenBtn")?.addEventListener("click", () => {
        if (!state.user) {
            showAuthModal();
        } else {
            // Populate and show profile modal
            const user = state.user;
            const fName = String(user.full_name || user.name || "User").trim().split(/\s+/)[0] || "User";
            const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
            
            if ($("#profileModalImg")) $("#profileModalImg").src = photoUrl;
            if ($("#profileModalName")) $("#profileModalName").textContent = user.full_name || "User";
            if ($("#profileModalEmail")) $("#profileModalEmail").textContent = user.email || user.phone || "";
            
            openModal("userProfileModal");
        }
    });
    $("#closeProfileModal")?.addEventListener("click", () => closeModal("userProfileModal"));
    $("#modalLogoutBtn")?.addEventListener("click", () => {
        closeModal("userProfileModal");
        logoutUser();
    });
        $("#closeAuthModal")?.addEventListener("click", () => closeModal("authOverlay"));
        $("#logoutBtn")?.addEventListener("click", logoutUser);
        $("#sidebarLogoutBtn")?.addEventListener("click", event => {
            event.preventDefault();
            logoutUser();
        });
        $("#loginTab")?.addEventListener("click", () => switchAuthTab("login"));
        $("#registerTab")?.addEventListener("click", () => switchAuthTab("register"));
        $("#loginForm")?.addEventListener("submit", handleLogin);
        $("#registerForm")?.addEventListener("submit", handleRegister);
    }

    function wireModals() {
        $("#closeAmbulanceModal")?.addEventListener("click", () => closeModal("ambulanceBookingModal"));
        $("#closeLabModal")?.addEventListener("click", () => closeModal("labBookingModal"));
        $("#closeInsuranceModal")?.addEventListener("click", () => closeModal("insuranceModal"));
        $("#closeInsuranceClaimModal")?.addEventListener("click", () => closeModal("insuranceClaimModal"));
        $("#closeInsuranceRenewalModal")?.addEventListener("click", () => closeModal("insuranceRenewalModal"));
        $("#closeProductModal")?.addEventListener("click", () => closeModal("productBuyModal"));
        $("#closeCartModal")?.addEventListener("click", () => closeModal("cartModal"));
        $("#refreshInsuranceClaimsBtn")?.addEventListener("click", () => {
            loadUserInsuranceDashboard();
            loadInsurances();
        });
        $("#renew_duration")?.addEventListener("change", updateRenewalTotal);

        $$(".modal").forEach(modal => {
            modal.addEventListener("click", event => {
                if (event.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeAllModals();
            }
        });

        $("#ambulanceBookingForm")?.addEventListener("submit", handleAmbulanceBooking);
        $("#labBookingForm")?.addEventListener("submit", handleLabBooking);
        $("#insurancePurchaseForm")?.addEventListener("submit", handleInsurancePurchase);
        $("#insuranceClaimForm")?.addEventListener("submit", handleInsuranceClaim);
        $("#insuranceRenewalForm")?.addEventListener("submit", handleInsuranceRenewal);
    }

        function openAmbulanceBooking(ambType, amount, condition) {
        const user = requireUser();
        if (!user) {
            return;
        }

        state.selectedAmbulanceType = ambType || 'Emergency Ambulance';
        state.selectedAmbulanceAmount = Number(amount) || 2000;
        
        const conditionInput = document.getElementById("patient_condition");
        if (conditionInput && condition) {
            conditionInput.value = condition;
        }

        setText("ambulanceFare", formatMoney(state.selectedAmbulanceAmount));
        setMinimumDateTime();
        openModal("ambulanceBookingModal");
    }

    
    async function handleAmbulanceBooking(event) {
        event.preventDefault();
        
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            ambulance_id: state.selectedAmbulanceId,
            patient_name: valueOf("patient_name"),
            patient_condition: valueOf("patient_condition"),
            pickup_address: valueOf("pickup_address"),
            destination_address: valueOf("destination_address"),
            booking_date: valueOf("booking_date"),
            total_amount: state.selectedAmbulanceAmount
        };

        await payAndRun({
            amount: state.selectedAmbulanceAmount,
            name: "HospiKare Ambulance",
            description: "Ambulance Booking Payment",
            prefillName: formData.patient_name,
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-ambulance", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Ambulance booking failed");
                    return;
                }

                toast("Payment successful and ambulance dispatched!");
                closeModal("ambulanceBookingModal");
                const form = document.getElementById("ambulanceBookingForm");
                if (form) form.reset();
                
                if (bookingData.tracking_token) {
                    setTimeout(() => {
                        window.location.href = '/user-tracking.html?token=' + bookingData.tracking_token;
                    }, 1500);
                }
            }
        });
    }

    function openLabBooking(labId, testName, amount) {
        const user = requireUser();
        if (!user) return;

        state.selectedLabId = labId;
        state.selectedTestName = testName || 'Lab Test';
        state.selectedLabAmount = Number(amount) || 500;
        
        const testNameInput = document.getElementById("lab_test_name");
        if (testNameInput) {
            testNameInput.value = state.selectedTestName;
        }

        setText("labTestAmount", formatMoney(state.selectedLabAmount));
        
        const labPayingNowDisplay = document.getElementById('labPayingNowDisplay');
        const labRemainingDisplay = document.getElementById('labRemainingDisplay');
        if(labPayingNowDisplay) labPayingNowDisplay.innerText = formatMoney(state.selectedLabAmount);
        if(labRemainingDisplay) labRemainingDisplay.innerText = 'Rs. 0';
        
        // Reset part payment section
        const labPartPaymentSection = document.getElementById('labPartPaymentSection');
        if(labPartPaymentSection) labPartPaymentSection.style.display = 'none';
        
        const fullRadio = document.querySelector('input[name="labPaymentType"][value="full"]');
        if(fullRadio) fullRadio.checked = true;

        openModal("labBookingModal");
    }

    // Lab Payment Type Logic
    (function() {
        const labPaymentTypeRadios = document.querySelectorAll('input[name="labPaymentType"]');
        const labPartPaymentSection = document.getElementById('labPartPaymentSection');
        const labPartPayAmountInput = document.getElementById('labPartPayAmount');
        const labPartPayError = document.getElementById('labPartPayError');
        const labPayingNowDisplay = document.getElementById('labPayingNowDisplay');
        const labRemainingDisplay = document.getElementById('labRemainingDisplay');
        const labTestAmountDisplay = document.getElementById('labTestAmount');

        if (labPaymentTypeRadios) {
            labPaymentTypeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'part') {
                        if (labPartPaymentSection) labPartPaymentSection.style.display = 'block';
                        if (labPartPayAmountInput) labPartPayAmountInput.value = '';
                        if (labPayingNowDisplay) labPayingNowDisplay.innerText = '\u20b90';
                        if (labRemainingDisplay && labTestAmountDisplay) labRemainingDisplay.innerText = labTestAmountDisplay.innerText;
                    } else {
                        if (labPartPaymentSection) labPartPaymentSection.style.display = 'none';
                        if (labPartPayError) labPartPayError.style.display = 'none';
                    }
                });
            });
        }

        if (labPartPayAmountInput) {
            labPartPayAmountInput.addEventListener('input', function() {
                const total = Number((labTestAmountDisplay ? labTestAmountDisplay.innerText : '0').replace(/[^0-9]/g, ''));
                const entered = Number(this.value) || 0;
                const minRequired = Math.ceil(total / 2);
                
                if (entered > 0 && entered < minRequired) {
                    if (labPartPayError) { labPartPayError.style.display = 'block'; labPartPayError.innerText = 'Minimum ' + minRequired + ' (50% of total) is required'; }
                } else if (entered > total) {
                    if (labPartPayError) { labPartPayError.style.display = 'block'; labPartPayError.innerText = 'Amount cannot exceed total ' + total; }
                } else {
                    if (labPartPayError) labPartPayError.style.display = 'none';
                }
                
                if (labPayingNowDisplay) labPayingNowDisplay.innerText = '\u20b9' + entered;
                if (labRemainingDisplay) labRemainingDisplay.innerText = '\u20b9' + Math.max(0, total - entered);
            });
        }
})();

    async function handleLabBooking(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) return;

        const fullTotal = state.selectedLabAmount || 500;
        let amount = fullTotal;
        const selectedPayType = document.querySelector('input[name="labPaymentType"]:checked')?.value || 'full';
        
        if (selectedPayType === 'part') {
            const partVal = Number(document.getElementById('labPartPayAmount')?.value || 0);
            const minRequired = Math.ceil(fullTotal / 2);
            if (partVal < minRequired) {
                toast('Minimum payment is \u20b9' + minRequired + ' (50% of total amount)');
                return;
            }
            if (partVal > fullTotal) {
                toast('Payment amount cannot exceed total amount');
                return;
            }
            amount = partVal;
        }

        await payAndRun({
            amount: amount,
            name: "HospiKare Lab Booking",
            description: "Lab Test Payment (" + (selectedPayType === 'part' ? 'Part' : 'Full') + ")",
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-lab-test", {
                    user_id: user.id,
                    lab_vendor_id: state.selectedLabId,
                    test_name: state.selectedTestName,
                    patient_name: valueOf("lab_patient_name"),
                    sample_collection_type: valueOf("sample_collection_type"),
                    booking_date: valueOf("lab_booking_date"),
                    total_amount: fullTotal,
                    paid_amount: amount,
                    payment_type: selectedPayType,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Lab booking failed");
                    return;
                }

                toast("Lab test booked successfully!");
                closeModal("labBookingModal");
                $("#labBookingForm")?.reset();
                
                // Reset part payment UI
                if (document.getElementById('labPartPaymentSection')) {
                    document.getElementById('labPartPaymentSection').style.display = 'none';
                }
                const fullRadio = document.querySelector('input[name="labPaymentType"][value="full"]');
                if (fullRadio) fullRadio.checked = true;
            }
        });
    }

    window.openInsuranceModal = function(id, name, claim, price) {
        if (!requireUser()) {
            state.pendingInsurancePlan = { id, name, claim, price };
            return;
        }

        state.selectedInsuranceId = id;
        state.selectedInsurancePlan = name || "Insurance Plan";
        state.selectedInsuranceBasePrice = parseMoney(price);
        state.selectedInsuranceAmount = state.selectedInsuranceBasePrice;

        document.getElementById('insurance_plan_name').value = name;
        document.getElementById('insurance_claim_price').value = claim;
        document.getElementById('insurance_price').value = price;
        document.getElementById('insurance_duration').value = '1';
        document.getElementById('insuranceTotalAmount').textContent = formatMoney(state.selectedInsuranceBasePrice);
        
        const form = document.getElementById('insurancePurchaseForm');
        if(form) form.dataset.planId = id;
        
        openModal("insuranceModal");
    };

    $("#insurance_duration")?.addEventListener("change", function () {
        state.selectedInsuranceAmount = calculateInsurancePremium(
            state.selectedInsuranceBasePrice,
            this.value
        );
        setText("insuranceTotalAmount", formatMoney(state.selectedInsuranceAmount));
    });

    async function handleInsurancePurchase(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            insurance_vendor_id: state.selectedInsuranceId,
            plan_name: state.selectedInsurancePlan,
            premium_amount: state.selectedInsuranceAmount,
            plan_duration: valueOf("insurance_duration")
        };

        await payAndRun({
            amount: state.selectedInsuranceAmount,
            name: "HospiKare Insurance",
            description: "Insurance Plan Purchase",
            prefillName: user.full_name,
            onSuccess: async response => {
                const purchaseData = await postJson("/api/buy-insurance", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!purchaseData.success) {
                    toast(purchaseData.message || "Insurance purchase failed");
                    return;
                }

                toast("Insurance purchased successfully");
                closeModal("insuranceModal");
                loadUserInsuranceDashboard();
            }
        });
    }

    function wireDynamicActions() {
        document.addEventListener("click", event => {
            const actionButton = event.target.closest("[data-action]");

            if (actionButton) {
                const action = actionButton.dataset.action;

                if (action === "open-hospital") {
                    window.location.href = '/hosp_data.html?id=' + actionButton.dataset.id;
                }

                if (action === "book-ambulance") {
                    openAmbulanceBooking(actionButton.dataset.type, actionButton.dataset.amount, actionButton.dataset.condition);
                }

                if (action === "book-lab") {
                    openLabBooking(
                        actionButton.dataset.id,
                        actionButton.dataset.testName,
                        actionButton.dataset.amount
                    );
                }

                if (action === "buy-insurance") {
                    openInsuranceModal(
                        actionButton.dataset.id,
                        actionButton.dataset.name,
                        actionButton.dataset.claim,
                        actionButton.dataset.price
                    );
                }

                if (action === "claim-insurance") {
                    openInsuranceClaim(
                        actionButton.dataset.purchaseId,
                        actionButton.dataset.policy,
                        actionButton.dataset.coverage
                    );
                }

                if (action === "renew-insurance") {
                    openInsuranceRenewal(
                        actionButton.dataset.purchaseId,
                        actionButton.dataset.policy,
                        actionButton.dataset.premium
                    );
                }

                if (action === "buy-product") {
                    openProductModal(
                        actionButton.dataset.type,
                        actionButton.dataset.id,
                        actionButton.dataset.name,
                        actionButton.dataset.brand,
                        actionButton.dataset.price
                    );
                }

                if (action === "add-cart") {
                    addToCart({
                        type: actionButton.dataset.type,
                        id: actionButton.dataset.id,
                        name: actionButton.dataset.name,
                        brand: actionButton.dataset.brand,
                        price: Number(actionButton.dataset.price) || 0
                    });
                }
            }

            const hospitalCard = event.target.closest(".featuredHospitalCard");
            if (hospitalCard && !event.target.closest("button")) {
                window.location.href = '/hosp_data.html?id=' + hospitalCard.dataset.hospitalId;
            }
        });

        $("#medicineSearchInput")?.addEventListener("input", event => {
            renderMedicines(filterMedicines(event.target.value));
        });
    }

    async function loadFeaturedHospitals() {
        const container = $("#featuredHospitalContainer");
        renderLoading(container, "Loading hospitals...");

        try {
            const data = await apiGet("/api/featured-hospitals");
            if (!data.success || !Array.isArray(data.hospitals) || data.hospitals.length === 0) {
                renderEmpty(container, "No approved hospitals available right now.");
                return;
            }

            container.innerHTML = data.hospitals.map(hospital => {
                const facilities = listFrom(hospital.facilities).slice(0, 3);
                const image = hospital.image || FALLBACK_IMAGE;

                return `
                    <article class="featuredHospitalCard" data-hospital-id="${escapeAttr(hospital.id)}" tabindex="0">
                        <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
                            ${hospital.images && hospital.images.length > 0 
                                ? hospital.images.map(img => `<img src="${escapeAttr(img).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(img).startsWith('/') || escapeAttr(img).startsWith('http') ? escapeAttr(img) : '/uploads/' + escapeAttr(img))}" alt="${escapeAttr(hospital.hospital_name || "Hospital")}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" onerror="this.src='${FALLBACK_IMAGE}'">`).join('') 
                                : `<img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(hospital.hospital_name || "Hospital")}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" onerror="this.src='${FALLBACK_IMAGE}'">`
                            }
                        </div>
                        <div class="featuredHospitalContent">
                            <h3>${escapeHtml(hospital.hospital_name || "Hospital")}</h3>
                            <div class="hospitalLocation">
                                <i class="fa-solid fa-location-dot"></i>
                                <span>${escapeHtml(hospital.location || hospital.address || "Location not available")}</span>
                            </div>
                            <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                                    ${hospital.hospital_type ? '<span style="background: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_type) + '</span>' : ''}
                                    ${hospital.hospital_ownership ? '<span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_ownership) + '</span>' : ''}
                                </div>
                                <div class="facilityTags">
                                ${facilities.map(facility => `<span>${escapeHtml(facility)}</span>`).join("")}
                            </div>
                            <div class="hospitalBottom">
                                <div class="bedsCount">
                                    <i class="fa-solid fa-bed"></i>
                                    <span> Beds</span>
                                </div>
                                <div style="display:flex; gap:8px;"><button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button class="viewBtn" type="button" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">
                                    <i class="fa-solid fa-indian-rupee-sign"></i>
                                    <span>${escapeHtml(hospital.pricing || 0)}</span>
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Hospitals could not be loaded.");
        }
    }


    async function loadLabs() {
        const container = $("#labsContainer");
        renderLoading(container, "Loading lab tests...");

        try {
            const data = await apiGet("/api/all-labs");
            if (!data.success || !Array.isArray(data.labs) || data.labs.length === 0) {
                renderEmpty(container, "No lab tests available right now.");
                return;
            }

            container.innerHTML = data.labs.map(lab => {
                const tests = listFrom(lab.tests || lab.test);
                const testName = tests[0] || "Lab Test";
                const homeCollection = String(lab.home_coll || "").toLowerCase() === "yes" ? "Home collection" : "Lab visit";

                let pathologistsHTML = '';
                try {
                    let paths = [];
                    if (Array.isArray(lab.pathologist)) {
                        paths = lab.pathologist;
                    } else if (typeof lab.pathologist === 'string') {
                        paths = JSON.parse(lab.pathologist || '[]');
                    }
                    if (paths && paths.length > 0) {
                        pathologistsHTML = `<div class="labPathologists" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                            <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--hk-blue);">Pathologist Details</h4>
                            ${paths.map(p => `
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        ${p.image ? `<img src="/uploads/${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fa-solid fa-user-doctor" style="color: #94a3b8;"></i>`}
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 13px; color: #333;">${escapeHtml(p.name || 'Unknown')}</div>
                                        <div style="font-size: 12px; color: #666;">${escapeHtml(p.qualification || '')} ${p.experience ? `(${escapeHtml(p.experience)} exp)` : ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`;
                    }
                } catch(e) {}

                return `
                    <article class="labCard" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 20px; background: #ffffff; border-radius: 20px; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s ease;">
    <div style="display: flex; gap: 16px; align-items: center; min-width: 0;">
        <div style="width: 56px; height: 56px; border-radius: 14px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            <i class="fa-solid fa-microscope"></i>
        </div>
        <div class="labLeft" style="min-width: 0; display: flex; flex-direction: column; gap: 4px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(lab.lab_name || "Diagnostic Lab")}</h3>
            <div style="font-size: 13px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-location-dot" style="color: #94a3b8;"></i> ${escapeHtml(lab.address || "Local")}
            </div>
            <div style="font-size: 13px; color: #2563eb; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-vial"></i> ${escapeHtml(testName)}
            </div>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
        <div class="labPrice" style="font-size: 20px; font-weight: 900; color: #0f172a;">${formatMoney(lab.test_price || 0)}</div>
        <button class="bookLabBtn" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test-name="${escapeAttr(testName)}" data-amount="${escapeAttr(lab.test_price || 0)}" style="background: #1e40af; color: white; border-radius: 10px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;">
            Book Test
        </button>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Lab tests could not be loaded.");
        }
    }

    async function loadMedicines() {
        const container = $("#medicineContainer");
        renderLoading(container, "Loading medicines...");

        try {
            const data = await apiGet("/api/all-medicines");
            if (!data.success || !Array.isArray(data.medicines) || data.medicines.length === 0) {
                renderEmpty(container, "No medicines available right now.");
                return;
            }

            state.medicines = data.medicines;
            renderMedicines(state.medicines);
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medicines could not be loaded.");
        }
    }

    function renderMedicines(medicines) {
        const container = $("#medicineContainer");
        if (!container) {
            return;
        }

        if (!medicines.length) {
            renderEmpty(container, "No medicines matched your search.");
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            const image = medicine.medicine_image ? `/uploads/${medicine.medicine_image}` : FALLBACK_IMAGE;
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="medicineImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
    </div>
    <div class="medicineContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="medicineCompany" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</article>
            `;
        }).join("");
    }


    async function loadAmbulances() { 
        const container = $("#ambulanceContainer");
        if (!container) return;
        renderLoading(container, "Loading ambulances...");
        try {
            const data = await apiGet('/api/all-ambulances');
            let ambulances = [];
            if (data && data.success && Array.isArray(data.ambulances) && data.ambulances.length > 0) {
                ambulances = data.ambulances;
            } else {
                ambulances = [
                    { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500, driver_exp: "5 yrs" },
                    { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000, driver_exp: "7 yrs" },
                    { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000, driver_exp: "3 yrs" },
                    { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000, driver_exp: "8 yrs" }
                ];
            }
            
            container.innerHTML = ambulances.map(item => `
                <article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
                    <div style="padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></span>
                                <span style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">Ready for Dispatch</span>
                            </div>
                            <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2; font-family: var(--font-heading);">${escapeHtml(item.ambulance_type || "Emergency")}</h3>
                        </div>
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
                            <i class="fa-solid fa-truck-medical"></i>
                        </div>
                    </div>
                    <div style="padding: 0 24px 20px 24px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                                <i class="fa-solid fa-clock" style="color: #94a3b8;"></i> ETA: ${escapeHtml(item.eta || "10 mins")}
                            </div>
                            <div style="width: 4px; height: 4px; border-radius: 50%; background: #cbd5e1;"></div>
                            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                                <i class="fa-solid fa-location-crosshairs" style="color: #94a3b8;"></i> ${escapeHtml(item.area || "Nearby")}
                            </div>
                        </div>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">Fully equipped medical transport unit with experienced paramedics.</p>
                    </div>
                    <div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
                            <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                        </div>
                        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; width: 100%; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Book Now <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </article>
            `).join("");
        } catch(e) {
            console.error("Failed to load ambulances", e);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
    }

    async function loadEquipments() {
        const container = $("#equipmentContainer");
        renderLoading(container, "Loading equipments...");

        try {
            const data = await apiGet("/api/all-equipments");
            if (!data.success || !Array.isArray(data.equipments) || data.equipments.length === 0) {
                renderEmpty(container, "No medical equipments available right now.");
                return;
            }

            container.innerHTML = data.equipments.map(equipment => {
                const image = equipment.thumbnail_image ? `/uploads/${equipment.thumbnail_image}` : FALLBACK_IMAGE;
                const name = equipment.product_name || "Medical Equipment";
                const brand = equipment.brand_name || "No Brand";
                const price = Number(equipment.selling_price) || 0;

                return `
                    <article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medical equipments could not be loaded.");
        }
    }

        async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        const address = document.getElementById('cartDeliveryAddress')?.value.trim();
        if (!address) {
            toast("Please enter a delivery address");
            return;
        }

        const btn = document.getElementById('checkoutCartBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("cart", JSON.stringify(state.cart));
            formData.append("delivery_address", address);
            
            const pFile = document.getElementById('cartPrescription')?.files[0];
            if (pFile) {
                formData.append("prescription", pFile);
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                toast(result.message || "Checkout failed");
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }

            // Open Razorpay
            const options = {
                key: result.key,
                amount: result.amount,
                currency: "INR",
                name: "HospiKare",
                description: "Cart Checkout",
                order_id: result.razorpay_order_id,
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function(paymentResponse) {
                    const verifyData = await postJson("/api/verify-payment", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    });
                    
                    if (verifyData.success) {
                        toast("Payment Successful! Check My Orders.");
                        state.cart = [];
                        saveCart();
                        renderCart();
                        updateCartUI();
                        closeModal("cartModal");
                    } else {
                        toast(verifyData.message || "Payment Verification Failed");
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(res){
                toast("Payment Failed or Cancelled");
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast("An error occurred during checkout");
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    function wireCart() {
        $$(".js-open-cart").forEach(button => button.addEventListener("click", openCartModal));
        $("#checkoutCartBtn")?.addEventListener("click", handleCartCheckout);
        $("#clearCartBtn")?.addEventListener("click", () => {
            state.cart = [];
            saveCart();
            renderCart();
            updateCartUI();
            toast("Cart cleared");
        });

        $("#cartItems")?.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            updateCartItem(button.dataset.key, button.dataset.cartAction);
        });
    }

    function wireProductForm() {
        $("#buy_quantity")?.addEventListener("input", updateProductTotal);
        $("#productPurchaseForm")?.addEventListener("submit", handleProductPurchase);
    }

    function switchAuthTab(tab) {
        const loginTab = $("#loginTab");
        const registerTab = $("#registerTab");
        const loginForm = $("#loginForm");
        const registerForm = $("#registerForm");
        const showRegister = tab === "register";

        loginTab?.classList.toggle("activeTab", !showRegister);
        registerTab?.classList.toggle("activeTab", showRegister);
        loginForm?.classList.toggle("hiddenForm", showRegister);
        registerForm?.classList.toggle("hiddenForm", !showRegister);

        if (loginForm) {
            loginForm.style.display = showRegister ? "none" : "grid";
        }
        if (registerForm) {
            registerForm.style.display = showRegister ? "block" : "none";
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("full_name", valueOf("regName"));
        formData.append("email", valueOf("regEmail"));
        formData.append("phone", valueOf("regPhone"));
        formData.append("password", valueOf("regPassword"));
        formData.append("gender", valueOf("regGender"));
        formData.append("dob", valueOf("regDob"));
        formData.append("blood_group", valueOf("regBloodGroup"));
        formData.append("address", valueOf("regAddress"));
        formData.append("city", valueOf("regCity"));
        formData.append("state", valueOf("regState"));
        formData.append("pincode", valueOf("regPincode"));

        const photo = $("#regProfilePhoto");
        if (photo?.files?.[0]) {
            formData.append("profile_photo", photo.files[0]);
        }

        try {
            setFormBusy("registerForm", true);
            const response = await fetch("/api/product-register", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Registration failed");
                return;
            }

            const registeredEmail = valueOf("regEmail");
            toast("Registration successful. Please login.");
            $("#registerForm")?.reset();
            if ($("#loginEmail")) {
                $("#loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } catch (error) {
            console.error(error);
            toast("Registration failed. Try again.");
        } finally {
            setFormBusy("registerForm", false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            setFormBusy("loginForm", true);
            const data = await postJson("/api/product-login", {
                email: valueOf("loginEmail"),
                password: valueOf("loginPassword")
            });

            if (!data.success) {
                toast(data.message || "Login failed");
                return;
            }

            state.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            state.cart = getCart();
            updateCartUI();
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
            if (state.pendingCartItem) {
                const item = state.pendingCartItem;
                state.pendingCartItem = null;
                addToCart(item);
            }
            if (state.pendingInsurancePlan) {
                const plan = state.pendingInsurancePlan;
                state.pendingInsurancePlan = null;
                openInsuranceModal(plan.id, plan.name, plan.claim, plan.price);
            }
        } catch (error) {
            console.error(error);
            toast("Login failed. Try again.");
        } finally {
            setFormBusy("loginForm", false);
        }
    }

    async function logoutUser() {
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            await fetch('/api/product-logout', { method: 'POST', credentials: 'include' });
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("hk_user");
        localStorage.removeItem(CART_KEY);
        sessionStorage.clear();
        state.user = null;
        state.cart = [];
        updateCartUI();
        updateUserUI();
        loadUserInsuranceDashboard();
        closeModal("userProfileModal");
        closeModal("authOverlay");
        toast('Logged out successfully');
        window.location.href = '/users.html';
    }

    function updateUserUI() {
    const authOpenBtn = $("#authOpenBtn");
    const logoutBtn = $("#logoutBtn");
    const sidebarLogoutBtn = $("#sidebarLogoutBtn");
    const user = getSavedUser();
    state.user = user;

    if (authOpenBtn) {
        if (user) {
            const fName = firstName(user.full_name || user.name || "User");
            const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
            authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
authOpenBtn.style.padding = "0";
authOpenBtn.style.setProperty("background", "transparent", "important");
        } else {
            authOpenBtn.innerHTML = "Login / Portal";
            authOpenBtn.style.padding = "";
            authOpenBtn.style.removeProperty("background");
        }
    }
    
    if (logoutBtn) {
        logoutBtn.hidden = !user;
        if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
    }
    
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.hidden = !user;
    }

    // Only show My Orders / Activity when logged in
    $$(".myOrdersLink, #navMyOrders, #sidebarMyOrders, #mobileBottomMyOrders").forEach(el => {
        el.style.display = user ? "" : "none";
    });
}

async function handleAmbulanceBooking(event) {
        event.preventDefault();
        
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            ambulance_id: state.selectedAmbulanceId,
            patient_name: valueOf("patient_name"),
            patient_condition: valueOf("patient_condition"),
            pickup_address: valueOf("pickup_address"),
            destination_address: valueOf("destination_address"),
            booking_date: valueOf("booking_date"),
            total_amount: state.selectedAmbulanceAmount
        };

        await payAndRun({
            amount: state.selectedAmbulanceAmount,
            name: "HospiKare Ambulance",
            description: "Ambulance Booking Payment",
            prefillName: formData.patient_name,
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-ambulance", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Ambulance booking failed");
                    return;
                }

                toast("Payment successful and ambulance dispatched!");
                closeModal("ambulanceBookingModal");
                const form = document.getElementById("ambulanceBookingForm");
                if (form) form.reset();
                
                if (bookingData.tracking_token) {
                    setTimeout(() => {
                        window.location.href = '/user-tracking.html?token=' + bookingData.tracking_token;
                    }, 1500);
                }
            }
        });
    }

    function openLabBooking(labId, testName, amount) {
        const user = requireUser();
        if (!user) return;

        state.selectedLabId = labId;
        state.selectedTestName = testName || 'Lab Test';
        state.selectedLabAmount = Number(amount) || 500;
        
        const testNameInput = document.getElementById("lab_test_name");
        if (testNameInput) {
            testNameInput.value = state.selectedTestName;
        }

        setText("labTestAmount", formatMoney(state.selectedLabAmount));
        
        const labPayingNowDisplay = document.getElementById('labPayingNowDisplay');
        const labRemainingDisplay = document.getElementById('labRemainingDisplay');
        if(labPayingNowDisplay) labPayingNowDisplay.innerText = formatMoney(state.selectedLabAmount);
        if(labRemainingDisplay) labRemainingDisplay.innerText = 'Rs. 0';
        
        // Reset part payment section
        const labPartPaymentSection = document.getElementById('labPartPaymentSection');
        if(labPartPaymentSection) labPartPaymentSection.style.display = 'none';
        
        const fullRadio = document.querySelector('input[name="labPaymentType"][value="full"]');
        if(fullRadio) fullRadio.checked = true;

        openModal("labBookingModal");
    }

    // Lab Payment Type Logic
    (function() {
        const labPaymentTypeRadios = document.querySelectorAll('input[name="labPaymentType"]');
        const labPartPaymentSection = document.getElementById('labPartPaymentSection');
        const labPartPayAmountInput = document.getElementById('labPartPayAmount');
        const labPartPayError = document.getElementById('labPartPayError');
        const labPayingNowDisplay = document.getElementById('labPayingNowDisplay');
        const labRemainingDisplay = document.getElementById('labRemainingDisplay');
        const labTestAmountDisplay = document.getElementById('labTestAmount');

        if (labPaymentTypeRadios) {
            labPaymentTypeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'part') {
                        if (labPartPaymentSection) labPartPaymentSection.style.display = 'block';
                        if (labPartPayAmountInput) labPartPayAmountInput.value = '';
                        if (labPayingNowDisplay) labPayingNowDisplay.innerText = '\u20b90';
                        if (labRemainingDisplay && labTestAmountDisplay) labRemainingDisplay.innerText = labTestAmountDisplay.innerText;
                    } else {
                        if (labPartPaymentSection) labPartPaymentSection.style.display = 'none';
                        if (labPartPayError) labPartPayError.style.display = 'none';
                    }
                });
            });
        }

        if (labPartPayAmountInput) {
            labPartPayAmountInput.addEventListener('input', function() {
                const total = Number((labTestAmountDisplay ? labTestAmountDisplay.innerText : '0').replace(/[^0-9]/g, ''));
                const entered = Number(this.value) || 0;
                const minRequired = Math.ceil(total / 2);
                
                if (entered > 0 && entered < minRequired) {
                    if (labPartPayError) { labPartPayError.style.display = 'block'; labPartPayError.innerText = 'Minimum ' + minRequired + ' (50% of total) is required'; }
                } else if (entered > total) {
                    if (labPartPayError) { labPartPayError.style.display = 'block'; labPartPayError.innerText = 'Amount cannot exceed total ' + total; }
                } else {
                    if (labPartPayError) labPartPayError.style.display = 'none';
                }
                
                if (labPayingNowDisplay) labPayingNowDisplay.innerText = '\u20b9' + entered;
                if (labRemainingDisplay) labRemainingDisplay.innerText = '\u20b9' + Math.max(0, total - entered);
            });
        }
})();

    async function handleLabBooking(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) return;

        const fullTotal = state.selectedLabAmount || 500;
        let amount = fullTotal;
        const selectedPayType = document.querySelector('input[name="labPaymentType"]:checked')?.value || 'full';
        
        if (selectedPayType === 'part') {
            const partVal = Number(document.getElementById('labPartPayAmount')?.value || 0);
            const minRequired = Math.ceil(fullTotal / 2);
            if (partVal < minRequired) {
                toast('Minimum payment is \u20b9' + minRequired + ' (50% of total amount)');
                return;
            }
            if (partVal > fullTotal) {
                toast('Payment amount cannot exceed total amount');
                return;
            }
            amount = partVal;
        }

        await payAndRun({
            amount: amount,
            name: "HospiKare Lab Booking",
            description: "Lab Test Payment (" + (selectedPayType === 'part' ? 'Part' : 'Full') + ")",
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-lab-test", {
                    user_id: user.id,
                    lab_vendor_id: state.selectedLabId,
                    test_name: state.selectedTestName,
                    patient_name: valueOf("lab_patient_name"),
                    sample_collection_type: valueOf("sample_collection_type"),
                    booking_date: valueOf("lab_booking_date"),
                    total_amount: fullTotal,
                    paid_amount: amount,
                    payment_type: selectedPayType,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Lab booking failed");
                    return;
                }

                toast("Lab test booked successfully!");
                closeModal("labBookingModal");
                $("#labBookingForm")?.reset();
                
                // Reset part payment UI
                if (document.getElementById('labPartPaymentSection')) {
                    document.getElementById('labPartPaymentSection').style.display = 'none';
                }
                const fullRadio = document.querySelector('input[name="labPaymentType"][value="full"]');
                if (fullRadio) fullRadio.checked = true;
            }
        });
    }

    window.openInsuranceModal = function(id, name, claim, price) {
        if (!requireUser()) {
            state.pendingInsurancePlan = { id, name, claim, price };
            return;
        }

        state.selectedInsuranceId = id;
        state.selectedInsurancePlan = name || "Insurance Plan";
        state.selectedInsuranceBasePrice = parseMoney(price);
        state.selectedInsuranceAmount = state.selectedInsuranceBasePrice;

        document.getElementById('insurance_plan_name').value = name;
        document.getElementById('insurance_claim_price').value = claim;
        document.getElementById('insurance_price').value = price;
        document.getElementById('insurance_duration').value = '1';
        document.getElementById('insuranceTotalAmount').textContent = formatMoney(state.selectedInsuranceBasePrice);
        
        const form = document.getElementById('insurancePurchaseForm');
        if(form) form.dataset.planId = id;
        
        openModal("insuranceModal");
    };

    $("#insurance_duration")?.addEventListener("change", function () {
        state.selectedInsuranceAmount = calculateInsurancePremium(
            state.selectedInsuranceBasePrice,
            this.value
        );
        setText("insuranceTotalAmount", formatMoney(state.selectedInsuranceAmount));
    });

    async function handleInsurancePurchase(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            insurance_vendor_id: state.selectedInsuranceId,
            plan_name: state.selectedInsurancePlan,
            premium_amount: state.selectedInsuranceAmount,
            plan_duration: valueOf("insurance_duration")
        };

        await payAndRun({
            amount: state.selectedInsuranceAmount,
            name: "HospiKare Insurance",
            description: "Insurance Plan Purchase",
            prefillName: user.full_name,
            onSuccess: async response => {
                const purchaseData = await postJson("/api/buy-insurance", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!purchaseData.success) {
                    toast(purchaseData.message || "Insurance purchase failed");
                    return;
                }

                toast("Insurance purchased successfully");
                closeModal("insuranceModal");
                loadUserInsuranceDashboard();
                loadInsurances();
            }
        });
    }

    function wireDynamicActions() {
        document.addEventListener("click", event => {
            const actionButton = event.target.closest("[data-action]");

            if (actionButton) {
                const action = actionButton.dataset.action;

                if (action === "open-login") {
                    showAuthModal();
                    return;
                }

                if (action === "open-hospital") {
                    window.location.href = '/hosp_data.html?id=' + actionButton.dataset.id;
                }

                if (action === "book-ambulance") {
                    openAmbulanceBooking(actionButton.dataset.type, actionButton.dataset.amount, actionButton.dataset.condition);
                }

                if (action === "book-lab") {
                    openLabBooking(
                        actionButton.dataset.id,
                        actionButton.dataset.testName,
                        actionButton.dataset.amount
                    );
                }

                if (action === "buy-insurance") {
                    openInsuranceModal(
                        actionButton.dataset.id,
                        actionButton.dataset.name,
                        actionButton.dataset.claim,
                        actionButton.dataset.price
                    );
                }

                if (action === "claim-insurance") {
                    openInsuranceClaim(
                        actionButton.dataset.purchaseId,
                        actionButton.dataset.policy,
                        actionButton.dataset.coverage
                    );
                }

                if (action === "renew-insurance") {
                    openInsuranceRenewal(
                        actionButton.dataset.purchaseId,
                        actionButton.dataset.policy,
                        actionButton.dataset.premium
                    );
                }

                if (action === "buy-product") {
                    openProductModal(
                        actionButton.dataset.type,
                        actionButton.dataset.id,
                        actionButton.dataset.name,
                        actionButton.dataset.brand,
                        actionButton.dataset.price
                    );
                }

                if (action === "add-cart") {
                    addToCart({
                        type: actionButton.dataset.type,
                        id: actionButton.dataset.id,
                        name: actionButton.dataset.name,
                        brand: actionButton.dataset.brand,
                        price: Number(actionButton.dataset.price) || 0
                    });
                }
            }

            const hospitalCard = event.target.closest(".featuredHospitalCard");
            if (hospitalCard && !event.target.closest("button")) {
                window.location.href = '/hosp_data.html?id=' + hospitalCard.dataset.hospitalId;
            }
        });

        $("#medicineSearchInput")?.addEventListener("input", event => {
            renderMedicines(filterMedicines(event.target.value));
        });
    }

    async function loadFeaturedHospitals() {
        const container = $("#featuredHospitalContainer");
        renderLoading(container, "Loading hospitals...");

        try {
            const data = await apiGet("/api/featured-hospitals");
            if (!data.success || !Array.isArray(data.hospitals) || data.hospitals.length === 0) {
                renderEmpty(container, "No approved hospitals available right now.");
                return;
            }

            container.innerHTML = data.hospitals.map(hospital => {
                const facilities = listFrom(hospital.facilities).slice(0, 3);
                const image = hospital.image || FALLBACK_IMAGE;

                return `
                    <article class="featuredHospitalCard" data-hospital-id="${escapeAttr(hospital.id)}" tabindex="0">
                        <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none;">
                            ${hospital.images && hospital.images.length > 0 
                                ? hospital.images.map(img => `<img src="${escapeAttr(img).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(img).startsWith('/') || escapeAttr(img).startsWith('http') ? escapeAttr(img) : '/uploads/' + escapeAttr(img))}" alt="${escapeAttr(hospital.hospital_name || "Hospital")}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" onerror="this.src='${FALLBACK_IMAGE}'">`).join('') 
                                : `<img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(hospital.hospital_name || "Hospital")}" style="flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start;" onerror="this.src='${FALLBACK_IMAGE}'">`
                            }
                        </div>
                        <div class="featuredHospitalContent">
                            <h3>${escapeHtml(hospital.hospital_name || "Hospital")}</h3>
                            <div class="hospitalLocation">
                                <i class="fa-solid fa-location-dot"></i>
                                <span>${escapeHtml(hospital.location || hospital.address || "Location not available")}</span>
                            </div>
                            <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                                    ${hospital.hospital_type ? '<span style="background: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_type) + '</span>' : ''}
                                    ${hospital.hospital_ownership ? '<span style="background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 4px;">' + escapeHtml(hospital.hospital_ownership) + '</span>' : ''}
                                </div>
                                <div class="facilityTags">
                                ${facilities.map(facility => `<span>${escapeHtml(facility)}</span>`).join("")}
                            </div>
                            <div class="hospitalBottom">
                                <div class="bedsCount">
                                    <i class="fa-solid fa-bed"></i>
                                    <span> Beds</span>
                                </div>
                                <div style="display:flex; gap:8px;"><button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button class="viewBtn" type="button" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">
                                    <i class="fa-solid fa-indian-rupee-sign"></i>
                                    <span>${escapeHtml(hospital.pricing || 0)}</span>
                                </button>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Hospitals could not be loaded.");
        }
    }


    async function loadLabs() {
        const container = $("#labsContainer");
        renderLoading(container, "Loading lab tests...");

        try {
            const data = await apiGet("/api/all-labs");
            if (!data.success || !Array.isArray(data.labs) || data.labs.length === 0) {
                renderEmpty(container, "No lab tests available right now.");
                return;
            }

            container.innerHTML = data.labs.map(lab => {
                const tests = listFrom(lab.tests || lab.test);
                const testName = tests[0] || "Lab Test";
                const homeCollection = String(lab.home_coll || "").toLowerCase() === "yes" ? "Home collection" : "Lab visit";

                let pathologistsHTML = '';
                try {
                    let paths = [];
                    if (Array.isArray(lab.pathologist)) {
                        paths = lab.pathologist;
                    } else if (typeof lab.pathologist === 'string') {
                        paths = JSON.parse(lab.pathologist || '[]');
                    }
                    if (paths && paths.length > 0) {
                        pathologistsHTML = `<div class="labPathologists" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                            <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--hk-blue);">Pathologist Details</h4>
                            ${paths.map(p => `
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        ${p.image ? `<img src="/uploads/${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fa-solid fa-user-doctor" style="color: #94a3b8;"></i>`}
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 13px; color: #333;">${escapeHtml(p.name || 'Unknown')}</div>
                                        <div style="font-size: 12px; color: #666;">${escapeHtml(p.qualification || '')} ${p.experience ? `(${escapeHtml(p.experience)} exp)` : ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`;
                    }
                } catch(e) {}

                return `
                    <article class="labCard" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 20px; background: #ffffff; border-radius: 20px; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s ease;">
    <div style="display: flex; gap: 16px; align-items: center; min-width: 0;">
        <div style="width: 56px; height: 56px; border-radius: 14px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            <i class="fa-solid fa-microscope"></i>
        </div>
        <div class="labLeft" style="min-width: 0; display: flex; flex-direction: column; gap: 4px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(lab.lab_name || "Diagnostic Lab")}</h3>
            <div style="font-size: 13px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-location-dot" style="color: #94a3b8;"></i> ${escapeHtml(lab.address || "Local")}
            </div>
            <div style="font-size: 13px; color: #2563eb; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-vial"></i> ${escapeHtml(testName)}
            </div>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;">
        <div class="labPrice" style="font-size: 20px; font-weight: 900; color: #0f172a;">${formatMoney(lab.test_price || 0)}</div>
        <button class="bookLabBtn" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test-name="${escapeAttr(testName)}" data-amount="${escapeAttr(lab.test_price || 0)}" style="background: #1e40af; color: white; border-radius: 10px; padding: 0 16px; height: 36px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;">
            Book Test
        </button>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Lab tests could not be loaded.");
        }
    }

    async function loadInsurances() {
        const container = $("#insuranceContainer");
        if (!container) return;
        renderLoading(container, "Loading insurance plans...");

        try {
            const currentUser = getSavedUser();
            let userPolicies = [];
            let userClaims = [];

            if (currentUser) {
                try {
                    const userIdParam = currentUser && currentUser.id ? `?user_id=${currentUser.id}` : "";
                    const [policiesRes, claimsRes] = await Promise.all([
                        apiGet(`/api/user/insurance-policies${userIdParam}`),
                        apiGet(`/api/user/insurance-claims${userIdParam}`)
                    ]);
                    if (policiesRes && policiesRes.success && Array.isArray(policiesRes.policies)) {
                        userPolicies = policiesRes.policies;
                    }
                    if (claimsRes && claimsRes.success && Array.isArray(claimsRes.claims)) {
                        userClaims = claimsRes.claims;
                    }
                } catch (e) {
                    console.error("Could not fetch user policies/claims for insurance cards:", e);
                }
            }

            const data = await apiGet("/api/all-insurances");
            if (!data.success || !Array.isArray(data.insurances) || data.insurances.length === 0) {
                renderEmpty(container, "No insurance plans available right now.");
                return;
            }

            container.innerHTML = data.insurances.map((insurance, index) => {
                // Check if user already purchased this plan
                const purchasedPolicy = userPolicies.find(p => 
                    (p.insurance_vendor_id && Number(p.insurance_vendor_id) === Number(insurance.id)) ||
                    (p.plan_name && insurance.comp_name && p.plan_name.toLowerCase().trim() === insurance.comp_name.toLowerCase().trim())
                );

                const isPurchased = !!purchasedPolicy && String(purchasedPolicy.insurance_status || "active").toLowerCase() === "active";

                // If purchased, filter its claims
                const cardClaims = isPurchased ? userClaims.filter(c => 
                    (c.insurance_purchase_id && Number(c.insurance_purchase_id) === Number(purchasedPolicy.id)) ||
                    (c.policy_number && purchasedPolicy.policy_number && String(c.policy_number).trim() === String(purchasedPolicy.policy_number).trim())
                ) : [];

                return `
                    <article class="insuranceCard ${index === 1 && !isPurchased ? "popularPlan" : ""}" style="display: flex; flex-direction: column; padding: 24px; background: #ffffff; border-radius: 20px; box-shadow: ${isPurchased ? "0 8px 24px rgba(16, 185, 129, 0.12)" : "0 4px 12px rgba(0,0,0,0.03)"}; border: ${isPurchased ? "2px solid #10b981" : "1px solid #e2e8f0"}; position: relative; color: #0f172a; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                        ${isPurchased 
                            ? `<div style="position: absolute; top: 0; left: 0; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; display: flex; align-items: center; gap: 5px;">
                                <i class="fa-solid fa-circle-check"></i> Active Policy &bull; ${escapeHtml(purchasedPolicy.policy_number || 'POL-' + purchasedPolicy.id)}
                               </div>` 
                            : (index === 1 ? `<div style="position: absolute; top: 0; right: 0; background: linear-gradient(135deg, #ef4444, #e8174a); color: white; font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 0 20px 0 16px; text-transform: uppercase; letter-spacing: 1px;">Most Popular</div>` : "")
                        }
                        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(37,99,235,0.04); border-radius: 50%;"></div>
                        
                        <div style="font-size: 12px; color: #3b82f6; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; ${isPurchased ? "margin-top: 14px;" : ""}">${escapeHtml(insurance.comp_type || "Health Cover")}</div>
                        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.2;">${escapeHtml(insurance.comp_name || "Insurance Plan")}</h3>
                        
                        <div class="insurancePrice" style="font-size: 26px; font-weight: 900; color: #1e293b; margin-bottom: 12px; letter-spacing: -0.5px;">${formatMoney(insurance.claim_price || insurance.ins_price)}</div>
                        
                        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 16px;">${escapeHtml(insurance.description || "Coverage details available with the provider.")}</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Claim Type</span>
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.claim_type || "N/A")}</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Claim Time</span>
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.claim_time || "N/A")}</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">IRDAI</span>
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.irdai || "N/A")}</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Support</span>
                                <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(insurance.cust_sup_num || "N/A")}</span>
                            </div>
                        </div>

                        ${isPurchased ? `
                            <!-- Active Policy Badge & Quick Info -->
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="color: #166534; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Valid Until</span>
                                    <div style="font-weight: 800; color: #14532d;">${formatDate(purchasedPolicy.expiry_date)}</div>
                                </div>
                                <div style="text-align: right;">
                                    <span style="color: #166534; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Claims</span>
                                    <div style="font-weight: 800; color: #16a34a;">${cardClaims.length} Filed</div>
                                </div>
                            </div>

                            <!-- Store data for catalog policy modal -->
                            ${(() => {
                                window._catalogPoliciesData = window._catalogPoliciesData || {};
                                window._catalogPoliciesData[purchasedPolicy.id] = {
                                    policy: purchasedPolicy,
                                    policyClaims: cardClaims,
                                    policyName: purchasedPolicy.plan_name || insurance.comp_name || "Health Insurance Policy",
                                    premium: parseMoney(purchasedPolicy.premium_amount || insurance.ins_price),
                                    coverage: parseMoney(purchasedPolicy.coverage_amount || insurance.claim_price),
                                    status: String(purchasedPolicy.insurance_status || "active").toLowerCase(),
                                    isActive: true
                                };
                                return '';
                            })()}

                            <!-- Action Buttons for Purchased Policy -->
                            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: auto;">
                                <button type="button" onclick="window._openCatalogPolicyModal(${purchasedPolicy.id})" style="width: 100%; height: 38px; border-radius: 8px; font-size: 13px; font-weight: 700; background: #2563eb; color: #fff; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <i class="fa-solid fa-eye"></i> View Claims & Details
                                </button>
                                <div style="display: flex; gap: 8px; width: 100%;">
                                    <button class="btn btn-primary" type="button" data-action="claim-insurance" data-purchase-id="${escapeAttr(purchasedPolicy.id)}" data-policy="${escapeAttr(purchasedPolicy.plan_name || insurance.comp_name)}" data-coverage="${escapeAttr(purchasedPolicy.coverage_amount || insurance.claim_price)}" style="flex: 1; height: 36px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                        <i class="fa-solid fa-file-medical"></i> File Claim
                                    </button>
                                    <button class="btn btn-outline-blue" type="button" data-action="renew-insurance" data-purchase-id="${escapeAttr(purchasedPolicy.id)}" data-policy="${escapeAttr(purchasedPolicy.plan_name || insurance.comp_name)}" data-premium="${escapeAttr(purchasedPolicy.premium_amount || insurance.ins_price)}" style="height: 36px; padding: 0 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                        <i class="fa-solid fa-arrows-rotate"></i> Renew
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <!-- Buy Plan Button for Unpurchased Policy -->
                            <button class="buyPlanBtn" type="button" data-action="buy-insurance" data-id="${escapeAttr(insurance.id)}" data-name="${escapeAttr(insurance.comp_name || "Insurance Plan")}" data-claim="${escapeAttr(parseMoney(insurance.claim_price))}" data-price="${escapeAttr(parseMoney(insurance.ins_price))}" style="width: 100%; border-radius: 12px; height: 48px; min-height: 48px; max-height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; flex: none; display: flex; align-items: center; justify-content: center; margin-top: auto;">
                                Buy Plan
                            </button>
                        `}
                    </article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Insurance plans could not be loaded.");
        }
    }

    async function loadMedicines() {
        const container = $("#medicineContainer");
        renderLoading(container, "Loading medicines...");

        try {
            const data = await apiGet("/api/all-medicines");
            if (!data.success || !Array.isArray(data.medicines) || data.medicines.length === 0) {
                renderEmpty(container, "No medicines available right now.");
                return;
            }

            state.medicines = data.medicines;
            renderMedicines(state.medicines);
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medicines could not be loaded.");
        }
    }

    function renderMedicines(medicines) {
        const container = $("#medicineContainer");
        if (!container) {
            return;
        }

        if (!medicines.length) {
            renderEmpty(container, "No medicines matched your search.");
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            let image = FALLBACK_IMAGE;
            if (medicine.medicine_image && typeof medicine.medicine_image === 'string') {
                const imgStr = medicine.medicine_image.trim();
                if (imgStr && !imgStr.includes('fakepath') && !imgStr.includes('[object')) {
                    if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
                        image = imgStr;
                    } else if (imgStr.startsWith('/')) {
                        image = imgStr;
                    } else {
                        image = '/uploads/' + imgStr.replace(/^uploads[\\\/]/, '');
                    }
                }
            }
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="medicineImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image)}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
    </div>
    <div class="medicineContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="medicineCompany" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</article>
            `;
        }).join("");
    }

    async function loadEquipments() {
        const container = $("#equipmentContainer");
        renderLoading(container, "Loading equipments...");

        try {
            const data = await apiGet("/api/all-equipments");
            if (!data.success || !Array.isArray(data.equipments) || data.equipments.length === 0) {
                renderEmpty(container, "No medical equipments available right now.");
                return;
            }

            container.innerHTML = data.equipments.map(equipment => {
                const image = equipment.thumbnail_image ? `/uploads/${equipment.thumbnail_image}` : FALLBACK_IMAGE;
                const name = equipment.product_name || "Medical Equipment";
                const brand = equipment.brand_name || "No Brand";
                const price = Number(equipment.selling_price) || 0;

                return `
                    <article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medical equipments could not be loaded.");
        }
    }

        async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        const address = document.getElementById('cartDeliveryAddress')?.value.trim();
        if (!address) {
            toast("Please enter a delivery address");
            return;
        }

        const btn = document.getElementById('checkoutCartBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("cart", JSON.stringify(state.cart));
            formData.append("delivery_address", address);
            
            const pFile = document.getElementById('cartPrescription')?.files[0];
            if (pFile) {
                formData.append("prescription", pFile);
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                toast(result.message || "Checkout failed");
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }

            // Open Razorpay
            const options = {
                key: result.key,
                amount: result.amount,
                currency: "INR",
                name: "HospiKare",
                description: "Cart Checkout",
                order_id: result.razorpay_order_id,
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function(paymentResponse) {
                    const verifyData = await postJson("/api/verify-payment", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    });
                    
                    if (verifyData.success) {
                        toast("Payment Successful! Check My Orders.");
                        state.cart = [];
                        saveCart();
                        renderCart();
                        updateCartUI();
                        closeModal("cartModal");
                    } else {
                        toast(verifyData.message || "Payment Verification Failed");
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(res){
                toast("Payment Failed or Cancelled");
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast("An error occurred during checkout");
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    function wireCart() {
        $$(".js-open-cart").forEach(button => button.addEventListener("click", openCartModal));
        $("#checkoutCartBtn")?.addEventListener("click", handleCartCheckout);
        $("#clearCartBtn")?.addEventListener("click", () => {
            state.cart = [];
            saveCart();
            renderCart();
            updateCartUI();
            toast("Cart cleared");
        });

        $("#cartItems")?.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            updateCartItem(button.dataset.key, button.dataset.cartAction);
        });
    }

    function wireProductForm() {
        $("#buy_quantity")?.addEventListener("input", updateProductTotal);
        $("#productPurchaseForm")?.addEventListener("submit", handleProductPurchase);
    }

    function switchAuthTab(tab) {
        const loginTab = $("#loginTab");
        const registerTab = $("#registerTab");
        const loginForm = $("#loginForm");
        const registerForm = $("#registerForm");
        const showRegister = tab === "register";

        loginTab?.classList.toggle("activeTab", !showRegister);
        registerTab?.classList.toggle("activeTab", showRegister);
        loginForm?.classList.toggle("hiddenForm", showRegister);
        registerForm?.classList.toggle("hiddenForm", !showRegister);

        if (loginForm) {
            loginForm.style.display = showRegister ? "none" : "grid";
        }
        if (registerForm) {
            registerForm.style.display = showRegister ? "block" : "none";
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("full_name", valueOf("regName"));
        formData.append("email", valueOf("regEmail"));
        formData.append("phone", valueOf("regPhone"));
        formData.append("password", valueOf("regPassword"));
        formData.append("gender", valueOf("regGender"));
        formData.append("dob", valueOf("regDob"));
        formData.append("blood_group", valueOf("regBloodGroup"));
        formData.append("address", valueOf("regAddress"));
        formData.append("city", valueOf("regCity"));
        formData.append("state", valueOf("regState"));
        formData.append("pincode", valueOf("regPincode"));

        const photo = $("#regProfilePhoto");
        if (photo?.files?.[0]) {
            formData.append("profile_photo", photo.files[0]);
        }

        try {
            setFormBusy("registerForm", true);
            const response = await fetch("/api/product-register", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Registration failed");
                return;
            }

            const registeredEmail = valueOf("regEmail");
            toast("Registration successful. Please login.");
            $("#registerForm")?.reset();
            if ($("#loginEmail")) {
                $("#loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } catch (error) {
            console.error(error);
            toast("Registration failed. Try again.");
        } finally {
            setFormBusy("registerForm", false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            setFormBusy("loginForm", true);
            const data = await postJson("/api/product-login", {
                email: valueOf("loginEmail"),
                password: valueOf("loginPassword")
            });

            if (!data.success) {
                toast(data.message || "Login failed");
                return;
            }

            state.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            state.cart = getCart();
            updateCartUI();
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
            if (state.pendingCartItem) {
                const item = state.pendingCartItem;
                state.pendingCartItem = null;
                addToCart(item);
            }
            if (state.pendingInsurancePlan) {
                const plan = state.pendingInsurancePlan;
                state.pendingInsurancePlan = null;
                openInsuranceModal(plan.id, plan.name, plan.claim, plan.price);
            }
        } catch (error) {
            console.error(error);
            toast("Login failed. Try again.");
        } finally {
            setFormBusy("loginForm", false);
        }
    }

    async function logoutUser() {
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            await fetch('/api/product-logout', { method: 'POST', credentials: 'include' });
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("hk_user");
        localStorage.removeItem(CART_KEY);
        sessionStorage.clear();
        state.user = null;
        state.cart = [];
        updateCartUI();
        updateUserUI();
        loadUserInsuranceDashboard();
        closeModal("userProfileModal");
        closeModal("authOverlay");
        toast('Logged out successfully');
        window.location.href = '/users.html';
    }

    function updateUserUI() {
        const authOpenBtn = $("#authOpenBtn");
        const logoutBtn = $("#logoutBtn");
        const sidebarLogoutBtn = $("#sidebarLogoutBtn");
        const user = getSavedUser();
        state.user = user;

        if (authOpenBtn) {
            if (user) {
                const fName = firstName(user.full_name || user.name || "User");
                const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
                authOpenBtn.style.padding = "0";
                authOpenBtn.style.setProperty("background", "transparent", "important");
            } else {
                authOpenBtn.innerHTML = "Login / Portal";
                authOpenBtn.style.padding = "";
                authOpenBtn.style.removeProperty("background");
            }
        }
        if (logoutBtn) {
            logoutBtn.hidden = !user;
            if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.hidden = !user;
        }

        // Only show My Orders / Activity when logged in
        $$(".myOrdersLink, #navMyOrders, #sidebarMyOrders, #mobileBottomMyOrders").forEach(el => {
            el.style.display = user ? "" : "none";
        });
    }

    
    async function loadMedicines() {
        const container = $("#medicineContainer");
        renderLoading(container, "Loading medicines...");

        try {
            const data = await apiGet("/api/all-medicines");
            if (!data.success || !Array.isArray(data.medicines) || data.medicines.length === 0) {
                renderEmpty(container, "No medicines available right now.");
                return;
            }

            state.medicines = data.medicines;
            renderMedicines(state.medicines);
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medicines could not be loaded.");
        }
    }

    function renderMedicines(medicines) {
        const container = $("#medicineContainer");
        if (!container) {
            return;
        }

        if (!medicines.length) {
            renderEmpty(container, "No medicines matched your search.");
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            const image = medicine.medicine_image ? `/uploads/${medicine.medicine_image}` : FALLBACK_IMAGE;
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="medicineImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
    </div>
    <div class="medicineContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="medicineCompany" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</article>
            `;
        }).join("");
    }

    async function loadEquipments() {
        const container = $("#equipmentContainer");
        renderLoading(container, "Loading equipments...");

        try {
            const data = await apiGet("/api/all-equipments");
            if (!data.success || !Array.isArray(data.equipments) || data.equipments.length === 0) {
                renderEmpty(container, "No medical equipments available right now.");
                return;
            }

            container.innerHTML = data.equipments.map(equipment => {
                const image = equipment.thumbnail_image ? `/uploads/${equipment.thumbnail_image}` : FALLBACK_IMAGE;
                const name = equipment.product_name || "Medical Equipment";
                const brand = equipment.brand_name || "No Brand";
                const price = Number(equipment.selling_price) || 0;

                return `
                    <article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medical equipments could not be loaded.");
        }
    }

        async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        const address = document.getElementById('cartDeliveryAddress')?.value.trim();
        if (!address) {
            toast("Please enter a delivery address");
            return;
        }

        const btn = document.getElementById('checkoutCartBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("cart", JSON.stringify(state.cart));
            formData.append("delivery_address", address);
            
            const pFile = document.getElementById('cartPrescription')?.files[0];
            if (pFile) {
                formData.append("prescription", pFile);
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                toast(result.message || "Checkout failed");
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }

            // Open Razorpay
            const options = {
                key: result.key,
                amount: result.amount,
                currency: "INR",
                name: "HospiKare",
                description: "Cart Checkout",
                order_id: result.razorpay_order_id,
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function(paymentResponse) {
                    const verifyData = await postJson("/api/verify-payment", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    });
                    
                    if (verifyData.success) {
                        toast("Payment Successful! Check My Orders.");
                        state.cart = [];
                        saveCart();
                        renderCart();
                        updateCartUI();
                        closeModal("cartModal");
                    } else {
                        toast(verifyData.message || "Payment Verification Failed");
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(res){
                toast("Payment Failed or Cancelled");
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast("An error occurred during checkout");
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    function wireCart() {
        $$(".js-open-cart").forEach(button => button.addEventListener("click", openCartModal));
        $("#checkoutCartBtn")?.addEventListener("click", handleCartCheckout);
        $("#clearCartBtn")?.addEventListener("click", () => {
            state.cart = [];
            saveCart();
            renderCart();
            updateCartUI();
            toast("Cart cleared");
        });

        $("#cartItems")?.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            updateCartItem(button.dataset.key, button.dataset.cartAction);
        });
    }

    function wireProductForm() {
        $("#buy_quantity")?.addEventListener("input", updateProductTotal);
        $("#productPurchaseForm")?.addEventListener("submit", handleProductPurchase);
    }

    function switchAuthTab(tab) {
        const loginTab = $("#loginTab");
        const registerTab = $("#registerTab");
        const loginForm = $("#loginForm");
        const registerForm = $("#registerForm");
        const showRegister = tab === "register";

        loginTab?.classList.toggle("activeTab", !showRegister);
        registerTab?.classList.toggle("activeTab", showRegister);
        loginForm?.classList.toggle("hiddenForm", showRegister);
        registerForm?.classList.toggle("hiddenForm", !showRegister);

        if (loginForm) {
            loginForm.style.display = showRegister ? "none" : "grid";
        }
        if (registerForm) {
            registerForm.style.display = showRegister ? "block" : "none";
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("full_name", valueOf("regName"));
        formData.append("email", valueOf("regEmail"));
        formData.append("phone", valueOf("regPhone"));
        formData.append("password", valueOf("regPassword"));
        formData.append("gender", valueOf("regGender"));
        formData.append("dob", valueOf("regDob"));
        formData.append("blood_group", valueOf("regBloodGroup"));
        formData.append("address", valueOf("regAddress"));
        formData.append("city", valueOf("regCity"));
        formData.append("state", valueOf("regState"));
        formData.append("pincode", valueOf("regPincode"));

        const photo = $("#regProfilePhoto");
        if (photo?.files?.[0]) {
            formData.append("profile_photo", photo.files[0]);
        }

        try {
            setFormBusy("registerForm", true);
            const response = await fetch("/api/product-register", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Registration failed");
                return;
            }

            const registeredEmail = valueOf("regEmail");
            toast("Registration successful. Please login.");
            $("#registerForm")?.reset();
            if ($("#loginEmail")) {
                $("#loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } catch (error) {
            console.error(error);
            toast("Registration failed. Try again.");
        } finally {
            setFormBusy("registerForm", false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            setFormBusy("loginForm", true);
            const data = await postJson("/api/product-login", {
                email: valueOf("loginEmail"),
                password: valueOf("loginPassword")
            });

            if (!data.success) {
                toast(data.message || "Login failed");
                return;
            }

            state.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            state.cart = getCart();
            updateCartUI();
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
            if (state.pendingCartItem) {
                const item = state.pendingCartItem;
                state.pendingCartItem = null;
                addToCart(item);
            }
            if (state.pendingInsurancePlan) {
                const plan = state.pendingInsurancePlan;
                state.pendingInsurancePlan = null;
                openInsuranceModal(plan.id, plan.name, plan.claim, plan.price);
            }
        } catch (error) {
            console.error(error);
            toast("Login failed. Try again.");
        } finally {
            setFormBusy("loginForm", false);
        }
    }

    async function logoutUser() {
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            await fetch('/api/product-logout', { method: 'POST', credentials: 'include' });
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("hk_user");
        localStorage.removeItem(CART_KEY);
        sessionStorage.clear();
        state.user = null;
        state.cart = [];
        updateCartUI();
        updateUserUI();
        loadUserInsuranceDashboard();
        closeModal("userProfileModal");
        closeModal("authOverlay");
        toast('Logged out successfully');
        window.location.href = '/users.html';
    }

    function updateUserUI() {
        const authOpenBtn = $("#authOpenBtn");
        const logoutBtn = $("#logoutBtn");
        const sidebarLogoutBtn = $("#sidebarLogoutBtn");
        const user = getSavedUser();
        state.user = user;

        if (authOpenBtn) {
            if (user) {
                const fName = firstName(user.full_name || user.name || "User");
                const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
                authOpenBtn.style.padding = "0";
                authOpenBtn.style.setProperty("background", "transparent", "important");
            } else {
                authOpenBtn.innerHTML = "Login / Portal";
                authOpenBtn.style.padding = "";
                authOpenBtn.style.removeProperty("background");
            }
        }
        if (logoutBtn) {
            logoutBtn.hidden = !user;
            if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.hidden = !user;
        }

        // Only show My Orders / Activity when logged in
        $$(".myOrdersLink, #navMyOrders, #sidebarMyOrders, #mobileBottomMyOrders").forEach(el => {
            el.style.display = user ? "" : "none";
        });
    }

    
    async function loadAmbulances() { 
    const container = $("#ambulanceContainer");
    if (!container) return;
    renderLoading(container, "Loading ambulances...");
    try {
        const data = await apiGet('/api/all-ambulances');
        let ambulances = [];
        if (data && data.success && Array.isArray(data.ambulances) && data.ambulances.length > 0) {
            ambulances = data.ambulances;
        } else {
            ambulances = [
                { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500, driver_exp: "5 yrs" },
                { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000, driver_exp: "7 yrs" },
                { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000, driver_exp: "3 yrs" },
                { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000, driver_exp: "8 yrs" }
            ];
        }
        
        container.innerHTML = ambulances.map(item => `
            <article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    
    <!-- Top Urgent Header -->
    <div style="padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></span>
                <span style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">Ready for Dispatch</span>
            </div>
            <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2; font-family: var(--font-heading);">${escapeHtml(item.ambulance_type || "Emergency")}</h3>
        </div>
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            <i class="fa-solid fa-truck-medical"></i>
        </div>
    </div>
    
    <!-- Quick Specs -->
    <div style="padding: 0 24px 20px 24px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                <i class="fa-solid fa-clock" style="color: #94a3b8;"></i> ETA: ${escapeHtml(item.eta || "10 mins")}
            </div>
            <div style="width: 4px; height: 4px; border-radius: 50%; background: #cbd5e1;"></div>
            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                <i class="fa-solid fa-location-crosshairs" style="color: #94a3b8;"></i> ${escapeHtml(item.area || "Nearby")}
            </div>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">Fully equipped medical transport unit with experienced paramedics.</p>
    </div>
    
    <!-- Pricing & Action -->
    <div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
                            <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                        </div>
                        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; width: 100%; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Book Now <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
</article>
        `).join("");
    } catch (error) {
        console.error("Error loading ambulances:", error);
        container.innerHTML = `<div class="error-msg">Failed to load ambulances.</div>`;
    }
}
async function loadMedicines() {
        const container = $("#medicineContainer");
        renderLoading(container, "Loading medicines...");

        try {
            const data = await apiGet("/api/all-medicines");
            if (!data.success || !Array.isArray(data.medicines) || data.medicines.length === 0) {
                renderEmpty(container, "No medicines available right now.");
                return;
            }

            state.medicines = data.medicines;
            renderMedicines(state.medicines);
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medicines could not be loaded.");
        }
    }

    function renderMedicines(medicines) {
        const container = $("#medicineContainer");
        if (!container) {
            return;
        }

        if (!medicines.length) {
            renderEmpty(container, "No medicines matched your search.");
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            const image = medicine.medicine_image ? `/uploads/${medicine.medicine_image}` : FALLBACK_IMAGE;
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="medicineImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
    </div>
    <div class="medicineContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="medicineCompany" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</article>
            `;
        }).join("");
    }

    async function loadEquipments() {
        const container = $("#equipmentContainer");
        renderLoading(container, "Loading equipments...");

        try {
            const data = await apiGet("/api/all-equipments");
            if (!data.success || !Array.isArray(data.equipments) || data.equipments.length === 0) {
                renderEmpty(container, "No medical equipments available right now.");
                return;
            }

            container.innerHTML = data.equipments.map(equipment => {
                const image = equipment.thumbnail_image ? `/uploads/${equipment.thumbnail_image}` : FALLBACK_IMAGE;
                const name = equipment.product_name || "Medical Equipment";
                const brand = equipment.brand_name || "No Brand";
                const price = Number(equipment.selling_price) || 0;

                return `
                    <article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medical equipments could not be loaded.");
        }
    }

        async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        const address = document.getElementById('cartDeliveryAddress')?.value.trim();
        if (!address) {
            toast("Please enter a delivery address");
            return;
        }

        const btn = document.getElementById('checkoutCartBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("cart", JSON.stringify(state.cart));
            formData.append("delivery_address", address);
            
            const pFile = document.getElementById('cartPrescription')?.files[0];
            if (pFile) {
                formData.append("prescription", pFile);
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                toast(result.message || "Checkout failed");
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }

            // Open Razorpay
            const options = {
                key: result.key,
                amount: result.amount,
                currency: "INR",
                name: "HospiKare",
                description: "Cart Checkout",
                order_id: result.razorpay_order_id,
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function(paymentResponse) {
                    const verifyData = await postJson("/api/verify-payment", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    });
                    
                    if (verifyData.success) {
                        toast("Payment Successful! Check My Orders.");
                        state.cart = [];
                        saveCart();
                        renderCart();
                        updateCartUI();
                        closeModal("cartModal");
                    } else {
                        toast(verifyData.message || "Payment Verification Failed");
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(res){
                toast("Payment Failed or Cancelled");
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast("An error occurred during checkout");
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    function wireCart() {
        $$(".js-open-cart").forEach(button => button.addEventListener("click", openCartModal));
        $("#checkoutCartBtn")?.addEventListener("click", handleCartCheckout);
        $("#clearCartBtn")?.addEventListener("click", () => {
            state.cart = [];
            saveCart();
            renderCart();
            updateCartUI();
            toast("Cart cleared");
        });

        $("#cartItems")?.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            updateCartItem(button.dataset.key, button.dataset.cartAction);
        });
    }

    function wireProductForm() {
        $("#buy_quantity")?.addEventListener("input", updateProductTotal);
        $("#productPurchaseForm")?.addEventListener("submit", handleProductPurchase);
    }

    function switchAuthTab(tab) {
        const loginTab = $("#loginTab");
        const registerTab = $("#registerTab");
        const loginForm = $("#loginForm");
        const registerForm = $("#registerForm");
        const showRegister = tab === "register";

        loginTab?.classList.toggle("activeTab", !showRegister);
        registerTab?.classList.toggle("activeTab", showRegister);
        loginForm?.classList.toggle("hiddenForm", showRegister);
        registerForm?.classList.toggle("hiddenForm", !showRegister);

        if (loginForm) {
            loginForm.style.display = showRegister ? "none" : "grid";
        }
        if (registerForm) {
            registerForm.style.display = showRegister ? "block" : "none";
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("full_name", valueOf("regName"));
        formData.append("email", valueOf("regEmail"));
        formData.append("phone", valueOf("regPhone"));
        formData.append("password", valueOf("regPassword"));
        formData.append("gender", valueOf("regGender"));
        formData.append("dob", valueOf("regDob"));
        formData.append("blood_group", valueOf("regBloodGroup"));
        formData.append("address", valueOf("regAddress"));
        formData.append("city", valueOf("regCity"));
        formData.append("state", valueOf("regState"));
        formData.append("pincode", valueOf("regPincode"));

        const photo = $("#regProfilePhoto");
        if (photo?.files?.[0]) {
            formData.append("profile_photo", photo.files[0]);
        }

        try {
            setFormBusy("registerForm", true);
            const response = await fetch("/api/product-register", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Registration failed");
                return;
            }

            const registeredEmail = valueOf("regEmail");
            toast("Registration successful. Please login.");
            $("#registerForm")?.reset();
            if ($("#loginEmail")) {
                $("#loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } catch (error) {
            console.error(error);
            toast("Registration failed. Try again.");
        } finally {
            setFormBusy("registerForm", false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            setFormBusy("loginForm", true);
            const data = await postJson("/api/product-login", {
                email: valueOf("loginEmail"),
                password: valueOf("loginPassword")
            });

            if (!data.success) {
                toast(data.message || "Login failed");
                return;
            }

            state.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            state.cart = getCart();
            updateCartUI();
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
            if (state.pendingCartItem) {
                const item = state.pendingCartItem;
                state.pendingCartItem = null;
                addToCart(item);
            }
            if (state.pendingInsurancePlan) {
                const plan = state.pendingInsurancePlan;
                state.pendingInsurancePlan = null;
                openInsuranceModal(plan.id, plan.name, plan.claim, plan.price);
            }
        } catch (error) {
            console.error(error);
            toast("Login failed. Try again.");
        } finally {
            setFormBusy("loginForm", false);
        }
    }

    async function logoutUser() {
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            await fetch('/api/product-logout', { method: 'POST', credentials: 'include' });
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("hk_user");
        localStorage.removeItem(CART_KEY);
        sessionStorage.clear();
        state.user = null;
        state.cart = [];
        updateCartUI();
        updateUserUI();
        loadUserInsuranceDashboard();
        closeModal("userProfileModal");
        closeModal("authOverlay");
        toast('Logged out successfully');
        window.location.href = '/users.html';
    }

    function updateUserUI() {
        const authOpenBtn = $("#authOpenBtn");
        const logoutBtn = $("#logoutBtn");
        const sidebarLogoutBtn = $("#sidebarLogoutBtn");
        const user = getSavedUser();
        state.user = user;

        if (authOpenBtn) {
            if (user) {
                const fName = firstName(user.full_name || user.name || "User");
                const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
                authOpenBtn.style.padding = "0";
                authOpenBtn.style.setProperty("background", "transparent", "important");
            } else {
                authOpenBtn.innerHTML = "Login / Portal";
                authOpenBtn.style.padding = "";
                authOpenBtn.style.removeProperty("background");
            }
        }
        if (logoutBtn) {
            logoutBtn.hidden = !user;
            if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.hidden = !user;
        }

        // Only show My Orders / Activity when logged in
        $$(".myOrdersLink, #navMyOrders, #sidebarMyOrders, #mobileBottomMyOrders").forEach(el => {
            el.style.display = user ? "" : "none";
        });
    }

    
    async function loadMedicines() {
        const container = $("#medicineContainer");
        renderLoading(container, "Loading medicines...");

        try {
            const data = await apiGet("/api/all-medicines");
            if (!data.success || !Array.isArray(data.medicines) || data.medicines.length === 0) {
                renderEmpty(container, "No medicines available right now.");
                return;
            }

            state.medicines = data.medicines;
            renderMedicines(state.medicines);
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medicines could not be loaded.");
        }
    }

    function renderMedicines(medicines) {
        const container = $("#medicineContainer");
        if (!container) {
            return;
        }

        if (!medicines.length) {
            renderEmpty(container, "No medicines matched your search.");
            return;
        }

        container.innerHTML = medicines.map(medicine => {
            const image = medicine.medicine_image ? `/uploads/${medicine.medicine_image}` : FALLBACK_IMAGE;
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="medicineImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
    </div>
    <div class="medicineContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="medicineCompany" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="medicinePrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; padding: 10px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</article>
            `;
        }).join("");
    }

    async function loadEquipments() {
        const container = $("#equipmentContainer");
        renderLoading(container, "Loading equipments...");

        try {
            const data = await apiGet("/api/all-equipments");
            if (!data.success || !Array.isArray(data.equipments) || data.equipments.length === 0) {
                renderEmpty(container, "No medical equipments available right now.");
                return;
            }

            container.innerHTML = data.equipments.map(equipment => {
                const image = equipment.thumbnail_image ? `/uploads/${equipment.thumbnail_image}` : FALLBACK_IMAGE;
                const name = equipment.product_name || "Medical Equipment";
                const brand = equipment.brand_name || "No Brand";
                const price = Number(equipment.selling_price) || 0;

                return `
                    <article class="equipmentCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    <div class="equipmentImage" style="width: 100%; aspect-ratio: 4/3; background: #f8fafc; position: relative; padding: 16px; display: flex; align-items: center; justify-content: center;">
        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease;">
        <div style="position: absolute; top: 12px; left: 12px; font-size: 10px; color: #059669; font-weight: 800; text-transform: uppercase; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">${escapeHtml(equipment.category || "Equipment")}</div>
        ${equipment.status === "Available" ? `<div style="position: absolute; top: 12px; right: 12px; font-size: 10px; color: #4338ca; font-weight: 800; text-transform: uppercase; background: #e0e7ff; padding: 4px 8px; border-radius: 6px;">Instock</div>` : ''}
    </div>
    <div class="equipmentContent" style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(name)}</h3>
        <div class="equipmentBrand" style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 16px;">${escapeHtml(brand)}</div>
        
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 12px;">
            <div class="equipmentPrice" style="font-size: 20px; font-weight: 900; color: #1e293b;">${formatMoney(price)}</div>
            <div style="display: grid; grid-template-columns: ${equipment.product_video ? '40px 1fr' : '1fr'}; gap: 8px;">
                ${equipment.product_video ? `<button type="button" onclick="openVideoModal('/uploads/${escapeAttr(equipment.product_video)}')" style="background: #f1f5f9; color: #0f172a; border-radius: 10px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s;"><i class="fa-solid fa-play"></i></button>` : ''}
                <button class="addEquipmentBtn" type="button" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}" style="width: 100%; background: #1e40af; color: white; border-radius: 10px; height: 40px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-cart-shopping"></i> Add
                </button>
            </div>
        </div>
    </div>
</article>
                `;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Medical equipments could not be loaded.");
        }
    }

        async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        const address = document.getElementById('cartDeliveryAddress')?.value.trim();
        if (!address) {
            toast("Please enter a delivery address");
            return;
        }

        const btn = document.getElementById('checkoutCartBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("cart", JSON.stringify(state.cart));
            formData.append("delivery_address", address);
            
            const pFile = document.getElementById('cartPrescription')?.files[0];
            if (pFile) {
                formData.append("prescription", pFile);
            }

            const response = await fetch("/api/checkout", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                toast(result.message || "Checkout failed");
                btn.innerHTML = oldText;
                btn.disabled = false;
                return;
            }

            // Open Razorpay
            const options = {
                key: result.key,
                amount: result.amount,
                currency: "INR",
                name: "HospiKare",
                description: "Cart Checkout",
                order_id: result.razorpay_order_id,
                prefill: {
                    name: user.full_name,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function(paymentResponse) {
                    const verifyData = await postJson("/api/verify-payment", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature
                    });
                    
                    if (verifyData.success) {
                        toast("Payment Successful! Check My Orders.");
                        state.cart = [];
                        saveCart();
                        renderCart();
                        updateCartUI();
                        closeModal("cartModal");
                    } else {
                        toast(verifyData.message || "Payment Verification Failed");
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function(res){
                toast("Payment Failed or Cancelled");
            });
            rzp.open();
            
        } catch (error) {
            console.error(error);
            toast("An error occurred during checkout");
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }

    function wireCart() {
        $$(".js-open-cart").forEach(button => button.addEventListener("click", openCartModal));
        $("#checkoutCartBtn")?.addEventListener("click", handleCartCheckout);
        $("#clearCartBtn")?.addEventListener("click", () => {
            state.cart = [];
            saveCart();
            renderCart();
            updateCartUI();
            toast("Cart cleared");
        });

        $("#cartItems")?.addEventListener("click", event => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            updateCartItem(button.dataset.key, button.dataset.cartAction);
        });
    }

    function wireProductForm() {
        $("#buy_quantity")?.addEventListener("input", updateProductTotal);
        $("#productPurchaseForm")?.addEventListener("submit", handleProductPurchase);
    }

    function switchAuthTab(tab) {
        const loginTab = $("#loginTab");
        const registerTab = $("#registerTab");
        const loginForm = $("#loginForm");
        const registerForm = $("#registerForm");
        const showRegister = tab === "register";

        loginTab?.classList.toggle("activeTab", !showRegister);
        registerTab?.classList.toggle("activeTab", showRegister);
        loginForm?.classList.toggle("hiddenForm", showRegister);
        registerForm?.classList.toggle("hiddenForm", !showRegister);

        if (loginForm) {
            loginForm.style.display = showRegister ? "none" : "grid";
        }
        if (registerForm) {
            registerForm.style.display = showRegister ? "block" : "none";
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("full_name", valueOf("regName"));
        formData.append("email", valueOf("regEmail"));
        formData.append("phone", valueOf("regPhone"));
        formData.append("password", valueOf("regPassword"));
        formData.append("gender", valueOf("regGender"));
        formData.append("dob", valueOf("regDob"));
        formData.append("blood_group", valueOf("regBloodGroup"));
        formData.append("address", valueOf("regAddress"));
        formData.append("city", valueOf("regCity"));
        formData.append("state", valueOf("regState"));
        formData.append("pincode", valueOf("regPincode"));

        const photo = $("#regProfilePhoto");
        if (photo?.files?.[0]) {
            formData.append("profile_photo", photo.files[0]);
        }

        try {
            setFormBusy("registerForm", true);
            const response = await fetch("/api/product-register", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });
            const data = await response.json();

            if (!data.success) {
                toast(data.message || "Registration failed");
                return;
            }

            const registeredEmail = valueOf("regEmail");
            toast("Registration successful. Please login.");
            $("#registerForm")?.reset();
            if ($("#loginEmail")) {
                $("#loginEmail").value = registeredEmail;
            }
            switchAuthTab("login");
        } catch (error) {
            console.error(error);
            toast("Registration failed. Try again.");
        } finally {
            setFormBusy("registerForm", false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        try {
            setFormBusy("loginForm", true);
            const data = await postJson("/api/product-login", {
                email: valueOf("loginEmail"),
                password: valueOf("loginPassword")
            });

            if (!data.success) {
                toast(data.message || "Login failed");
                return;
            }

            state.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            localStorage.setItem("hk_user", JSON.stringify(data.user));
            state.cart = getCart();
            updateCartUI();
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
            if (state.pendingCartItem) {
                const item = state.pendingCartItem;
                state.pendingCartItem = null;
                addToCart(item);
            }
            if (state.pendingInsurancePlan) {
                const plan = state.pendingInsurancePlan;
                state.pendingInsurancePlan = null;
                openInsuranceModal(plan.id, plan.name, plan.claim, plan.price);
            }
        } catch (error) {
            console.error(error);
            toast("Login failed. Try again.");
        } finally {
            setFormBusy("loginForm", false);
        }
    }

    async function logoutUser() {
        try {
            await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
            await fetch('/api/product-logout', { method: 'POST', credentials: 'include' });
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("hk_user");
        localStorage.removeItem(CART_KEY);
        sessionStorage.clear();
        state.user = null;
        state.cart = [];
        updateCartUI();
        updateUserUI();
        loadUserInsuranceDashboard();
        closeModal("userProfileModal");
        closeModal("authOverlay");
        toast('Logged out successfully');
        window.location.href = '/users.html';
    }

    function updateUserUI() {
        const authOpenBtn = $("#authOpenBtn");
        const logoutBtn = $("#logoutBtn");
        const sidebarLogoutBtn = $("#sidebarLogoutBtn");
        const user = getSavedUser();
        state.user = user;

        if (authOpenBtn) {
            if (user) {
                const fName = firstName(user.full_name || user.name || "User");
                const photoUrl = user.profile_photo ? `/uploads/${escapeAttr(user.profile_photo)}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName) + '&background=e0e7ff&color=1e40af&bold=true';
                authOpenBtn.innerHTML = `<img src="${photoUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s;">`;
                authOpenBtn.style.padding = "0";
                authOpenBtn.style.setProperty("background", "transparent", "important");
            } else {
                authOpenBtn.innerHTML = "Login / Portal";
                authOpenBtn.style.padding = "";
                authOpenBtn.style.removeProperty("background");
            }
        }
        if (logoutBtn) {
            logoutBtn.hidden = !user;
            if (user) logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout';
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.hidden = !user;
        }

        // Only show My Orders / Activity when logged in
        $$(".myOrdersLink, #navMyOrders, #sidebarMyOrders, #mobileBottomMyOrders").forEach(el => {
            el.style.display = user ? "" : "none";
        });

        loadInsurances();
    }

    
    async function loadAmbulances() { 
    const container = $("#ambulanceContainer");
    if (!container) return;
    renderLoading(container, "Loading ambulances...");
    try {
        const data = await apiGet('/api/all-ambulances');
        let ambulances = [];
        if (data && data.success && Array.isArray(data.ambulances) && data.ambulances.length > 0) {
            ambulances = data.ambulances;
        } else {
            ambulances = [
                { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500, driver_exp: "5 yrs" },
                { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000, driver_exp: "7 yrs" },
                { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000, driver_exp: "3 yrs" },
                { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000, driver_exp: "8 yrs" }
            ];
        }
        
        container.innerHTML = ambulances.map(item => `
            <article class="ambulanceCard" style="display: flex; flex-direction: column; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; position: relative;">
    
    <!-- Top Urgent Header -->
    <div style="padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);"></span>
                <span style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">Ready for Dispatch</span>
            </div>
            <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2; font-family: var(--font-heading);">${escapeHtml(item.ambulance_type || "Emergency")}</h3>
        </div>
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            <i class="fa-solid fa-truck-medical"></i>
        </div>
    </div>
    
    <!-- Quick Specs -->
    <div style="padding: 0 24px 20px 24px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                <i class="fa-solid fa-clock" style="color: #94a3b8;"></i> ETA: ${escapeHtml(item.eta || "10 mins")}
            </div>
            <div style="width: 4px; height: 4px; border-radius: 50%; background: #cbd5e1;"></div>
            <div style="display: flex; align-items: center; gap: 6px; color: #475569; font-size: 14px; font-weight: 600;">
                <i class="fa-solid fa-location-crosshairs" style="color: #94a3b8;"></i> ${escapeHtml(item.area || "Nearby")}
            </div>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">Fully equipped medical transport unit with experienced paramedics.</p>
    </div>
    
    <!-- Pricing & Action -->
    <div style="margin-top: auto; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Fare</span>
                            <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${formatMoney(item.base_chrge || 0)}</div>
                        </div>
                        <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" style="background: #2563eb; color: white; border-radius: 12px; width: 100%; height: 48px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Book Now <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
</article>
        `).join("");
    } catch (error) {
        console.error("Error loading ambulances:", error);
        container.innerHTML = `<div class="error-msg">Failed to load ambulances.</div>`;
    }
}

    function openInsuranceClaim(purchaseId, policyName, coverage) {
        if (!requireUser()) {
            return;
        }

        $("#claim_purchase_id").value = purchaseId || "";
        $("#claim_policy_name").value = policyName || "Insurance Policy";
        $("#claim_amount").max = String(parseMoney(coverage));
        $("#claim_amount").value = "";
        $("#claim_reason").value = "";
        const documentInput = $("#claim_documents");
        if (documentInput) {
            documentInput.value = "";
        }
        openModal("insuranceClaimModal");
    }

})();
