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

    function init() {
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

    function wireDynamicActions() {
        document.addEventListener("click", event => {
            const actionButton = event.target.closest("[data-action]");

            if (actionButton) {
                const action = actionButton.dataset.action;

                if (action === "open-hospital") {
                    openHospital(actionButton.dataset.id);
                }

                if (action === "book-ambulance") {
                    openAmbulanceBooking(actionButton.dataset.id, actionButton.dataset.amount);
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
                openHospital(hospitalCard.dataset.hospitalId);
            }
        });

        $("#medicineSearchInput")?.addEventListener("input", event => {
            renderMedicines(filterMedicines(event.target.value));
        });
    }

    async function handleCartCheckout() {
        const total = cartTotal();
        if (total <= 0) {
            toast("Your cart is empty");
            return;
        }

        const user = requireUser();
        if (!user) return;

        await payAndRun({
            amount: total,
            name: "HospiKare Pharmacy",
            description: "Cart Checkout",
            prefillName: user.full_name,
            onSuccess: async response => {
                let successCount = 0;
                // Process each item
                for (let item of state.cart) {
                    const purchaseData = await postJson("/api/buy-product", {
                        user_id: user.id,
                        product_type: item.type,
                        product_id: item.id,
                        quantity: item.qty,
                        total_amount: item.price * item.qty,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id
                    });
                    if (purchaseData && purchaseData.success) {
                        successCount++;
                    }
                }

                toast(`Successfully purchased ${successCount} item(s)! Check My Orders for Invoices.`);

                // Clear cart
                state.cart = [];
                saveCart();
                renderCart();
                updateCartUI();
                closeModal("cartModal");
            }
        });
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

    function logoutUser() {
        localStorage.removeItem(USER_KEY);
        state.user = null;
        updateUserUI();
        loadUserInsuranceDashboard();
        toast("Logged out");
        showAuthModal();
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

    async function loadAmbulances() {
        const container = $("#ambulanceContainer");
        renderLoading(container, "Loading ambulances...");

        try {
            const data = await apiGet("/api/all-ambulances");
            if (!data.success || !Array.isArray(data.ambulances) || data.ambulances.length === 0) {
                renderEmpty(container, "No ambulance is available right now.");
                return;
            }

            container.innerHTML = data.ambulances.map(ambulance => `
                <article class="ambulanceCard">
                    <div class="ambulanceContent">
                        <h3>${escapeHtml(ambulance.ambulance_type || "Emergency")} Ambulance</h3>
                        <div class="ambulanceLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${escapeHtml(ambulance.area || "Area not available")}</span>
                        </div>
                        <div class="ambulanceFeatures">
                            <span>${escapeHtml(ambulance.status || "Available")}</span>
                            <span>ETA: ${escapeHtml(ambulance.eta || "N/A")}</span>
                            <span>Driver: ${escapeHtml(ambulance.driver_exp || "N/A")}</span>
                        </div>
                        <p class="ambulanceDescription">${escapeHtml(ambulance.description || "Emergency support ambulance.")}</p>
                        <div class="ambulanceBottom">
                            <div class="driverName">
                                <i class="fa-solid fa-indian-rupee-sign"></i>
                                Base: ${formatMoney(ambulance.base_chrge)}
                            </div>
                            <button class="bookAmbulanceBtn" type="button" data-action="book-ambulance" data-id="${escapeAttr(ambulance.id)}" data-amount="${escapeAttr(ambulance.base_chrge || 0)}">
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
                            Add
                        </button>
                        <button class="addMedicineBtn medicineBuyBtn" type="button" data-action="buy-product" data-type="medicine" data-id="${escapeAttr(medicine.medicine_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}">
                            Buy Now
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
                                    <span>${formatMoney(equipment.mrp)}</span>
                                </div>
                                <button class="addEquipmentBtn" type="button" aria-label="Add to cart" data-action="add-cart" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <button class="addequipmentBtn equipmentBuyBtn" type="button" data-action="buy-product" data-type="equipment" data-id="${escapeAttr(equipment.product_id)}" data-name="${escapeAttr(name)}" data-brand="${escapeAttr(brand)}" data-price="${escapeAttr(price)}">
                                    Buy Now
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

    function openHospital(id) {
        if (!id) {
            return;
        }
        window.location.href = `/hosp_data.html?id=${encodeURIComponent(id)}`;
    }

    function openAmbulanceBooking(ambulanceId, amount) {
        if (!requireUser()) {
            return;
        }

        state.selectedAmbulanceId = ambulanceId;
        state.selectedAmbulanceAmount = Number(amount) || 0;
        setText("ambulanceFare", formatMoney(state.selectedAmbulanceAmount));
        setMinimumDateTime();
        openModal("ambulanceBookingModal");
    }

    async function handleAmbulanceBooking(event) {
        event.preventDefault();
        
        // As per business logic, real-time ambulance booking is blocked until APIs are integrated
        alert("Booking disabled: Live ambulance availability requires real-time API integration with hospitals.");
        return;
        
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

                toast("Payment successful and ambulance booked");
                closeModal("ambulanceBookingModal");
                $("#ambulanceBookingForm")?.reset();
            }
        });
    }

    function openLabBooking(labId, testName, amount) {
        if (!requireUser()) {
            return;
        }

        state.selectedLabId = labId;
        state.selectedLabAmount = Number(amount) || 0;
        state.selectedTestName = testName || "Lab Test";
        $("#lab_test_name").value = state.selectedTestName;
        setText("labTestAmount", formatMoney(state.selectedLabAmount));
        openModal("labBookingModal");
    }

    async function handleLabBooking(event) {
        event.preventDefault();
        const user = requireUser();
        if (!user) {
            return;
        }

        const formData = {
            user_id: user.id,
            lab_vendor_id: state.selectedLabId,
            test_name: state.selectedTestName,
            patient_name: valueOf("lab_patient_name"),
            sample_collection_type: valueOf("sample_collection_type"),
            booking_date: valueOf("lab_booking_date"),
            total_amount: state.selectedLabAmount
        };

        await payAndRun({
            amount: state.selectedLabAmount,
            name: "HospiKare Labs",
            description: "Lab Test Booking Payment",
            prefillName: formData.patient_name,
            onSuccess: async response => {
                const bookingData = await postJson("/api/book-lab-test", {
                    ...formData,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });

                if (!bookingData.success) {
                    toast(bookingData.message || "Lab booking failed");
                    return;
                }

                toast("Lab test booked successfully");
                closeModal("labBookingModal");
                $("#labBookingForm")?.reset();
            }
        });
    }

    function openInsuranceModal(insuranceId, planName, claimPrice, insPrice) {
        if (!requireUser()) {
            return;
        }

        state.selectedInsuranceId = insuranceId;
        state.selectedInsurancePlan = planName || "Insurance Plan";
        state.selectedInsuranceBasePrice = parseMoney(insPrice);
        state.selectedInsuranceAmount = state.selectedInsuranceBasePrice;

        $("#insurance_plan_name").value = state.selectedInsurancePlan;
        $("#insurance_claim_price").value = formatMoney(claimPrice);
        $("#insurance_price").value = formatMoney(state.selectedInsuranceBasePrice);
        $("#insurance_duration").value = "1";
        setText("insuranceTotalAmount", formatMoney(state.selectedInsuranceAmount));
        openModal("insuranceModal");
    }

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

    async function loadUserInsuranceDashboard() {
        const policiesContainer = $("#userPoliciesContainer");
        const claimsContainer = $("#userClaimsContainer");

        if (!policiesContainer || !claimsContainer) {
            return;
        }

        state.user = getSavedUser();

        if (!state.user) {
            renderEmpty(policiesContainer, "Login to view your insurance policies.");
            renderEmpty(claimsContainer, "Login to view your claim history.");
            return;
        }

        renderLoading(policiesContainer, "Loading your policies...");
        renderLoading(claimsContainer, "Loading claims...");

        try {
            const [policyData, claimData] = await Promise.all([
                apiGet("/api/user/insurance-policies"),
                apiGet("/api/user/insurance-claims")
            ]);

            if (!policyData.success) {
                renderEmpty(policiesContainer, policyData.message || "Policies could not be loaded.");
            } else {
                renderUserPolicies(policyData.policies || []);
            }

            if (!claimData.success) {
                renderEmpty(claimsContainer, claimData.message || "Claims could not be loaded.");
            } else {
                renderUserClaims(claimData.claims || []);
            }
        } catch (error) {
            console.error(error);
            renderEmpty(policiesContainer, "Policies could not be loaded.");
            renderEmpty(claimsContainer, "Claims could not be loaded.");
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










