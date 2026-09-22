(() => {
    const USER_KEY = "productUser";
    const CART_KEY = "hospikareUserCart";
    const FALLBACK_IMAGE = "/assets/logo.png";

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

    async function loadUserInsuranceDashboard() {
        const userPoliciesContainer = $("#userPoliciesContainer");
        const userClaimsContainer = $("#userClaimsContainer");
        if (!userPoliciesContainer || !userClaimsContainer) return;

        const currentUser = getSavedUser();
        if (!currentUser) {
            userPoliciesContainer.innerHTML = '<div class="emptyState">Login to view your insurance policies.</div>';
            userClaimsContainer.innerHTML = '<div class="emptyState">Login to view your claim history.</div>';
            return;
        }

        try {
            const data = await apiGet("/api/user/insurance-policies");
            if (data && data.success) {
                if (data.policies && data.policies.length > 0) {
                    userPoliciesContainer.innerHTML = data.policies.map(p => `
                        <div class="policyCard" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                            <strong>${escapeHtml(p.plan_name || 'Insurance Plan')}</strong>
                            <div style="font-size:12px; color:#64748b;">Coverage: ${formatMoney(p.coverage_amount)} | Status: <span style="color:#10b981; font-weight:600;">Active</span></div>
                        </div>
                    `).join("");
                } else {
                    userPoliciesContainer.innerHTML = '<div class="emptyState">No active insurance policies found.</div>';
                }

                if (data.claims && data.claims.length > 0) {
                    userClaimsContainer.innerHTML = data.claims.map(c => `
                        <div class="claimCard" style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
                            <strong>Claim #${c.id}</strong> - ${escapeHtml(c.policy_name)}
                            <div style="font-size:12px; color:#64748b;">Amount: ${formatMoney(c.claim_amount)} | Status: <b>${escapeHtml(c.status)}</b></div>
                        </div>
                    `).join("");
                } else {
                    userClaimsContainer.innerHTML = '<div class="emptyState">No claims submitted yet.</div>';
                }
            } else {
                userPoliciesContainer.innerHTML = '<div class="emptyState">No active insurance policies found.</div>';
                userClaimsContainer.innerHTML = '<div class="emptyState">No claims submitted yet.</div>';
            }
        } catch (err) {
            console.error("Insurance dashboard error:", err);
            userPoliciesContainer.innerHTML = '<div class="emptyState">No active insurance policies found.</div>';
            userClaimsContainer.innerHTML = '<div class="emptyState">No claims submitted yet.</div>';
        }
    }

    async function init() {
        // Sync session state with backend
        try {
            const res = await apiGet('/api/product-user/profile');
            if (res && res.success && res.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(res.user));
            } else {
                localStorage.removeItem(USER_KEY);
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

        if (!state.user) {
            showAuthModal();
        }

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
        $("#authOpenBtn")?.addEventListener("click", showAuthModal);
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
        $("#refreshInsuranceClaimsBtn")?.addEventListener("click", loadUserInsuranceDashboard);
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
                                    <span>${escapeHtml(hospital.totalBeds || 0)} Beds</span>
                                </div>
                                <button class="rvbtn" type="button" aria-label="View hospital" data-action="open-hospital" data-id="${escapeAttr(hospital.id)}">
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
                    <article class="labCard">
                        <div class="labLeft">
                            <h3>${escapeHtml(lab.lab_name || "Diagnostic Lab")}</h3>
                            <div class="labCenter">
                                <i class="fa-regular fa-hospital"></i>
                                <span>${escapeHtml(lab.available_areas || lab.address || "Service area not available")}</span>
                            </div>
                            <div class="labCenter">
                                <i class="fa-solid fa-vial"></i>
                                <span>${escapeHtml(testName)} - ${homeCollection}</span>
                            </div>
                            <div class="labPrice">${formatMoney(lab.test_price)}</div>
                            ${pathologistsHTML}
                        </div>
                        <button class="bookLabBtn" type="button" data-action="book-lab" data-id="${escapeAttr(lab.id)}" data-test-name="${escapeAttr(testName)}" data-amount="${escapeAttr(lab.test_price || 0)}">
                            Book Test
                        </button>
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
        renderLoading(container, "Loading insurance plans...");

        try {
            const data = await apiGet("/api/all-insurances");
            if (!data.success || !Array.isArray(data.insurances) || data.insurances.length === 0) {
                renderEmpty(container, "No insurance plans available right now.");
                return;
            }

            container.innerHTML = data.insurances.map((insurance, index) => `
                <article class="insuranceCard ${index === 1 ? "popularPlan" : ""}">
                    ${index === 1 ? `<div class="popularBadge">Most Popular</div>` : ""}
                    <h3>${escapeHtml(insurance.comp_name || "Insurance Plan")}</h3>
                    <div class="insurancePrice">${formatMoney(insurance.claim_price || insurance.ins_price)}</div>
                    <div class="insurancePlanType">${escapeHtml(insurance.comp_type || "Health Cover")}</div>
                    <p class="insuranceDescription">${escapeHtml(insurance.description || "Coverage details available with the provider.")}</p>
                    <div class="insuranceFeatures">
                        <div><i class="fa-solid fa-check"></i><span>Claim Type: ${escapeHtml(insurance.claim_type || "N/A")}</span></div>
                        <div><i class="fa-solid fa-check"></i><span>Claim Time: ${escapeHtml(insurance.claim_time || "N/A")}</span></div>
                        <div><i class="fa-solid fa-check"></i><span>IRDAI: ${escapeHtml(insurance.irdai || "N/A")}</span></div>
                        <div><i class="fa-solid fa-headset"></i><span>Support: ${escapeHtml(insurance.cust_sup_num || "N/A")}</span></div>
                    </div>
                    <button class="buyPlanBtn" type="button" data-action="buy-insurance" data-id="${escapeAttr(insurance.id)}" data-name="${escapeAttr(insurance.comp_name || "Insurance Plan")}" data-claim="${escapeAttr(parseMoney(insurance.claim_price))}" data-price="${escapeAttr(parseMoney(insurance.ins_price))}">
                        Buy Plan
                    </button>
                </article>
            `).join("");
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
            const image = medicine.medicine_image ? `/uploads/${medicine.medicine_image}` : FALLBACK_IMAGE;
            const name = medicine.medicine_name || "Medicine";
            const brand = medicine.brand_name || "No Brand";
            const price = Number(medicine.selling_price) || 0;

            return `
                <article class="medicineCard">
                    <div class="medicineImage">
                        <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'">
                    </div>
                    <div class="medicineCategory">${escapeHtml(medicine.category || medicine.medicine_type || "Medicine")}</div>
                    <h3>${escapeHtml(name)}</h3>
                    <div class="medicineCompany">${escapeHtml(brand)}</div>
                    <div class="medicineBottom">
                        <div class="medicinePrice">${formatMoney(price)}</div>
                        <button class="addMedicineBtn" type="button" data-action="add-cart" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}">
                            Add to Cart
                        </button>
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
                    <article class="equipmentCard">
                        <div class="equipmentImage">
                            <img src="${escapeAttr(image).includes('fakepath') ? FALLBACK_IMAGE : (escapeAttr(image).startsWith('/') || escapeAttr(image).startsWith('http') ? escapeAttr(image) : '/uploads/' + escapeAttr(image))}" alt="${escapeAttr(name)}" onerror="this.src='${FALLBACK_IMAGE}'">
                        </div>
                        <div class="equipmentContent">
                            <div class="equipmentCategory">${escapeHtml(equipment.category || "Equipment")}</div>
                            <h3>${escapeHtml(name)}</h3>
                            <div class="equipmentBrand">${escapeHtml(brand)}</div>
                            <div class="equipmentTags">
                                <span>${escapeHtml(equipment.stock_status || "Stock N/A")}</span>
                                <span>Rental: ${escapeHtml(equipment.rental_available || "N/A")}</span>
                                <span>Warranty: ${escapeHtml(equipment.warranty_period || "N/A")}</span>
                            </div>
                            <div class="equipmentBottom">
                                <div class="equipmentPrice">
                                    <h4>${formatMoney(price)}</h4>
                                </div>
                                <button class="addEquipmentBtn" type="button" aria-label="Add to cart" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}">
                                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                                </button>
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
            closeModal("authOverlay");
            updateUserUI();
            loadUserInsuranceDashboard();
            toast("Login successful");
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
        } catch(e) {
            console.error('Logout API failed:', e);
        }
        localStorage.removeItem(USER_KEY);
        state.user = null;
        updateUserUI();
        loadUserInsuranceDashboard();
        toast('Logged out');
        window.location.href = '/rg.html';
    }

    function updateUserUI() {
        const authOpenBtn = $("#authOpenBtn");
        const logoutBtn = $("#logoutBtn");
        const sidebarLogoutBtn = $("#sidebarLogoutBtn");
        const user = getSavedUser();
        state.user = user;

        if (authOpenBtn) {
            authOpenBtn.textContent = user ? `Hi, ${firstName(user.full_name || user.name || "User")}` : "Login / Portal";
        }
        if (logoutBtn) {
            logoutBtn.hidden = !user;
        }
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.hidden = !user;
        }
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
                <article class="ambulanceCard">
                    <div class="ambulanceContent">
                        <h3>${escapeHtml(item.ambulance_type || "Emergency")} Ambulance</h3>
                        <div class="ambulanceLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${escapeHtml(item.area || "Nearby")}</span>
                        </div>
                        <div class="ambulanceFeatures">
                            <span>${escapeHtml(item.status || "Available")}</span>
                            <span>ETA: ${escapeHtml(item.eta || "N/A")}</span>
                            <span>Driver: ${escapeHtml(item.driver_exp || "N/A")}</span>
                        </div>
                        <p class="ambulanceDescription">${escapeHtml(item.description || "Emergency support ambulance.")}</p>
                        <div class="ambulanceBottom">
                            <div class="driverName">
                                <i class="fa-solid fa-indian-rupee-sign"></i>
                                Base: ${formatMoney(item.base_chrge || 0)}
                            </div>
                            <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(item.id)}" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}">
                                Book Now
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
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
                    { id: 1, ambulance_type: "Basic Life Support (BLS)", area: "City Center", status: "Available", eta: "10 mins", base_chrge: 1500 },
                    { id: 2, ambulance_type: "Advanced Life Support (ALS)", area: "North Zone", status: "Available", eta: "15 mins", base_chrge: 3000 },
                    { id: 3, ambulance_type: "Patient Transport", area: "South Zone", status: "Available", eta: "20 mins", base_chrge: 1000 },
                    { id: 4, ambulance_type: "ICU Ambulance", area: "West Zone", status: "Available", eta: "25 mins", base_chrge: 5000 }
                ];
            }
            
            container.innerHTML = ambulances.map(item => `
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; background: #f8fafc; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-truck-medical" style="font-size: 64px; color: #cbd5e1; padding: 32px;"></i>
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="margin-bottom: 4px;">${escapeHtml(item.ambulance_type || "Ambulance")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${escapeHtml(item.area || "Nearby")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 12px; color: var(--hk-text-main, #334155); display: flex; gap: 8px; flex-wrap: wrap;">
                            <span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">ETA: ${escapeHtml(item.eta || 'N/A')}</span>
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="font-weight: 800; font-size: 16px; color: #0f172a;">
                                ${item.base_chrge ? formatMoney(item.base_chrge) : 'Rates Vary'}
                            </div>
                            <button class="btn btn-primary" type="button" data-action="book-ambulance" data-type="${escapeAttr(item.ambulance_type)}" data-amount="${escapeAttr(item.base_chrge || 1500)}" data-condition="Non-Emergency">Book Now</button>
                        </div>
                    </div>
                </article>
            `).join("");
        } catch(e) {
            console.error("Failed to load ambulances", e);
            renderEmpty(container, "Ambulances could not be loaded.");
        }
    }

    function renderUserPolicies(policies) {
        const container = $("#userPoliciesContainer");
        if (!container) {
            return;
        }

        if (!policies.length) {
            renderEmpty(container, "No insurance policies yet. Buy a plan to manage claims and renewals.");
            return;
        }

        container.innerHTML = policies.map(policy => {
            const status = String(policy.insurance_status || "active").toLowerCase();
            const isActive = status === "active";
            const policyName = policy.plan_name || policy.comp_name || "Insurance Policy";
            const premium = parseMoney(policy.ins_price) || parseMoney(policy.premium_amount);
            const coverage = parseMoney(policy.coverage_amount || policy.claim_price);

            return `
                <article class="policyItem">
                    <div class="policyItemHeader">
                        <h4>${escapeHtml(policyName)}</h4>
                        <span class="statusPill ${escapeAttr(status)}">${escapeHtml(status)}</span>
                    </div>
                    <div class="policyMeta">
                        <span>Policy No.<strong>${escapeHtml(policy.policy_number || "N/A")}</strong></span>
                        <span>Coverage<strong>${formatMoney(coverage)}</strong></span>
                        <span>Premium<strong>${formatMoney(premium)}</strong></span>
                        <span>Expires<strong>${formatDate(policy.expiry_date)}</strong></span>
                        <span>Provider<strong>${escapeHtml(policy.comp_name || "N/A")}</strong></span>
                        <span>Claims<strong>${escapeHtml(policy.claim_count || 0)}</strong></span>
                    </div>
                    <div class="policyActions">
                        <button class="btn btn-primary btn-sm" type="button" data-action="claim-insurance" data-purchase-id="${escapeAttr(policy.id)}" data-policy="${escapeAttr(policyName)}" data-coverage="${escapeAttr(coverage)}" ${isActive ? "" : "disabled"}>
                            <i class="fa-solid fa-file-medical"></i> Claim
                        </button>
                        <button class="btn btn-outline-blue btn-sm" type="button" data-action="renew-insurance" data-purchase-id="${escapeAttr(policy.id)}" data-policy="${escapeAttr(policyName)}" data-premium="${escapeAttr(premium)}">
                            <i class="fa-solid fa-arrows-rotate"></i> Renew
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderUserClaims(claims) {
        const container = $("#userClaimsContainer");
        if (!container) {
            return;
        }

        if (!claims.length) {
            renderEmpty(container, "No claims submitted yet.");
            return;
        }

        container.innerHTML = claims.map(claim => {
            const status = String(claim.claim_status || "pending").toLowerCase();

            return `
                <article class="claimItem">
                    <div class="policyItemHeader">
                        <h4>${escapeHtml(claim.plan_name || claim.comp_name || "Insurance Claim")}</h4>
                        <span class="statusPill ${escapeAttr(status)}">${escapeHtml(status)}</span>
                    </div>
                    <div class="claimMeta">
                        <span>Policy No.<strong>${escapeHtml(claim.policy_number || "N/A")}</strong></span>
                        <span>Claim Amount<strong>${formatMoney(claim.claim_amount)}</strong></span>
                        <span>Coverage<strong>${formatMoney(claim.coverage_amount)}</strong></span>
                        <span>Submitted<strong>${formatDate(claim.created_at)}</strong></span>
                    </div>
                    <p class="claimReason">${escapeHtml(claim.claim_reason || "No reason added.")}</p>
                </article>
            `;
        }).join("");
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

    async function handleInsuranceClaim(event) {
        event.preventDefault();
        if (!requireUser()) {
            return;
        }

        const formData = new FormData();
        formData.append("insurance_purchase_id", valueOf("claim_purchase_id"));
        formData.append("claim_amount", valueOf("claim_amount"));
        formData.append("claim_reason", valueOf("claim_reason"));

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
        const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
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
            const rawUser = localStorage.getItem(USER_KEY);
            return rawUser ? JSON.parse(rawUser) : null;
        } catch (error) {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }

    function getCart() {
        try {
            const rawCart = localStorage.getItem(CART_KEY);
            const parsed = rawCart ? JSON.parse(rawCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            localStorage.removeItem(CART_KEY);
            return [];
        }
    }

    function saveCart() {
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
})();















