    let revenueChart;
    let vendorChart;
    let userTypeRevenueChart;
    let bookingChart;
    let bedsChart;
    let currentVendorInvoicePrintHtml = "";

    function formatCurrency(value) {
        const amount = Number(value || 0);
        if (!Number.isFinite(amount)) {
            return "Rs 0";
        }

        const hasFraction =
            Math.abs(amount % 1) > 0;

        return `Rs ${amount.toLocaleString("en-IN", {
            minimumFractionDigits: hasFraction ? 2 : 0,
            maximumFractionDigits: 2
        })}`;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function resolveUploadImageUrl(value) {
        if (value === null || value === undefined || String(value).trim() === "") {
            return "/assets/logo.png";
        }

        const rawValue = String(value).trim();

        if (/^https?:\/\//i.test(rawValue) || rawValue.startsWith("data:")) {
            return rawValue;
        }
        if (rawValue.toLowerCase().includes("fakepath")) {
            return "/assets/logo.png";
        }

        const normalizedValue = rawValue
            .replace(/^\/+/, "")
            .replace(/^uploads\//i, "")
            .replace(/^\.\//, "");

        return encodeURI(`/uploads/${normalizedValue}`);
    }

    function prettifyLabel(key) {
        return String(key || "")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );
    }

    function isEmptyDetailValue(value) {
        return (
            value === null
            || value === undefined
            || String(value).trim() === ""
        );
    }

    function isImageValue(value) {
        return (
            typeof value === "string"
            && /\.(png|jpe?g|jfif|webp|gif)$/i
                .test(value.trim())
        );
    }

    function isDocumentValue(value) {
        return (
            typeof value === "string"
            && /\.(pdf|docx?|xlsx?|csv)$/i
                .test(value.trim())
        );
    }

    function renderNestedValue(value) {
        if (
            value
            && typeof value === "object"
        ) {
            return escapeHtml(
                JSON.stringify(value)
            );
        }

        return escapeHtml(value);
    }

    function renderParsedDetail(parsed) {
        if (Array.isArray(parsed)) {
            if (parsed.length === 0) {
                return `<span class="detailEmpty">No items added</span>`;
            }

            const hasObjects =
                parsed.some(item =>
                    item
                    && typeof item === "object"
                    && !Array.isArray(item)
                );

            if (!hasObjects) {
                return `
                    <div class="detailChipList">
                        ${parsed.map(item => `
                            <span class="detailChip">
                                ${renderNestedValue(item)}
                            </span>
                        `).join("")}
                    </div>
                `;
            }

            return `
                <div class="detailNestedList">
                    ${parsed.map((item, index) => {
                        if (
                            !item
                            || typeof item !== "object"
                            || Array.isArray(item)
                        ) {
                            return `
                                <div class="detailNestedItem">
                                    <strong>Item ${index + 1}</strong>
                                    <span>${renderNestedValue(item)}</span>
                                </div>
                            `;
                        }

                        return `
                            <div class="detailNestedItem">
                                <strong>Item ${index + 1}</strong>
                                ${Object.entries(item)
                                    .filter(([, value]) =>
                                        !isEmptyDetailValue(value)
                                    )
                                    .map(([key, value]) => `
                                        <div>
                                            <span>${escapeHtml(prettifyLabel(key))}</span>
                                            <b>${renderNestedValue(value)}</b>
                                        </div>
                                    `).join("")}
                            </div>
                        `;
                    }).join("")}
                </div>
            `;
        }

        if (
            parsed
            && typeof parsed === "object"
        ) {
            return `
                <div class="detailKeyValueList">
                    ${Object.entries(parsed)
                        .filter(([, value]) =>
                            !isEmptyDetailValue(value)
                        )
                        .map(([key, value]) => `
                            <div>
                                <span>${escapeHtml(prettifyLabel(key))}</span>
                                <b>${renderNestedValue(value)}</b>
                            </div>
                        `).join("")}
                </div>
            `;
        }

        return `
            <span class="detailText">
                ${renderNestedValue(parsed)}
            </span>
        `;
    }

    function renderDetailValue(label, value) {
        if (isImageValue(value)) {
            const imageUrl = resolveUploadImageUrl(value);
            return `
                <a
                    class="detailImageLink"
                    href="${imageUrl}"
                    target="_blank"
                    rel="noopener"
                >
                    <img
                        src="${imageUrl}"
                        class="detailImage"
                        alt="${escapeHtml(label)}"
                        onerror="this.onerror=null;this.src='/assets/logo.png'"
                    >
                </a>
            `;
        }

        if (isDocumentValue(value)) {
            const fileUrl = resolveUploadImageUrl(value);
            return `
                <a
                    class="detailFileLink"
                    href="${fileUrl}"
                    target="_blank"
                    rel="noopener"
                >
                    <i class="fa-solid fa-file-lines"></i>
                    <span>${escapeHtml(value)}</span>
                </a>
            `;
        }

        if (
            typeof value === "string"
            && (
                value.trim().startsWith("[")
                || value.trim().startsWith("{")
            )
        ) {
            try {
                return renderParsedDetail(
                    JSON.parse(value)
                );
            }
            catch {
                return `
                    <span class="detailText">
                        ${escapeHtml(value)}
                    </span>
                `;
            }
        }

        return `
            <span class="detailText">
                ${escapeHtml(value)}
            </span>
        `;
    }

    function renderVendorDetailItem(label, value) {
        return `
            <div class="vendorDetailItem">
                <div class="detailItemLabel">
                    ${escapeHtml(label)}
                </div>
                <div class="detailItemValue">
                    ${renderDetailValue(label, value)}
                </div>
            </div>
        `;
    }

    async function loadAdminProfile() {
        try {
            const response = await fetch('/api/admin/profile', { credentials: 'include' });
            const result = await response.json();
            if (result.success) {
                document.getElementById("welcomeText").innerText =
                    `Welcome ${result.admin.name}`;

                const profileName =
                    document.querySelector(".profile-name");

                if (profileName) {
                    profileName.innerText =
                        result.admin.name;
                }
            } else {
                window.location.href = "/rg.html";
            }
        } catch (error) {
            console.error(error);
            window.location.href = "/rg.html";
        }
    }
    loadAdminProfile();

    async function logout(event){
        if (event && event.stopPropagation) {
            event.stopPropagation();
            event.preventDefault();
        }
        try{
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();
            if(result.success){
                window.location.href = "rg.html";
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.error(error);
        }
    }

    const vendorsBtn =
    document.getElementById(
        "vendorsBtn"
    );

    let activeVendorFilter = "all";
    let activeBedAvailabilityFilter = null;

    const vendorFilterLabels = {
        all: "All Vendors",
        hospital: "Hospital Vendors",
        lab: "Lab Test Vendors",
        ambulance: "Ambulance Vendors",
        insurance: "Insurance Vendors",
        medicines: "Medicine Vendors",
        equipment: "Medical Equipment Vendors"
    };

    const listingFilterLabels = {
        all: "All Vendor Listings",
        hospital: "Hospitals",
        lab: "Labs",
        ambulance: "Ambulances",
        insurance: "Insurance Companies",
        medicines: "Medicines",
        equipment: "Medical Equipments"
    };

    const listingSingularLabels = {
        hospital: "Hospital",
        lab: "Lab",
        ambulance: "Ambulance",
        insurance: "Insurance Company",
        medicines: "Medicine",
        equipment: "Medical Equipment"
    };

    const listingNameLabels = {
        all: "Listing Name",
        hospital: "Hospital Name",
        lab: "Lab Name",
        ambulance: "Ambulance Name",
        insurance: "Insurance Company Name",
        medicines: "Medicine Name",
        equipment: "Equipment Name"
    };

    function matchesVendorFilter(vendor, filter) {
        if (filter === "all") {
            return true;
        }

        const type =
            String(vendor.users_type || "")
                .toLowerCase();

        if (filter === "lab") {
            return type.includes("lab");
        }

        if (filter === "medicines") {
            return type.includes("medicine");
        }

        if (filter === "equipment") {
            return type.includes("equipment");
        }

        return type.includes(filter);
    }

    function updateHeaderNav(title, breadcrumb = title) {
        const navTitle = document.querySelector(".nav-title");
        if (navTitle) navTitle.innerText = title;
        const activeBreadcrumb = document.getElementById("activeBreadcrumb");
        if (activeBreadcrumb) activeBreadcrumb.innerText = breadcrumb;
    }

    function openVendors(
        filter = "all",
        bedAvailabilityFilter = null
    ) {
        activeVendorFilter = filter;
        activeBedAvailabilityFilter =
            bedAvailabilityFilter;

        hideAllSections();

        document.getElementById(
            "vendorsSection"
        ).style.display = "block";

        document.querySelectorAll(".menuItem")
            .forEach(item => item.classList.remove("active"));
        vendorsBtn.classList.add("active");

        updateHeaderNav("Vendors", "Vendors");

        document.getElementById(
            "vendorSectionHeading"
        ).innerText =
            vendorFilterLabels[filter]
            || vendorFilterLabels.all;

        document.getElementById(
            "showAllVendorsBtn"
        ).style.display =
            filter === "all"
                ? "none"
                : "inline-flex";

        document.getElementById(
            "vendorSearch"
        ).value = "";

        document.getElementById(
            "listingSearch"
        ).value = "";

        document.getElementById(
            "bedAvailabilitySearch"
        ).value = "";

        loadVendors(filter);
    }

    vendorsBtn.addEventListener(
        "click",
        () => {
            openVendors("all");

    });

    document.getElementById(
        "showAllVendorsBtn"
    ).addEventListener(
        "click",
        () => openVendors("all")
    );

    const usersBtn = document.getElementById("usersBtn");
    if (usersBtn) {
        usersBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("usersSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            usersBtn.classList.add("active");
            updateHeaderNav("Users Management", "Users");
            loadUsers();
        });
    }


    function renderFilteredListings(vendors, filter) {
        const listings =
            vendors.flatMap(vendor =>
                (vendor.listings || []).map(listing => ({
                    ...listing,
                    vendorName: vendor.name,
                    vendorType: vendor.users_type
                }))
            );

        const label =
            listingFilterLabels[filter]
            || listingFilterLabels.all;

        document.getElementById(
            "filteredListingsHeading"
        ).innerText =
            filter === "all"
                ? "All Vendor Names List"
                : `${listingSingularLabels[filter]} Names List (${
                    listings.length
                })`;

        document.getElementById(
            "filteredListingNameHeader"
        ).innerText =
            listingNameLabels[filter]
            || listingNameLabels.all;

        document.getElementById(
            "listingSearch"
        ).placeholder =
            `Search ${
                filter === "all"
                    ? "names"
                    : listingNameLabels[filter]
                        .toLowerCase()
            }...`;

        document.getElementById(
            "filteredListingsSummary"
        ).innerText =
            `${listings.length} ${
                listings.length === 1
                    ? listingSingularLabels[filter] || "listing"
                    : label
            } from ${vendors.length} vendor${
                vendors.length === 1 ? "" : "s"
            }`;

        const tbody =
            document.getElementById(
                "filteredListingsTableBody"
            );

        tbody.innerHTML = "";

        if (listings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="noData">
                        No ${label} Found
                    </td>
                </tr>
            `;
            return;
        }

        listings.forEach(listing => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <span class="listing-name-primary">
                            ${escapeHtml(listing.name)}
                        </span>
                    </td>
                    <td>#${escapeHtml(listing.id)}</td>
                    <td>${escapeHtml(listing.type)}</td>
                    <td>
                        <strong>${escapeHtml(listing.vendorName)}</strong>
                        <br>
                        <small>${escapeHtml(listing.vendorType)}</small>
                    </td>
                    <td>${escapeHtml(listing.subtitle || "-")}</td>
                </tr>
            `;
        });
    }

    function renderBedAvailability(
        vendors,
        availabilityFilter
    ) {
        const section =
            document.getElementById(
                "bedAvailabilitySection"
            );

        if (!availabilityFilter) {
            section.style.display = "none";
            return;
        }

        section.style.display = "block";

        const rooms = vendors.flatMap(vendor =>
            (vendor.bedAvailability || []).map(room => ({
                ...room,
                vendorName: vendor.name
            }))
        ).filter(room =>
            availabilityFilter !== "available"
            || String(room.availability || "")
                .toLowerCase() === "available"
        );

        const totalBeds = rooms.reduce(
            (total, room) =>
                total + Number(room.totalBeds || 0),
            0
        );
        const availableBeds = rooms.reduce(
            (total, room) =>
                String(room.availability || "")
                    .toLowerCase() === "available"
                    ? total + Number(room.totalBeds || 0)
                    : total,
            0
        );

        document.getElementById(
            "bedAvailabilityHeading"
        ).innerText =
            availabilityFilter === "available"
                ? "Available Beds Details"
                : "Total Beds Availability Details";

        document.getElementById(
            "bedAvailabilitySummary"
        ).innerText =
            `${rooms.length} room${
                rooms.length === 1 ? "" : "s"
            }, ${totalBeds} beds, ${availableBeds} available`;

        const tbody =
            document.getElementById(
                "bedAvailabilityTableBody"
            );

        tbody.innerHTML = "";

        if (rooms.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="noData">
                        No Bed Availability Data Found
                    </td>
                </tr>
            `;
            return;
        }

        rooms.forEach(room => {
            const isAvailable =
                String(room.availability || "")
                    .toLowerCase() === "available";

            tbody.innerHTML += `
                <tr>
                    <td>
                        <strong>${escapeHtml(room.vendorName)}</strong>
                    </td>
                    <td>${escapeHtml(room.hospitalName)}</td>
                    <td>${escapeHtml(room.roomType || "-")}</td>
                    <td>
                        <span class="bed-count">
                            ${escapeHtml(room.totalBeds || 0)}
                        </span>
                    </td>
                    <td>
                        <span class="statusBadge ${
                            isAvailable
                                ? "availability-available"
                                : "availability-unavailable"
                        }">
                            ${escapeHtml(room.availability || "Unknown")}
                        </span>
                    </td>
                    <td>
                        <span class="bed-price">
                            &#8377;${Number(
                                room.pricing || 0
                            ).toLocaleString("en-IN")}
                        </span>
                    </td>
                    <td>${escapeHtml(room.details || "-")}</td>
                </tr>
            `;
        });
    }

    async function loadVendors(
        filter = activeVendorFilter
    ) {
        try {
            const response = await fetch('/api/vendors');
            const result = await response.json();
            if (result.success) {
                const filteredVendors =
                    result.vendors.filter(
                        vendor =>
                            matchesVendorFilter(
                                vendor,
                                filter
                            )
                    );
                const tbody =
                    document.getElementById("vendorTableBody");
                tbody.innerHTML = "";
                if (filteredVendors.length === 0) {
                    tbody.innerHTML = `
                    <tr>
                        <td data-label="Name"  colspan="8" class="noData">
                            No ${
                                vendorFilterLabels[filter]
                                || "Vendors"
                            } Found
                        </td>
                    </tr>
                    `;

                    renderFilteredListings(
                        filteredVendors,
                        filter
                    );
                    renderBedAvailability(
                        filteredVendors,
                        activeBedAvailabilityFilter
                    );

                    return;
                }
                filteredVendors.forEach(vendor => {
                    const status = String(vendor.status || '').toLowerCase();
                    const revenue = parseFloat(vendor.revenue || 0);
                    tbody.innerHTML += `
                    <tr>
                        <td data-label="Name" >
                            <img 
                                src="${resolveUploadImageUrl(vendor.profile_photo)}" 
                                class="profileImage"
                                onerror="this.onerror=null;this.src='/assets/logo.png'"
                            >
                        </td>
                        <td data-label="Name" >
                            <div class="vendorNameBox">
                                <span class="vendorName">
                                    ${vendor.name}
                                </span>
                            </div>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorEmail">
                                ${vendor.emailorcontact}
                            </span>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorType">
                                ${vendor.users_type}
                            </span>
                        </td>
                        <td data-label="Name" >
                            <span class="vendorRevenue">
                                Net Balance:
                                ${formatCurrency(vendor.revenue)}
                                <br>
                                <small>
                                Gross Revenue:
                                ${formatCurrency(vendor.originalRevenue)}
                                </small>
                                <br>
                                <small>
                                Paid:
                                ${formatCurrency(vendor.paidAmount)}
                                </small>
                            </span>
                        </td>
                        <td data-label="Status">
                            <span class="statusBadge ${
                                status === 'approved'
                                    ? 'activeStatus'
                                    : status === 'rejected'
                                    ? 'rejectedStatus'
                                    : 'pendingStatus'
                            }">
                                ${vendor.status || 'pending'}
                            </span>
                        </td>
                        <td data-label="Actions">
                            <div class="actionButtons">
                                <button
                                    class="viewBtn"
                                    onclick="viewVendorDetails(${vendor.id})"
                                >
                                    <i class="fa-solid fa-eye"></i>
                                    View
                                </button>
                                ${
                                    status === 'approved'
                                    ?
                                    `
                                    <button 
                                        class="deactivateBtn"
                                        title="Reject or Deactivate Vendor"
                                        onclick="updateVendorStatus(
                                            ${vendor.id},
                                            'rejected'
                                        )"
                                    >
                                        <i class="fa-solid fa-ban"></i>
                                        Reject
                                    </button>
                                    <button
                                        class="paymentBtn"
                                        onclick="
                                            makeVendorPayment(
                                                ${vendor.id},
                                                ${revenue}
                                            )
                                        "
                                    >
                                        <i class="fa-solid fa-money-bill"></i>
                                        Make Payment
                                    </button>
                                    `
                                    :
                                    `
                                    <button 
                                        class="approveBtn"
                                        title="Accept and Approve Vendor"
                                        onclick="updateVendorStatus(
                                            ${vendor.id},
                                            'approved'
                                        )"
                                    >
                                        <i class="fa-solid fa-check"></i>
                                        Accept
                                    </button>
                                    <button 
                                        class="deactivateBtn"
                                        title="Reject Vendor"
                                        onclick="updateVendorStatus(
                                            ${vendor.id},
                                            'rejected'
                                        )"
                                    >
                                        <i class="fa-solid fa-xmark"></i>
                                        Reject
                                    </button>
                                    `
                                }
                            </div>
                        </td>
                        <td data-label="Invoice" class="invoiceColumn">
                            <button
                                class="invoiceBtn"
                                onclick="downloadVendorInvoice('${vendor.id}')"
                            >
                                <i class="fa-solid fa-file-invoice"></i>
                                Invoice
                            </button>
                        </td>
                    </tr>
                    `;
                });

                renderFilteredListings(
                    filteredVendors,
                    filter
                );
                renderBedAvailability(
                    filteredVendors,
                    activeBedAvailabilityFilter
                );
            }
            else {
                alert(result.message);
            }
        }
        catch (error) {
            console.log(error);
            alert("Failed to load vendors");
        }
    }

    document.getElementById("vendorSearch").addEventListener("keyup", function(){
        const value = this.value.toLowerCase();
        const rows = document.querySelectorAll("#vendorTableBody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(value) ? "" : "none";
        });
    });

    async function updateVendorStatus(id, status){
        try{
            const response = await fetch(`/api/vendor/status/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            });
            const result = await response.json();
            if(result.success){
                loadVendors();
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    async function loadUsers(){
        try{
            const response = await fetch('/api/users', { credentials: 'include' });
            const result = await response.json();
            if(result.success){
                const tbody = document.getElementById("usersTableBody");
                tbody.innerHTML = "";
                result.users.forEach(user => {
                    tbody.innerHTML += `
                    <tr>
                        <td data-label="Name" >
                            <img 
                                src="${resolveUploadImageUrl(user.profile_photo)}" 
                                class="profileImage"
                                onerror="this.onerror=null;this.src='/assets/logo.png'"
                            >
                        </td>
                        <td data-label="Name" >${user.name}</td>
                        <td data-label="Name" >${user.emailorcontact}</td>
                        <td data-label="Name" >${user.users_type}</td>
                        <td data-label="Name" >
                            <span class="statusBadge activeStatus">
                                ${user.status}
                            </span>
                        </td>
                    </tr>
                    `;
                });
            }
            else{
                alert(result.message);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    document.getElementById("userSearch").addEventListener("keyup", function(){
        const value = this.value.toLowerCase();
        const rows = document.querySelectorAll("#usersTableBody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(value)
                ? ""
                : "none";
        });
    });

    const menuItems = document.querySelectorAll(".menuItem");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            document.querySelector(".nav-title").innerText =
                item.querySelector("span")?.innerText
                || "Dashboard";
        });
    });

    document.getElementById(
        "listingSearch"
    ).addEventListener(
        "keyup",
        function() {
            const value =
                this.value.toLowerCase();
            const rows =
                document.querySelectorAll(
                    "#filteredListingsTableBody tr"
                );

            rows.forEach(row => {
                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(value)
                        ? ""
                        : "none";
            });
        }
    );

    document.getElementById(
        "bedAvailabilitySearch"
    ).addEventListener(
        "keyup",
        function() {
            const value =
                this.value.toLowerCase();
            const rows =
                document.querySelectorAll(
                    "#bedAvailabilityTableBody tr"
                );

            rows.forEach(row => {
                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(value)
                        ? ""
                        : "none";
            });
        }
    );

    async function viewVendorDetails(id) {
        try {
            const response = await fetch(
                `/api/vendor/details/${id}`
            );
            const result = await response.json();
            if (result.success) {
                currentEditingVendor = result;
                const user = result.user;
                const details = result.details || {};
                const modal =
                    document.getElementById(
                        "vendorDetailsModal"
                    );
                const content =
                    document.getElementById(
                        "vendorDetailsContent"
                    );
                const status =
                    String(user.status || "pending")
                        .toLowerCase();
                const profileFallback =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Vendor")}&background=2b6cb0&color=fff`;

                const basicDetails = [
                    ["Vendor ID", user.id],
                    ["Name", user.name],
                    ["Email / Contact", user.emailorcontact],
                    ["User Type", user.users_type],
                    ["Status", user.status]
                ];

                const businessDetails =
                    Object.entries(details || {})
                        .filter(([, value]) =>
                            !isEmptyDetailValue(value)
                        );

                const html = `
                    <div class="vendorDetailHero">
                        <img
                            src="${resolveUploadImageUrl(user.profile_photo)}"
                            class="detailProfileImage"
                            alt="${escapeHtml(user.name || "Vendor")}"
                            onerror="this.src='${profileFallback}'"
                        >
                        <div class="vendorDetailHeroText">
                            <span class="vendorTypePill">
                                ${escapeHtml(user.users_type || "Vendor")}
                            </span>
                            <h3>${escapeHtml(user.name || "Vendor")}</h3>
                            <p>${escapeHtml(user.emailorcontact || "No contact added")}</p>
                        </div>
                        <span class="vendorStatusPill ${status === "approved" ? "isApproved" : "isPending"}">
                            ${escapeHtml(user.status || "pending")}
                        </span>
                    </div>

                    <div class="vendorDetailSection">
                        <div class="vendorDetailSectionTitle">
                            <i class="fa-solid fa-id-card"></i>
                            <span>Account Details</span>
                        </div>
                        <div class="vendorDetailGrid">
                            ${basicDetails
                                .filter(([, value]) =>
                                    !isEmptyDetailValue(value)
                                )
                                .map(([label, value]) =>
                                    renderVendorDetailItem(label, value)
                                )
                                .join("")}
                        </div>
                    </div>

                    <div class="vendorDetailSection">
                        <div class="vendorDetailSectionTitle">
                            <i class="fa-solid fa-briefcase-medical"></i>
                            <span>Business Details</span>
                        </div>
                        ${
                            businessDetails.length
                                ? `
                                    <div class="vendorDetailGrid">
                                        ${businessDetails
                                            .map(([key, value]) =>
                                                renderVendorDetailItem(
                                                    prettifyLabel(key),
                                                    value
                                                )
                                            )
                                            .join("")}
                                    </div>
                                  `
                                : `
                                    <div class="detailEmptyState">
                                        No business details found for this vendor.
                                    </div>
                                  `
                        }
                    </div>

                    <div class="vendorDetailModalFooter" style="display: flex; gap: 12px; justify-content: flex-end; padding: 18px 24px; border-top: 1px solid #E2E8F0; background: #F8FAFC; margin-top: 24px; border-radius: 0 0 16px 16px;">
                        <button 
                            type="button" 
                            class="approveBtn" 
                            style="padding: 9px 18px; font-size: 14px; font-weight: 700; cursor: pointer;"
                            onclick="updateVendorStatus(${user.id}, 'approved'); document.getElementById('vendorDetailsModal').style.display = 'none';"
                        >
                            <i class="fa-solid fa-check"></i> Accept / Approve Vendor
                        </button>
                        <button 
                            type="button" 
                            class="deactivateBtn" 
                            style="padding: 9px 18px; font-size: 14px; font-weight: 700; cursor: pointer;"
                            onclick="updateVendorStatus(${user.id}, 'rejected'); document.getElementById('vendorDetailsModal').style.display = 'none';"
                        >
                            <i class="fa-solid fa-xmark"></i> Reject Vendor
                        </button>
                    </div>
                `;
                content.innerHTML = html;
                modal.style.display = "flex";
            }
            else {
                alert(result.message);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    document.getElementById(
        "closeVendorModal"
    ).addEventListener("click", () => {
        document.getElementById(
            "vendorDetailsModal"
        ).style.display = "none";
    });

    const bookingsBtn = document.getElementById("bookingsBtn");
    if (bookingsBtn) {
        bookingsBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("bookingsSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            bookingsBtn.classList.add("active");
            updateHeaderNav("Bookings Management", "Bookings");
            loadBookings();
        });
    }



    async function loadBookings(){

        try{

            const response =
                await fetch(
                    '/api/admin/bookings'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "bookingsTableBody"
                );

            tbody.innerHTML = "";

            result.bookings.forEach(
                booking => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Booking ID" >
                        #${booking.id}
                    </td>

                    <td data-label="User" >
                        ${booking.user_name}
                    </td>

                    <td data-label="Type" >
                        ${booking.type}
                    </td>

                    <td data-label="Amount" >
                        ₹${booking.total_amount}
                    </td>

                    <td data-label="Status" >
                        ${booking.status}
                    </td>

                    <td data-label="Date" >
                        ${new Date(
                            booking.created_at
                        ).toLocaleDateString()}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    const ordersBtn = document.getElementById("ordersBtn");
    if (ordersBtn) {
        ordersBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("ordersSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            ordersBtn.classList.add("active");
            updateHeaderNav("Orders Management", "Orders");
            loadOrders();
        });
    }

    async function loadOrders(){

        try{

            const response =
                await fetch(
                    '/api/admin/orders'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "ordersTableBody"
                );

            tbody.innerHTML = "";

            result.orders.forEach(order => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Order ID" >
                        #${order.id}
                    </td>

                    <td data-label="User" >
                        ${order.user_name}
                    </td>

                    <td data-label="Type" >
                        ${order.type}
                    </td>

                    <td data-label="Amount" >
                        ₹${order.total_amount}
                    </td>

                    <td data-label="Payment" >
                        ${order.payment_status}
                    </td>

                    <td data-label="Status" >
                        ${order.order_status}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    const revenueBtn = document.getElementById("revenueBtn");
    if (revenueBtn) {
        revenueBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("revenueSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            revenueBtn.classList.add("active");
            updateHeaderNav("Revenue & Finance", "Revenue");
            loadRevenue();
        });
    }

    async function loadRevenue(){

        try{

            const response =
            await fetch(
                '/api/admin/revenue'
            );

            const result =
            await response.json();

            if(!result.success){

                alert(result.message);

                return;

            }

            document.getElementById(
                "incomingAmount"
            ).innerText =
            formatCurrency(result.totalIncoming);

            document.getElementById(
                "vendorPaidAmount"
            ).innerText =
            formatCurrency(result.totalPaid);

            document.getElementById(
                "platformRevenueAmount"
            ).innerText =
            formatCurrency(result.platformRevenue);

            const tbody =
            document.getElementById(
                "revenueTableBody"
            );

            tbody.innerHTML = "";

            result.vendors.forEach(vendor => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Seller Name" >
                        ${vendor.name}
                    </td>

                    <td data-label="Seller Type" >
                        ${vendor.users_type}
                    </td>

                    <td data-label="Incoming" >
                        ${formatCurrency(vendor.originalRevenue)}
                    </td>

                    <td data-label="commission" >
                        ${formatCurrency(vendor.commissionAmount)}
                        (${vendor.commissionPercent}%)
                    </td>

                    <td data-label="Vendor amount" >
                        ${formatCurrency(vendor.vendorAmount)}
                    </td>

                    <td data-label="Paid" >
                        ${formatCurrency(vendor.paidAmount)}
                    </td>

                    <td data-label="Remaining" >
                        ${formatCurrency(vendor.remainingAmount)}
                    </td>

                </tr>
                `;

            });

        }
        catch(error){

            console.log(error);

        }

    }

    const commissionBtn = document.getElementById("commissionBtn");
    if (commissionBtn) {
        commissionBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("netBalanceSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            commissionBtn.classList.add("active");
            updateHeaderNav("Vendor Net Balances", "Net Balance");
            loadNetBalance();
        });
    }


    async function loadNetBalance() {
        try {
            const response =
                await fetch('/api/admin/revenue', { credentials: 'include' });
            const result =
                await response.json();

            if (!result.success) {
                alert(
                    result.message
                    || "Failed to load net balance"
                );
                return;
            }

            document.getElementById(
                "netBalanceAmount"
            ).innerText =
                formatCurrency(result.platformRevenue);

            document.getElementById(
                "netBalanceGrossAmount"
            ).innerText =
                formatCurrency(result.totalIncoming);

            document.getElementById(
                "netBalancePaidAmount"
            ).innerText =
                formatCurrency(result.totalPaid);

            const tbody =
                document.getElementById(
                    "netBalanceTableBody"
                );

            tbody.innerHTML = "";

            result.vendors.forEach(vendor => {
                tbody.innerHTML += `
                    <tr>
                        <td>${vendor.name}</td>
                        <td>${vendor.users_type}</td>
                        <td>${formatCurrency(vendor.originalRevenue)}</td>
                        <td>${formatCurrency(vendor.paidAmount)}</td>
                        <td>${formatCurrency(vendor.remainingAmount)}</td>
                    </tr>
                `;
            });
        }
        catch(error) {
            console.log(error);
            alert("Failed to load net balance");
        }
    }

    async function loadCommissions(){

        try{

            const response =
            await fetch(
                '/api/admin/commissions'
            );

            const result =
            await response.json();

            const tbody =
            document.getElementById(
                "commissionTableBody"
            );

            tbody.innerHTML = "";

            result.commissions.forEach(item => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Name" >
                        ${item.user_type}
                    </td>

                    <td data-label="Name" >

                        <input
                            type="number"
                            value="${item.commission_percent}"
                            id="commission_${item.id}"
                            class="commissionInput"
                        >

                    </td>

                    <td data-label="Name" >

                        <button
                            class="approveBtn"
                            onclick="
                                updateCommission(
                                    ${item.id}
                                )
                            "
                        >

                            Update

                        </button>

        <button
            onclick="
                updateCommission(
                    '${item.user_type}',
                    ${item.id}
                )
            "
            class="approveBtn"
        >
            Save
        </button>

    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    async function updateCommission(
        userType,
        id
    ){

        const commission =
        document.getElementById(
            `commission_${id}`
        ).value;

        const response =
        await fetch(
            '/api/admin/update-commission',
            {

                method:'POST',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    user_type:userType,

                    commission_percent:
                    commission

                })

            }
        );

        const result =
        await response.json();

        if(result.success){

            alert(
                "Commission Updated"
            );

        }
        else{

            alert(
                result.message
            );

        }

    }

    const paymentBtn = document.getElementById("paymentBtn");
    if (paymentBtn) {
        paymentBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("paymentsSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            paymentBtn.classList.add("active");
            updateHeaderNav("Payments Management", "Payments");
            loadPayments();
        });
    }

    async function loadPayments(){

        try{

            const response =
                await fetch(
                    '/api/admin/payments'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "paymentsTableBody"
                );

            tbody.innerHTML = "";

            let totalRevenue = 0;

            result.payments.forEach(payment => {

                totalRevenue +=
                    Number(payment.amount);

                tbody.innerHTML += `
                <tr>

                    <td data-label="Payment ID" >
                        #${payment.id}
                    </td>

                    <td data-label="User Name" >
                        ${payment.user_name}
                    </td>

                    <td data-label="Payment For" >
                        ${payment.payment_for}
                    </td>

                    <td data-label="Method" >
                        ${payment.payment_method}
                    </td>

                    <td data-label="Transaction ID" >
                        ${payment.transaction_id}
                    </td>

                    <td data-label="Amount" >
                        ₹${payment.amount}
                    </td>

                    <td data-label="status" >
                        ${payment.payment_status}
                    </td>

                </tr>
                `;
            });

            document.getElementById(
                "totalRevenue"
            ).innerText =
                `Total Revenue : ₹${totalRevenue}`;

        }
        catch(error){

            console.log(error);

        }

    }

    const productsBtn = document.getElementById("productsBtn");
    if (productsBtn) {
        productsBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("productsSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            productsBtn.classList.add("active");
            updateHeaderNav("Products Inventory", "Products");
            loadProducts();
        });
    }


    async function loadProducts(){

        try{

            const response =
                await fetch(
                    '/api/admin/products'
                );

            const result =
                await response.json();

            const tbody =
                document.getElementById(
                    "productsTableBody"
                );

            tbody.innerHTML = "";

            if(
                result.products.length === 0
            ){

                tbody.innerHTML = `
                <tr>

                    <td data-label="Name" colspan="6">

                        No Products Found

                    </td>

                </tr>
                `;

                return;

            }

            result.products.forEach(product => {

                tbody.innerHTML += `
                <tr>

                    <td data-label="Prodcut ID" >
                        #${product.id}
                    </td>

                    <td data-label="Image" >

                        <img
                            src="${resolveUploadImageUrl(product.image)}"
                            class="profileImage"
                            onerror="this.onerror=null;this.src='/assets/logo.png'"
                        >

                    </td>

                    <td data-label="Product Name" >

                        ${product.product_name}

                        <br>

                        <small>
                            ${product.type}
                        </small>

                    </td>

                    <td data-label="Seller Name" >
                        ${product.vendor_name}
                    </td>

                    <td data-label="Price" >
                        ₹${product.price}
                    </td>

                    <td data-label="Stock" >
                        ${product.stock}
                    </td>

                </tr>
                `;
            });

        }
        catch(error){

            console.log(error);

        }

    }

    function hideAllSections(){

        document.getElementById(
            "vendorsSection"
        ).style.display = "none";

        document.getElementById(
            "usersSection"
        ).style.display = "none";

        document.getElementById(
            "bookingsSection"
        ).style.display = "none";

        document.getElementById(
            "ordersSection"
        ).style.display = "none";

        document.getElementById(
            "paymentsSection"
        ).style.display = "none";

        document.getElementById(
            "productsSection"
        ).style.display = "none";
        
        document.getElementById(
            "commissionSection"
        ).style.display = "none";

        document.getElementById(
            "revenueSection"
        ).style.display = "none";

        document.getElementById(
            "netBalanceSection"
        ).style.display = "none";

        document.getElementById(
            "dashboardSection"
        ).style.display = "none";

    }

    async function makeVendorPayment(vendorId, amount){

        try{

            if(!amount || amount <= 0){

                alert("No Revenue Available");

                return;

            }

            const response =
            await fetch(
                '/api/admin/create-vendor-payment',
                {
                    method:'POST',

                    credentials:'include',

                    headers:{
                        'Content-Type':
                        'application/json'
                    },

                    body:JSON.stringify({
                        vendorId,
                        amount
                    })
                }
            );

            const result =
            await response.json();

            if(!result.success){

                alert(
                    result.message
                );

                return;

            }

            const options = {

                key:
                result.key,

                amount:
                result.amount,

                currency:
                "INR",

                name:
                "Hospikare",

                description:
                "Vendor Payment",

                order_id:
                result.orderId,

    handler:
    async function(response){

        const verify =
        await fetch(
            '/api/admin/verify-vendor-payment',
            {

                method:'POST',

                credentials:'include',

                headers:{
                    'Content-Type':
                    'application/json'
                },

                body:JSON.stringify({

                    vendorId,
                    amount,

                    razorpay_payment_id:
                    response
                    .razorpay_payment_id

                })

            }
        );

        const verifyResult =
        await verify.json();

        if(verifyResult.success){

            alert(
                "Payment Successful"
            );

            loadVendors();

        }
        else{

            alert(
                "Payment Save Failed"
            );

        }

    },

                theme:{
                    color:"#3399cc"
                }
            };

            const rzp =
            new Razorpay(options);

            rzp.open();

        }
        catch(error){

            console.log(error);

            alert(
                "Payment Failed"
            );

        }

    }

    function formatInvoiceDate(value) {
        if (!value) {
            return new Date().toLocaleDateString("en-IN");
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getVendorInvoiceStatusClass(status) {
        const normalized =
            String(status || "").toLowerCase();

        if (normalized === "paid") {
            return "isPaid";
        }

        if (normalized.includes("no")) {
            return "isEmpty";
        }

        return "";
    }

    function buildVendorInvoiceHtml(result, options = {}) {
        const vendor = result.vendor || {};
        const summary = result.summary || {};
        const serviceItems = Array.isArray(result.serviceItems) ? result.serviceItems : [];
        
        const invoiceData = {
            isVendor: true,
            invoiceNo: `INV-${new Date().getFullYear()}-${String(vendor.id || "0").padStart(4, "0")}`,
            orderRef: `VND-${vendor.id || "0"}`,
            date: new Date().toLocaleString(),
            status: summary.invoiceStatus || "Unpaid",
            name: vendor.name || "Vendor",
            phone: vendor.emailorcontact || "+91 9999999999",
            address: vendor.address || "As per vendor profile",
            kyc: "Verified Vendor",
            paymentMode: "Bank Transfer",
            txId: "TXN_" + Math.floor(Math.random() * 1000000),
            items: serviceItems.map(i => ({
                name: i.title || "Service",
                qty: i.quantity || 1,
                price: Number(i.amount || 0),
                total: Number(i.amount || 0) * (i.quantity || 1)
            })),
            subtotal: Number(result.total || 0),
            grandTotal: Number(result.total || 0)
        };
        
        let actionsHtml = "";
        if (options.includeActions !== false) {
            actionsHtml = `
            <div style="text-align:center; padding: 20px; background: #f8fafc; margin-top: 20px; border-top: 1px solid #e2e8f0;">
                <button onclick="window.printVendorInvoice()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-right: 10px;">
                    <i class="fa-solid fa-print"></i> Print Invoice
                </button>
            </div>
            `;
        }

        return (window.generateGSTInvoiceHtml ? window.generateGSTInvoiceHtml(invoiceData) : "<h1>Error: Invoice generator missing</h1>") + actionsHtml;
    }

    function closeVendorInvoiceModal() {
        const modal =
            document.getElementById("vendorInvoiceModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        document.body.style.overflow = "";
    }

    async function payVendorInvoice(vendorId, amount) {
        if (!amount || amount <= 0) {
            alert("No Revenue Available");
            return;
        }

        closeVendorInvoiceModal();
        await makeVendorPayment(vendorId, amount);
    }

    function printVendorInvoice() {
        if (!currentVendorInvoicePrintHtml) {
            alert("Invoice data not ready");
            return;
        }

        const printWindow =
            window.open("", "_blank");

        if (!printWindow) {
            alert("Popup blocked. Please allow popups to download invoice.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hospikare Invoice</title>
                <link rel="stylesheet" href="/css/admin.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
                <style>
                    body {
                        margin: 0;
                        background: #f9f9ff;
                    }
                    .vendorInvoiceMain {
                        padding: 24px 20px;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                ${currentVendorInvoicePrintHtml}
                <script>
                    window.addEventListener("load", function() {
                        setTimeout(function() {
                            window.print();
                        }, 250);
                    });
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    async function downloadVendorInvoice(vendorId) {
        try {
            const response =
                await fetch(`/api/admin/vendor-invoice/${vendorId}`);
            const result =
                await response.json();

            if (!result.success) {
                alert(result.message || "Invoice details not found");
                return;
            }

            const modal =
                document.getElementById("vendorInvoiceModal");
            const content =
                document.getElementById("vendorInvoiceContent");

            if (!modal || !content) {
                alert("Invoice view missing");
                return;
            }

            currentVendorInvoicePrintHtml =
                buildVendorInvoiceHtml(result, {
                    includeAppbar: false,
                    includeActions: false
                });

            content.innerHTML =
                buildVendorInvoiceHtml(result);
            modal.classList.add("active");
            document.body.style.overflow = "hidden";

        } catch (error) {
            console.error(error);
            alert("Invoice load karne mein problem aa rahi hai");
        }
    }

    function setupDashboardInteractions() {
        const cardActions = {
            cardTotalUsers: () => document.getElementById("usersBtn")?.click(),
            totalUsers: () => document.getElementById("usersBtn")?.click(),

            cardTotalVendors: () => openVendors("all"),
            totalVendors: () => openVendors("all"),

            cardTotalHospitals: () => openVendors("hospital"),
            totalHospitals: () => openVendors("hospital"),

            cardTotalLabs: () => openVendors("lab"),
            totalLabs: () => openVendors("lab"),

            cardTotalAmbulances: () => openVendors("ambulance"),
            totalAmbulances: () => openVendors("ambulance"),

            cardTotalBookings: () => document.getElementById("bookingsBtn")?.click(),
            totalBookings: () => document.getElementById("bookingsBtn")?.click(),

            cardTotalOrders: () => document.getElementById("ordersBtn")?.click(),
            totalOrders: () => document.getElementById("ordersBtn")?.click(),

            cardTotalProducts: () => document.getElementById("productsBtn")?.click(),
            totalProducts: () => document.getElementById("productsBtn")?.click(),

            cardTotalRevenue: () => document.getElementById("revenueBtn")?.click(),
            dashboardRevenue: () => document.getElementById("revenueBtn")?.click(),

            cardTotalPayments: () => document.getElementById("paymentBtn")?.click(),
            totalPayments: () => document.getElementById("paymentBtn")?.click(),

            cardPendingPayments: () => document.getElementById("revenueBtn")?.click(),
            pendingPayments: () => document.getElementById("revenueBtn")?.click(),

            cardNetBalance: () => document.getElementById("commissionBtn")?.click(),
            dashboardCommission: () => document.getElementById("commissionBtn")?.click(),
        };

        Object.entries(cardActions).forEach(([targetId, action]) => {
            const el = document.getElementById(targetId);
            if (!el) return;

            const card = el.classList.contains("saas-metric-card")
                ? el
                : el.closest(".saas-metric-card");

            if (!card) return;

            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            card.onclick = (e) => {
                action();
            };

            card.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    action();
                }
            };

            const actionBtn = card.querySelector(".saas-card-action-btn");
            if (actionBtn) {
                actionBtn.onclick = (e) => {
                    e.stopPropagation();
                    action();
                };
            }
        });

        // Setup Header Dropdowns & Search
        setupHeaderInteractions();
    }

    function setupHeaderInteractions() {
        const notifBtn = document.getElementById("notificationBtn");
        const notifPanel = document.getElementById("notificationsPanel");
        const profileTrigger = document.getElementById("adminProfileTrigger");
        const profileMenu = document.getElementById("profileDropdownMenu");
        const globalSearch = document.getElementById("globalTopSearch");

        if (notifBtn && notifPanel) {
            notifBtn.onclick = (e) => {
                e.stopPropagation();
                notifPanel.classList.toggle("panel-open");
                if (profileMenu) profileMenu.classList.remove("menu-open");
            };
        }

        if (profileTrigger && profileMenu) {
            profileTrigger.onclick = (e) => {
                e.stopPropagation();
                profileMenu.classList.toggle("menu-open");
                if (notifPanel) notifPanel.classList.remove("panel-open");
            };
        }

        document.addEventListener("click", (e) => {
            if (notifPanel && !notifPanel.contains(e.target) && e.target !== notifBtn) {
                notifPanel.classList.remove("panel-open");
            }
            if (profileMenu && !profileMenu.contains(e.target) && !profileTrigger.contains(e.target)) {
                profileMenu.classList.remove("menu-open");
            }
        });

        if (globalSearch) {
            globalSearch.addEventListener("input", function() {
                const query = this.value.trim().toLowerCase();
                if (!query) {
                    document.querySelectorAll(".saas-metric-card").forEach(c => c.style.display = "");
                    return;
                }

                document.querySelectorAll(".saas-metric-card").forEach(card => {
                    const text = card.innerText.toLowerCase();
                    card.style.display = text.includes(query) ? "" : "none";
                });
            });

            globalSearch.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    const val = this.value.trim().toLowerCase();
                    if (val.includes("user")) document.getElementById("usersBtn")?.click();
                    else if (val.includes("vendor")) openVendors("all");
                    else if (val.includes("hosp")) openVendors("hospital");
                    else if (val.includes("lab")) openVendors("lab");
                    else if (val.includes("amb")) openVendors("ambulance");
                    else if (val.includes("book")) document.getElementById("bookingsBtn")?.click();
                    else if (val.includes("ord")) document.getElementById("ordersBtn")?.click();
                    else if (val.includes("rev") || val.includes("pay")) document.getElementById("revenueBtn")?.click();
                    else if (val.includes("prod") || val.includes("med")) document.getElementById("productsBtn")?.click();
                }
            });
        }
    }

    function showDashboardError(message) {
        let errorBox = document.getElementById("dashboardError");
        if (!errorBox) {
            errorBox = document.createElement("div");
            errorBox.id = "dashboardError";
            errorBox.className = "dashboard-error";
            errorBox.style.cssText = "background: #FEE2E2; color: #DC2626; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; font-weight: 600; border: 1px solid #FECACA; display: flex; align-items: center; gap: 10px;";
            document.getElementById("dashboardSection")?.prepend(errorBox);
        }
        errorBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${escapeHtml(message)}</span>`;
        errorBox.style.display = "flex";
    }

    function clearDashboardError() {
        const errorBox = document.getElementById("dashboardError");
        if (errorBox) {
            errorBox.style.display = "none";
        }
    }

    setupDashboardInteractions();

    const dashboardDateFilterBtn =
        document.getElementById("dashboardDateFilterBtn");
    const dashboardDateFilterPanel =
        document.getElementById("dashboardDateFilterPanel");
    const dashboardDateFilterText =
        document.getElementById("dashboardDateFilterText");
    const dashboardDateFrom =
        document.getElementById("dashboardDateFrom");
    const dashboardDateTo =
        document.getElementById("dashboardDateTo");
    const dashboardDateMonth =
        document.getElementById("dashboardDateMonth");
    const dashboardDateYear =
        document.getElementById("dashboardDateYear");
    const dashboardDateModeInputs =
        document.querySelectorAll(
            "input[name='dashboardDateFilterMode']"
        );
    const dashboardDateModeFields =
        document.querySelectorAll(
            "#dashboardDateFilterPanel [data-date-mode-field]"
        );
    const dashboardDateFilterError =
        document.getElementById("dashboardDateFilterError");
    const dashboardChartRangeText =
        document.getElementById("dashboardChartRangeText");
    let appliedDashboardDateFrom = "";
    let appliedDashboardDateTo = "";
    let appliedDashboardRangeLabel = "All Time";

    function formatDashboardDate(value) {
        if (!value) {
            return "";
        }

        const [year, month, day] =
            value.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            day
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function formatDashboardMonth(value) {
        if (!value) {
            return "";
        }

        const [year, month] =
            value.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            1
        ).toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );
    }

    function padDashboardDatePart(value) {
        return String(value).padStart(2, "0");
    }

    function getDashboardMonthRange(value) {
        const [year, month] =
            value.split("-").map(Number);

        const lastDay =
            new Date(year, month, 0).getDate();

        return {
            from:
                `${year}-${padDashboardDatePart(month)}-01`,
            to:
                `${year}-${padDashboardDatePart(month)}-${padDashboardDatePart(lastDay)}`
        };
    }

    function populateDashboardYears() {
        if (!dashboardDateYear) {
            return;
        }

        const currentYear =
            new Date().getFullYear();

        dashboardDateYear.innerHTML =
            `<option value="">Select year</option>`;

        for (
            let year = currentYear + 1;
            year >= currentYear - 8;
            year--
        ) {
            dashboardDateYear.innerHTML +=
                `<option value="${year}">${year}</option>`;
        }
    }

    function getDashboardSelectedDateMode() {
        const selected =
            document.querySelector(
                "input[name='dashboardDateFilterMode']:checked"
            );

        return selected ? selected.value : "date";
    }

    function setDashboardDateMode(mode) {
        dashboardDateModeFields.forEach(field => {
            field.hidden =
                field.dataset.dateModeField !== mode;
        });
        dashboardDateFilterError.innerText = "";
    }

    function updateDashboardRangeLabel() {
        dashboardDateFilterText.innerText =
            appliedDashboardRangeLabel;

        if (dashboardChartRangeText) {
            dashboardChartRangeText.innerText =
                appliedDashboardRangeLabel;
        }
    }

    function getDashboardDateRangeLabel(from, to) {
        if (from && to) {
            return from === to
                ? formatDashboardDate(from)
                : `${formatDashboardDate(from)} - ${formatDashboardDate(to)}`;
        }

        if (from) {
            return `From ${formatDashboardDate(from)}`;
        }

        if (to) {
            return `Up to ${formatDashboardDate(to)}`;
        }

        return "All Time";
    }

    function setDashboardDatePanelOpen(isOpen) {
        dashboardDateFilterPanel.hidden = !isOpen;
        dashboardDateFilterBtn.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }

    function applyDashboardDateFilter() {
        const selectedMode =
            getDashboardSelectedDateMode();

        let nextDateFrom = "";
        let nextDateTo = "";
        let nextRangeLabel = "All Time";

        if (selectedMode === "date") {
            if (
                dashboardDateFrom.value
                && dashboardDateTo.value
                && dashboardDateFrom.value
                    > dashboardDateTo.value
            ) {
                dashboardDateFilterError.innerText =
                    "From Date cannot be after To Date.";
                return;
            }

            nextDateFrom =
                dashboardDateFrom.value;
            nextDateTo =
                dashboardDateTo.value;
            nextRangeLabel =
                getDashboardDateRangeLabel(
                    nextDateFrom,
                    nextDateTo
                );
        }
        else if (selectedMode === "month") {
            if (!dashboardDateMonth.value) {
                dashboardDateFilterError.innerText =
                    "Please select a month.";
                return;
            }

            const range =
                getDashboardMonthRange(
                    dashboardDateMonth.value
                );

            nextDateFrom = range.from;
            nextDateTo = range.to;
            nextRangeLabel =
                formatDashboardMonth(
                    dashboardDateMonth.value
                );
        }
        else if (selectedMode === "year") {
            if (!dashboardDateYear.value) {
                dashboardDateFilterError.innerText =
                    "Please select a year.";
                return;
            }

            nextDateFrom =
                `${dashboardDateYear.value}-01-01`;
            nextDateTo =
                `${dashboardDateYear.value}-12-31`;
            nextRangeLabel =
                `Year ${dashboardDateYear.value}`;
        }

        dashboardDateFilterError.innerText = "";
        appliedDashboardDateFrom = nextDateFrom;
        appliedDashboardDateTo = nextDateTo;
        appliedDashboardRangeLabel = nextRangeLabel;

        updateDashboardRangeLabel();
        setDashboardDatePanelOpen(false);

        document.getElementById(
            "dashboardBtn"
        ).click();
    }

    dashboardDateFilterBtn.addEventListener(
        "click",
        () => {
            setDashboardDatePanelOpen(
                dashboardDateFilterPanel.hidden
            );
        }
    );

    dashboardDateModeInputs.forEach(input => {
        input.addEventListener(
            "change",
            () => setDashboardDateMode(input.value)
        );
    });

    document.getElementById(
        "applyDashboardDateFilter"
    ).addEventListener(
        "click",
        applyDashboardDateFilter
    );

    document.getElementById(
        "clearDashboardDateFilter"
    ).addEventListener(
        "click",
        () => {
            dashboardDateFrom.value = "";
            dashboardDateTo.value = "";
            dashboardDateMonth.value = "";
            dashboardDateYear.value = "";
            appliedDashboardDateFrom = "";
            appliedDashboardDateTo = "";
            appliedDashboardRangeLabel = "All Time";
            dashboardDateFilterError.innerText = "";
            updateDashboardRangeLabel();
            setDashboardDatePanelOpen(false);
            document.getElementById(
                "dashboardBtn"
            ).click();
        }
    );

    [
        dashboardDateFrom,
        dashboardDateTo,
        dashboardDateMonth,
        dashboardDateYear
    ]
        .forEach(input => {
            input.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Enter") {
                        applyDashboardDateFilter();
                    }
                }
            );
        });

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    ".dashboard-date-filter"
                )
            ) {
                setDashboardDatePanelOpen(false);
            }
            }
        );

    populateDashboardYears();
    setDashboardDateMode(
        getDashboardSelectedDateMode()
    );
    updateDashboardRangeLabel();

    hideAllSections();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    loadDashboard();

    const dashboardBtn = document.getElementById("dashboardBtn");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
            hideAllSections();
            document.getElementById("dashboardSection").style.display = "block";
            document.querySelectorAll(".menuItem").forEach(item => item.classList.remove("active"));
            dashboardBtn.classList.add("active");
            updateHeaderNav("HospiKare Command Centre", "Dashboard");
            loadDashboard();
        });
    }



    async function loadDashboard() {
        try {
            const dashboardQuery = new URLSearchParams();
            if (appliedDashboardDateFrom) {
                dashboardQuery.set("from", appliedDashboardDateFrom);
            }
            if (appliedDashboardDateTo) {
                dashboardQuery.set("to", appliedDashboardDateTo);
            }

            const response = await fetch(`/api/admin/dashboard?${dashboardQuery.toString()}`);
            const result = await response.json();

            if (!result.success) {
                showDashboardError(result.message || "Dashboard data could not be loaded.");
                return;
            }

            clearDashboardError();

            const s = result.stats || {};
            const pa = result.pendingActions || {};
            const sp = result.servicePerformance || {};
            const recentBookings = result.recentBookings || [];
            const recentVendors = result.recentVendors || [];
            const recentOrders = result.recentOrders || [];

            const numberValue = value => Number(value || 0);

            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) {
                    el.innerText = val;
                }
            };

            // 1. Set 12 Summary Cards
            set("totalUsers", numberValue(s.totalUsers).toLocaleString("en-IN"));
            set("totalVendors", numberValue(s.totalVendors || s.approvedVendors).toLocaleString("en-IN"));
            set("totalHospitals", numberValue(s.hospitals).toLocaleString("en-IN"));
            set("totalLabs", numberValue(s.labs).toLocaleString("en-IN"));
            set("totalAmbulances", numberValue(s.ambulances).toLocaleString("en-IN"));
            set("totalBookings", numberValue(s.totalBookings || s.bookings).toLocaleString("en-IN"));
            set("totalOrders", numberValue(s.totalOrders || s.orders).toLocaleString("en-IN"));
            set("totalProducts", numberValue(s.totalProducts || (numberValue(s.medicines) + numberValue(s.equipments))).toLocaleString("en-IN"));
            set("dashboardRevenue", formatCurrency(s.totalRevenue || 0));
            set("totalPayments", formatCurrency(s.totalPayments || s.totalRevenue || 0));
            set("pendingPayments", formatCurrency(s.pendingPayments || 0));
            set("dashboardCommission", formatCurrency(s.totalCommission || s.platformRevenue || s.netBalance || 0));

            // Hidden backward-compatibility nodes
            set("totalInsurance", numberValue(s.insurances));
            set("totalMedicines", numberValue(s.medicines));
            set("totalEquipments", numberValue(s.equipments));
            set("totalBeds", numberValue(s.totalBeds));
            set("availableBeds", numberValue(s.availableBeds));

            // 2. Set Service Performance Cards
            const hospBookingsCount = sp.hospital?.bookings ?? numberValue(s.hospitals);
            const hospRevenueVal = sp.hospital?.revenue ?? numberValue(s.hospitalRevenue);
            const hospTotalBeds = sp.hospital?.totalBeds ?? numberValue(s.totalBeds);
            const hospAvailBeds = sp.hospital?.availableBeds ?? numberValue(s.availableBeds);
            const bedPercent = hospTotalBeds > 0 ? Math.round((hospAvailBeds / hospTotalBeds) * 100) : 0;

            set("perfHospBookings", hospBookingsCount.toLocaleString("en-IN"));
            set("perfHospRevenue", formatCurrency(hospRevenueVal));
            set("perfHospitalBadge", `${numberValue(s.hospitals)} Facilities`);
            set("perfHospBeds", `${hospAvailBeds} / ${hospTotalBeds} Available (${bedPercent}%)`);
            const bedFillEl = document.getElementById("perfHospBedFill");
            if (bedFillEl) bedFillEl.style.width = `${Math.min(Math.max(bedPercent, 5), 100)}%`;

            const labBookingsCount = sp.lab?.bookings ?? numberValue(s.labs);
            const labRevenueVal = sp.lab?.revenue ?? numberValue(s.labRevenue);
            set("perfLabBookings", labBookingsCount.toLocaleString("en-IN"));
            set("perfLabRevenue", formatCurrency(labRevenueVal));
            set("perfLabBadge", `${numberValue(s.labs)} Labs`);

            const ambBookingsCount = sp.ambulance?.bookings ?? numberValue(s.ambulances);
            const ambRevenueVal = sp.ambulance?.revenue ?? numberValue(s.ambulanceRevenue);
            set("perfAmbBookings", ambBookingsCount.toLocaleString("en-IN"));
            set("perfAmbRevenue", formatCurrency(ambRevenueVal));
            set("perfAmbBadge", `${numberValue(s.ambulances)} Units`);

            const prdOrdersCount = sp.products?.orders ?? (numberValue(s.medicines) + numberValue(s.equipments));
            const prdRevenueVal = sp.products?.revenue ?? (numberValue(s.medicinesRevenue) + numberValue(s.equipmentsRevenue));
            const prdTotalStock = s.totalProducts || (numberValue(s.medicines) + numberValue(s.equipments));
            set("perfPrdOrders", prdOrdersCount.toLocaleString("en-IN"));
            set("perfPrdRevenue", formatCurrency(prdRevenueVal));
            set("perfPrdBadge", `${prdTotalStock} Items`);

            // 3. Set Pending Actions Hub
            const pVendors = numberValue(pa.vendorApprovals || s.pendingVendors || 0);
            const pPayouts = numberValue(pa.pendingPayments || s.pendingPayments || 0);
            const pBookings = numberValue(pa.bookingRequests || s.pendingBookings || 0);
            const cBookings = numberValue(pa.cancelledBookings || s.cancelledBookings || 0);
            const totalPendingItems = pVendors + (pPayouts > 0 ? 1 : 0) + pBookings + cBookings;

            set("pendingVendorCount", pVendors.toString());
            set("pendingPayoutCount", formatCurrency(pPayouts));
            set("pendingBookingCount", pBookings.toString());
            set("cancelledBookingCount", cBookings.toString());
            set("totalPendingBadge", `${totalPendingItems} Pending`);

            // 4. Update Notifications Panel
            const notifBadge = document.getElementById("notificationBadge");
            const notifCountBadge = document.getElementById("notifCountBadge");
            const notifList = document.getElementById("notificationsList");

            if (notifBadge && notifCountBadge && notifList) {
                if (totalPendingItems > 0) {
                    notifBadge.innerText = totalPendingItems.toString();
                    notifBadge.style.display = "flex";
                    notifCountBadge.innerText = `${totalPendingItems} New`;

                    let notifHtml = "";
                    if (pVendors > 0) {
                        notifHtml += `
                            <div class="notification-item" onclick="openVendors('all')">
                                <div class="pending-action-icon" style="background: rgba(217, 119, 6, 0.12); color: #D97706; width: 32px; height: 32px;">
                                    <i class="fa-solid fa-user-plus"></i>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: 700;">${pVendors} Vendor Approval${pVendors > 1 ? "s" : ""}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Awaiting super admin review</div>
                                </div>
                            </div>
                        `;
                    }
                    if (pPayouts > 0) {
                        notifHtml += `
                            <div class="notification-item" onclick="document.getElementById('revenueBtn')?.click()">
                                <div class="pending-action-icon" style="background: rgba(234, 88, 12, 0.12); color: #EA580C; width: 32px; height: 32px;">
                                    <i class="fa-solid fa-money-bill-transfer"></i>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: 700;">Pending Payout: ${formatCurrency(pPayouts)}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Unreleased vendor settlements</div>
                                </div>
                            </div>
                        `;
                    }
                    if (pBookings > 0) {
                        notifHtml += `
                            <div class="notification-item" onclick="document.getElementById('bookingsBtn')?.click()">
                                <div class="pending-action-icon" style="background: rgba(8, 145, 178, 0.12); color: #0891B2; width: 32px; height: 32px;">
                                    <i class="fa-solid fa-calendar-plus"></i>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: 700;">${pBookings} Booking Request${pBookings > 1 ? "s" : ""}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Pending customer bookings</div>
                                </div>
                            </div>
                        `;
                    }
                    if (cBookings > 0) {
                        notifHtml += `
                            <div class="notification-item" onclick="document.getElementById('bookingsBtn')?.click()">
                                <div class="pending-action-icon" style="background: rgba(220, 38, 38, 0.12); color: #DC2626; width: 32px; height: 32px;">
                                    <i class="fa-solid fa-ban"></i>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: 700;">${cBookings} Cancelled Booking${cBookings > 1 ? "s" : ""}</div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Requires refund check</div>
                                </div>
                            </div>
                        `;
                    }
                    notifList.innerHTML = notifHtml;
                } else {
                    notifBadge.style.display = "none";
                    notifCountBadge.innerText = "0 New";
                    notifList.innerHTML = `
                        <div style="padding: 18px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            <i class="fa-regular fa-bell-slash" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                            No pending notifications
                        </div>
                    `;
                }
            }

            // 5. Render Recent Bookings List
            const bookingsListEl = document.getElementById("recentBookingsList");
            if (bookingsListEl) {
                if (recentBookings.length === 0) {
                    bookingsListEl.innerHTML = `
                        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            <i class="fa-solid fa-calendar-xmark" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
                            No recent bookings found
                        </div>
                    `;
                } else {
                    bookingsListEl.innerHTML = recentBookings.map(b => {
                        const status = String(b.status || "confirmed").toLowerCase();
                        const statusClass = status.includes("paid") || status.includes("confirm") || status.includes("complete") ? "pill-paid" : status.includes("cancel") ? "pill-cancelled" : "pill-pending";
                        const patientName = escapeHtml(b.user_name || "Patient");
                        const initial = patientName.charAt(0).toUpperCase() || "P";
                        const dateStr = b.created_at ? formatDashboardDate(b.created_at.slice(0, 10)) : "Recent";
                        const amountStr = formatCurrency(b.total_amount || 0);

                        return `
                            <div class="inner-item-card" onclick="document.getElementById('bookingsBtn')?.click()" style="cursor:pointer;" title="Click to view bookings">
                                <div class="inner-item-left">
                                    <div class="inner-item-avatar" style="background: #0891B2;">${initial}</div>
                                    <div class="inner-item-info">
                                        <div class="inner-item-title">${patientName}</div>
                                        <div class="inner-item-meta">
                                            <span class="saas-card-badge" style="padding: 1px 6px; font-size: 10px;">${escapeHtml(b.type || "Booking")}</span>
                                            <span><i class="fa-regular fa-calendar" style="font-size: 10px;"></i> ${dateStr}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="inner-item-right">
                                    <div class="inner-item-amount">${amountStr}</div>
                                    <span class="inner-status-pill ${statusClass}">${escapeHtml(b.status || "Confirmed")}</span>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            }

            // 6. Render Recent Vendors List
            const vendorsListEl = document.getElementById("recentVendorsList");
            if (vendorsListEl) {
                if (recentVendors.length === 0) {
                    vendorsListEl.innerHTML = `
                        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            <i class="fa-solid fa-store-slash" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
                            No recent vendors found
                        </div>
                    `;
                } else {
                    vendorsListEl.innerHTML = recentVendors.map(v => {
                        const status = String(v.status || "pending").toLowerCase();
                        const statusClass = status === "approved" || status === "active" ? "pill-approved" : status === "rejected" ? "pill-rejected" : "pill-pending";
                        const vendorName = escapeHtml(v.name || "Healthcare Vendor");
                        const initial = vendorName.charAt(0).toUpperCase() || "V";
                        const dateStr = v.created_at ? formatDashboardDate(v.created_at.slice(0, 10)) : "Partner";
                        const photoUrl = v.profile_photo ? resolveUploadImageUrl(v.profile_photo) : null;

                        return `
                            <div class="inner-item-card" onclick="viewVendorDetails(${v.id})" style="cursor:pointer;" title="Click to view profile">
                                <div class="inner-item-left">
                                    <div class="inner-item-avatar" style="background: #059669;">
                                        ${photoUrl ? `<img src="${photoUrl}" alt="${vendorName}" onerror="this.parentElement.innerHTML='${initial}'">` : initial}
                                    </div>
                                    <div class="inner-item-info">
                                        <div class="inner-item-title">${vendorName}</div>
                                        <div class="inner-item-meta">
                                            <span class="saas-card-badge" style="padding: 1px 6px; font-size: 10px;">${escapeHtml(v.users_type || "Vendor")}</span>
                                            <span>Joined ${dateStr}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="inner-item-right">
                                    <span class="inner-status-pill ${statusClass}">${escapeHtml(v.status || "Pending")}</span>
                                    <button class="saas-card-action-btn" type="button" style="font-size: 11px; margin-top: 4px;" onclick="event.stopPropagation(); viewVendorDetails(${v.id});">
                                        Profile <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            }

            // 7. Render Recent Orders List
            const ordersListEl = document.getElementById("recentOrdersList");
            if (ordersListEl) {
                if (recentOrders.length === 0) {
                    ordersListEl.innerHTML = `
                        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            <i class="fa-solid fa-box-open" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
                            No recent orders found
                        </div>
                    `;
                } else {
                    ordersListEl.innerHTML = recentOrders.map(o => {
                        const payStatus = String(o.payment_status || "pending").toLowerCase();
                        const payClass = payStatus === "paid" ? "pill-paid" : "pill-pending";
                        const custName = escapeHtml(o.user_name || "Customer");
                        const initial = custName.charAt(0).toUpperCase() || "C";
                        const orderCode = `#${o.type === 'Medicine' ? 'MED' : 'EQP'}-${o.id}`;
                        const amountStr = formatCurrency(o.total_amount || 0);

                        return `
                            <div class="inner-item-card" onclick="document.getElementById('ordersBtn')?.click()" style="cursor:pointer;" title="Click to view orders">
                                <div class="inner-item-left">
                                    <div class="inner-item-avatar" style="background: #4F46E5;">${initial}</div>
                                    <div class="inner-item-info">
                                        <div class="inner-item-title">${custName}</div>
                                        <div class="inner-item-meta">
                                            <span class="saas-card-badge" style="padding: 1px 6px; font-size: 10px; font-weight: 800;">${orderCode}</span>
                                            <span>${escapeHtml(o.type || "Product")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="inner-item-right">
                                    <div class="inner-item-amount">${amountStr}</div>
                                    <div style="display: flex; gap: 4px;">
                                        <span class="inner-status-pill ${payClass}">${escapeHtml(o.payment_status || "Pending")}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            }

            // 8. Render Modern Theme-Adaptive Charts
            renderDashboardCharts(s, result.timelineTrend || []);

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            showDashboardError("Dashboard data could not be loaded. Please check your connection and refresh.");
        }
    }

    // Global chart instances & state
    let serviceDonutChartInstance = null;
    let performanceTrendChartInstance = null;
    let cachedDashboardStats = null;
    let cachedTimelineTrend = [];
    let currentPerfFilter = 'all';
    let donutCounterAnimTimer = null;

    function renderDashboardCharts(s, timelineTrend = []) {
        cachedDashboardStats = s || cachedDashboardStats || {};
        if (Array.isArray(timelineTrend) && timelineTrend.length > 0) {
            cachedTimelineTrend = timelineTrend;
        }

        if (typeof Chart === "undefined") {
            console.warn("Chart.js is not loaded.");
            return;
        }

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#94A3B8" : "#64748B";
        const headingColor = isDark ? "#F8FAFC" : "#0F172A";
        const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(226, 232, 240, 0.8)";
        const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif";

        /* =========================================================================
           GRAPH 1: ANIMATED SERVICE NETWORK DONUT CHART
           ========================================================================= */
        renderServiceDonutChart(cachedDashboardStats, isDark, surfaceColor, headingColor, textColor);

        /* =========================================================================
           GRAPH 2: ANIMATED BOOKINGS & REVENUE PERFORMANCE COMBINED CHART
           ========================================================================= */
        renderPerformanceTrendChart(cachedTimelineTrend, isDark, surfaceColor, headingColor, textColor, gridColor, currentPerfFilter);
    }

    function renderServiceDonutChart(s, isDark, surfaceColor, headingColor, textColor) {
        const canvas = document.getElementById("serviceDonutChart");
        if (!canvas) return;

        if (serviceDonutChartInstance) {
            serviceDonutChartInstance.destroy();
            serviceDonutChartInstance = null;
        }

        const numberValue = val => Number(val || 0);
        const labels = ['Hospitals', 'Labs', 'Ambulances', 'Insurance', 'Medicines', 'Equipment'];
        const rawValues = [
            numberValue(s.hospitals),
            numberValue(s.labs),
            numberValue(s.ambulances),
            numberValue(s.insurances),
            numberValue(s.medicines),
            numberValue(s.equipments)
        ];

        const colors = [
            '#7C3AED', // Hospitals - Purple
            '#D97706', // Labs - Amber
            '#DC2626', // Ambulances - Coral Red
            '#059669', // Insurance - Emerald
            '#4F46E5', // Medicines - Indigo
            '#0891B2'  // Equipment - Cyan
        ];

        const totalCount = rawValues.reduce((a, b) => a + b, 0);

        // Animate Center Number
        animateDonutCenterNumber(totalCount, "Total Services", "100% Network");

        // Generate Custom Interactive Legend
        renderDonutCustomLegend(labels, rawValues, colors, totalCount);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        serviceDonutChartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: rawValues,
                    backgroundColor: colors,
                    borderColor: isDark ? '#0D1B30' : '#FFFFFF',
                    borderWidth: 3,
                    hoverBorderColor: isDark ? '#0D1B30' : '#FFFFFF',
                    hoverBorderWidth: 4,
                    hoverOffset: 12,
                    borderRadius: 8,
                    spacing: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                animation: prefersReducedMotion ? false : {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1300,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false // Using custom interactive legend below
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        titleColor: isDark ? '#F8FAFC' : '#0F172A',
                        bodyColor: isDark ? '#94A3B8' : '#475569',
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        titleFont: { size: 13, weight: '700' },
                        bodyFont: { size: 12, weight: '600' },
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                const val = ctx.raw || 0;
                                const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
                                return ` ${ctx.label}: ${val.toLocaleString('en-IN')} units (${pct}%)`;
                            }
                        }
                    }
                },
                onHover: (event, elements) => {
                    const centerNum = document.getElementById("donutCenterNumber");
                    const centerLbl = document.getElementById("donutCenterLabel");
                    const centerSub = document.getElementById("donutCenterSubtext");
                    if (!centerNum || !centerLbl || !centerSub) return;

                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        const val = rawValues[idx];
                        const label = labels[idx];
                        const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
                        
                        centerNum.textContent = val.toLocaleString('en-IN');
                        centerNum.style.color = colors[idx];
                        centerLbl.textContent = label;
                        centerSub.textContent = `${pct}% of Network`;
                        centerSub.style.color = colors[idx];
                    } else {
                        // Revert to Total
                        const visibleTotal = getDonutVisibleTotal();
                        centerNum.textContent = visibleTotal.toLocaleString('en-IN');
                        centerNum.style.color = '';
                        centerLbl.textContent = "Total Services";
                        centerSub.textContent = "100% Network";
                        centerSub.style.color = '';
                    }
                }
            }
        });
    }

    function animateDonutCenterNumber(targetVal, labelText, subtext) {
        const centerNum = document.getElementById("donutCenterNumber");
        const centerLbl = document.getElementById("donutCenterLabel");
        const centerSub = document.getElementById("donutCenterSubtext");
        if (!centerNum) return;

        if (centerLbl) centerLbl.textContent = labelText || "Total Services";
        if (centerSub) centerSub.textContent = subtext || "100% Network";

        if (donutCounterAnimTimer) clearInterval(donutCounterAnimTimer);

        if (targetVal <= 0) {
            centerNum.textContent = "0";
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            centerNum.textContent = targetVal.toLocaleString('en-IN');
            return;
        }

        let start = 0;
        const duration = 1000;
        const steps = 30;
        const stepTime = duration / steps;
        const increment = targetVal / steps;

        donutCounterAnimTimer = setInterval(() => {
            start += increment;
            if (start >= targetVal) {
                start = targetVal;
                clearInterval(donutCounterAnimTimer);
            }
            centerNum.textContent = Math.round(start).toLocaleString('en-IN');
        }, stepTime);
    }

    function getDonutVisibleTotal() {
        if (!serviceDonutChartInstance) return 0;
        const dataset = serviceDonutChartInstance.data.datasets[0];
        let total = 0;
        dataset.data.forEach((val, idx) => {
            if (serviceDonutChartInstance.getDataVisibility(idx)) {
                total += Number(val || 0);
            }
        });
        return total;
    }

    function renderDonutCustomLegend(labels, values, colors, totalCount) {
        const legendContainer = document.getElementById("donutCustomLegend");
        if (!legendContainer) return;

        legendContainer.innerHTML = labels.map((label, idx) => {
            const val = values[idx] || 0;
            const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
            return `
                <div class="legend-badge-item" data-index="${idx}" onclick="toggleDonutSegment(${idx}, this)" title="Click to show/hide ${label}">
                    <div class="legend-badge-left">
                        <span class="legend-dot" style="background-color: ${colors[idx]};"></span>
                        <span>${label}</span>
                    </div>
                    <div class="legend-badge-val">${val} <span style="font-size: 10.5px; opacity: 0.7; font-weight: 500;">(${pct}%)</span></div>
                </div>
            `;
        }).join("");
    }

    window.toggleDonutSegment = function(idx, element) {
        if (!serviceDonutChartInstance) return;
        const isVisible = serviceDonutChartInstance.getDataVisibility(idx);
        serviceDonutChartInstance.toggleDataVisibility(idx);
        serviceDonutChartInstance.update();

        if (element) {
            element.classList.toggle('legend-hidden', isVisible);
        }

        const newTotal = getDonutVisibleTotal();
        const centerNum = document.getElementById("donutCenterNumber");
        if (centerNum) {
            centerNum.textContent = newTotal.toLocaleString('en-IN');
        }
    };

    window.resetDonutFilters = function() {
        if (!serviceDonutChartInstance) return;
        serviceDonutChartInstance.data.datasets[0].data.forEach((_, idx) => {
            if (!serviceDonutChartInstance.getDataVisibility(idx)) {
                serviceDonutChartInstance.toggleDataVisibility(idx);
            }
        });
        serviceDonutChartInstance.update();
        document.querySelectorAll('.legend-badge-item').forEach(el => el.classList.remove('legend-hidden'));
        const total = getDonutVisibleTotal();
        const centerNum = document.getElementById("donutCenterNumber");
        if (centerNum) centerNum.textContent = total.toLocaleString('en-IN');
        const menu = document.getElementById("donutMenu");
        if (menu) menu.classList.remove("show");
    };

    function renderPerformanceTrendChart(timelineTrend, isDark, surfaceColor, headingColor, textColor, gridColor, filterRange = 'all') {
        const canvas = document.getElementById("performanceTrendChart");
        const emptyState = document.getElementById("perfChartEmptyState");
        const skeleton = document.getElementById("perfChartSkeleton");
        if (!canvas) return;

        if (performanceTrendChartInstance) {
            performanceTrendChartInstance.destroy();
            performanceTrendChartInstance = null;
        }

        if (skeleton) skeleton.style.display = "none";

        let filtered = Array.isArray(timelineTrend) ? [...timelineTrend] : [];

        // Filter timeline points by active range if provided
        if (filtered.length > 0 && filterRange !== 'all') {
            const now = new Date();
            if (filterRange === 'year') {
                const curYear = String(now.getFullYear());
                filtered = filtered.filter(item => (item.ym || "").startsWith(curYear));
            } else if (filterRange === '90d') {
                // Last 6 months
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(now.getMonth() - 6);
                filtered = filtered.filter(item => {
                    const itemDate = new Date((item.ym || "") + "-01");
                    return itemDate >= sixMonthsAgo;
                });
            } else if (filterRange === '30d') {
                // Current month
                const curYm = now.toISOString().slice(0, 7);
                filtered = filtered.filter(item => (item.ym || "") === curYm);
            } else if (filterRange === '7d' || filterRange === 'today') {
                // Recent records
                filtered = filtered.slice(-7);
            }
        }

        // If no timeline records, construct from cached stats as fallback
        if (filtered.length === 0) {
            const s = cachedDashboardStats || {};
            const rev = Number(s.totalRevenue || 0);
            const bks = Number(s.totalBookings || s.bookings || 0);
            if (rev > 0 || bks > 0) {
                filtered = [
                    { label: 'Prior Period', bookings: Math.round(bks * 0.4), revenue: Math.round(rev * 0.35) },
                    { label: 'Current Period', bookings: bks, revenue: rev }
                ];
            }
        }

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = "flex";
            canvas.style.display = "none";
            return;
        } else {
            if (emptyState) emptyState.style.display = "none";
            canvas.style.display = "block";
        }

        const labels = filtered.map(item => item.label || item.ym || 'Period');
        const bookingsData = filtered.map(item => Number(item.bookings || 0));
        const revenueData = filtered.map(item => Number(item.revenue || 0));

        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 260);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.28)");
        grad.addColorStop(0.8, "rgba(6, 182, 212, 0.04)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0.0)");

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        performanceTrendChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Bookings Volume',
                        data: bookingsData,
                        borderColor: '#06B6D4',
                        backgroundColor: grad,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.38,
                        pointBackgroundColor: '#06B6D4',
                        pointBorderColor: surfaceColor,
                        pointBorderWidth: 2.5,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointHoverBorderWidth: 3,
                        yAxisID: 'yBookings',
                        order: 1
                    },
                    {
                        type: 'bar',
                        label: 'Revenue (₹)',
                        data: revenueData,
                        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.75)' : 'rgba(37, 99, 235, 0.85)',
                        hoverBackgroundColor: '#2563EB',
                        borderRadius: 8,
                        borderSkipped: false,
                        barPercentage: 0.52,
                        categoryPercentage: 0.7,
                        yAxisID: 'yRevenue',
                        order: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                animation: prefersReducedMotion ? false : {
                    duration: 1200,
                    easing: 'easeOutQuart'
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    yRevenue: {
                        type: 'linear',
                        position: 'left',
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            font: { size: 11.5, weight: '600' },
                            callback: function(value) {
                                if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                                if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
                                return '₹' + value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Revenue (₹)',
                            color: textColor,
                            font: { size: 11, weight: '700' }
                        }
                    },
                    yBookings: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            stepSize: 1,
                            font: { size: 11.5, weight: '600' },
                            callback: function(value) {
                                return Number.isInteger(value) ? value + ' bks' : '';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bookings',
                            color: textColor,
                            font: { size: 11, weight: '700' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            borderRadius: 3,
                            usePointStyle: false,
                            padding: 14,
                            color: textColor,
                            font: { size: 12, weight: '700' }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        titleColor: isDark ? '#F8FAFC' : '#0F172A',
                        bodyColor: isDark ? '#94A3B8' : '#475569',
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        titleFont: { size: 13, weight: '700' },
                        bodyFont: { size: 12, weight: '600' },
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                if (ctx.dataset.yAxisID === 'yRevenue') {
                                    return ` ${ctx.dataset.label}: ₹${Number(ctx.raw || 0).toLocaleString('en-IN')}`;
                                } else {
                                    return ` ${ctx.dataset.label}: ${Number(ctx.raw || 0).toLocaleString('en-IN')} bookings`;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    window.applyPerformanceFilter = function(range, btnElement) {
        currentPerfFilter = range;
        document.querySelectorAll('#perfFilterGroup .filter-pill').forEach(el => el.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        const skeleton = document.getElementById("perfChartSkeleton");
        const canvas = document.getElementById("performanceTrendChart");
        if (skeleton && canvas) {
            skeleton.style.display = "flex";
            canvas.style.display = "none";
        }

        setTimeout(() => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            const textColor = isDark ? "#94A3B8" : "#64748B";
            const headingColor = isDark ? "#F8FAFC" : "#0F172A";
            const gridColor = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(226, 232, 240, 0.8)";
            const surfaceColor = isDark ? "#0D1B30" : "#FFFFFF";

            if (skeleton) skeleton.style.display = "none";
            renderPerformanceTrendChart(cachedTimelineTrend, isDark, surfaceColor, headingColor, textColor, gridColor, range);
        }, 150);
    };

    window.toggleChartMenu = function(menuId) {
        const menu = document.getElementById(menuId);
        if (!menu) return;
        const isShowing = menu.classList.contains('show');
        document.querySelectorAll('.chart-dropdown-menu').forEach(m => m.classList.remove('show'));
        if (!isShowing) {
            menu.classList.add('show');
        }
    };

    window.exportChartAsPNG = function(canvasId, fileName = 'chart.png') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        document.querySelectorAll('.chart-dropdown-menu').forEach(m => m.classList.remove('show'));

        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const bg = isDark ? '#0D1B30' : '#FFFFFF';

        // Create off-screen canvas to guarantee background color in export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const ctx = exportCanvas.getContext('2d');

        // Fill background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw chart canvas
        ctx.drawImage(canvas, 0, 0);

        const dataURL = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Close chart menus on backdrop click
    window.addEventListener("click", (e) => {
        if (!e.target.closest('.chart-action-dropdown')) {
            document.querySelectorAll('.chart-dropdown-menu').forEach(m => m.classList.remove('show'));
        }
    });

    // Re-render charts on theme change
    window.addEventListener("hk-theme-change", () => {
        const dashboardSection = document.getElementById("dashboardSection");
        if (dashboardSection && dashboardSection.style.display !== "none") {
            loadDashboard();
        }
    });

    // Close modals on backdrop click
    window.addEventListener("click", (e) => {
        const vendorModal = document.getElementById("vendorDetailsModal");
        if (vendorModal && e.target === vendorModal) {
            vendorModal.style.display = "none";
        }
        const invoiceModal = document.getElementById("vendorInvoiceModal");
        if (invoiceModal && e.target === invoiceModal) {
            closeVendorInvoiceModal();
        }
    });

    let currentEditingVendor = null;

    // Expose all action handlers globally for inline HTML attributes
    window.openVendors = openVendors;
    window.viewVendorDetails = viewVendorDetails;
    window.updateVendorStatus = updateVendorStatus;
    window.logout = logout;
    window.closeVendorInvoiceModal = closeVendorInvoiceModal;
    window.payVendorInvoice = payVendorInvoice;
    window.printVendorInvoice = printVendorInvoice;
    window.downloadVendorInvoice = downloadVendorInvoice;
    window.loadUsers = loadUsers;
    window.loadBookings = loadBookings;
    window.loadOrders = loadOrders;
    window.loadRevenue = loadRevenue;
    window.loadNetBalance = loadNetBalance;
    window.loadCommissions = loadCommissions;
    window.loadPayments = loadPayments;
    window.loadProducts = loadProducts;
    window.loadDashboard = loadDashboard;
    window.hideAllSections = hideAllSections;
    window.setupDashboardInteractions = setupDashboardInteractions;

// ===== INJECTED BY AI TO OVERRIDE loadOrders WITH DATE FILTERS =====

let hkAllOrdersData = [];

async function loadOrders(){
    try{
        const response = await fetch('/api/admin/orders');
        const result = await response.json();
        
        if(result.success) {
            hkAllOrdersData = result.orders;
            renderOrdersFiltered(hkAllOrdersData);
        }
    }
    catch(error){
        console.log("Orders Load Error", error);
    }
}

window.viewAdminOrder = function(id) {
    const order = hkAllOrdersData.find(o => o.id == id);
    if(!order) return;
    
    let detailsHtml = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
            <div><strong>Order ID:</strong> #${order.id}</div>
            <div><strong>Type:</strong> ${order.type}</div>
            <div><strong>Customer:</strong> ${order.user_name}</div>
            <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</div>
            <div><strong>Total Amount:</strong> Rs. ${order.total_amount}</div>
            <div><strong>Payment Status:</strong> ${order.payment_status}</div>
        </div>
    `;

    if (order.type === 'Medicine' || order.type === 'Equipment') {
        detailsHtml += `
            <div style="margin-bottom:15px;">
                <strong>Delivery Address:</strong><br>
                ${order.delivery_address || 'N/A'}
            </div>
        `;

        if (order.type === 'Medicine' && order.prescription_status) {
            detailsHtml += `
                <div style="margin-bottom:15px;">
                    <strong>Prescription Status:</strong> ${order.prescription_status}<br>
                    ${order.prescription_file ? `<a href="/uploads/${order.prescription_file}" target="_blank" style="color:var(--brand-primary);">View Prescription</a>` : ''}
                </div>
            `;
        }

        let prodStr = 'None';
        if(order.products && Array.isArray(order.products)) {
            prodStr = order.products.map(p => `&bull; ${p.name} (x${p.qty}) - Rs. ${p.price}`).join('<br>');
        } else if (typeof order.products === 'string') {
            try {
                const pArr = JSON.parse(order.products);
                prodStr = pArr.map(p => `&bull; ${p.name} (x${p.qty}) - Rs. ${p.price}`).join('<br>');
            } catch(e){}
        }
        
        detailsHtml += `
            <div style="margin-bottom:20px;">
                <strong>Products:</strong><br>
                ${prodStr}
            </div>
        `;

        const statuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'PACKED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'];
        let statusSelect = `<select id="adminStatusUpdate" style="padding:8px; border-radius:6px; border:1px solid var(--border-color, #e2e8f0); background:var(--card-bg, #ffffff); color:var(--text-main, #1e293b); width:100%; margin-bottom:10px;">`;
        statuses.forEach(s => {
            const sel = ((order.order_status || "").toUpperCase() === s.toUpperCase()) ? 'selected' : '';
            statusSelect += `<option value="${s}" ${sel}>${s}</option>`;
        });
        statusSelect += `</select>`;

        detailsHtml += `
            <div style="background:var(--hk-surface-soft, #f8fafc); padding:15px; border-radius:8px; border: 1px solid var(--border-color, #e2e8f0); color:var(--text-main, #1e293b);">
                <label style="font-weight:600; display:block; margin-bottom:5px;">Update Order Status</label>
                ${statusSelect}
                <button onclick="submitAdminStatusUpdate(${order.id}, '${order.type.toLowerCase()}')" style="padding:8px 16px; background:var(--brand-primary); color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Update Status</button>
            </div>
        `;
    } else {
        detailsHtml += `
            <div style="background:var(--hk-surface-soft, #f8fafc); padding:15px; border-radius:8px; border: 1px solid var(--border-color, #e2e8f0); color:var(--text-main, #1e293b);">
                <label style="font-weight:600; display:block; margin-bottom:5px;">Order Status</label>
                <div>${order.order_status}</div>
                <small style="color:var(--text-muted, #64748b);">(Status updates are only available for Medicine and Equipment orders via this interface)</small>
            </div>
        `;
    }

    document.getElementById('adminOrderModalContent').innerHTML = detailsHtml;
    const modal = document.getElementById('adminOrderModal');
    modal.style.display = 'flex';
};

window.submitAdminStatusUpdate = async function(id, type) {
    const newStatus = document.getElementById('adminStatusUpdate').value;
    try {
        const body = { order_id: id, type: type, order_status: newStatus };
        const response = await fetch('/api/vendor/order/status', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        const result = await response.json();
        if (result.success) {
            alert('Order status updated successfully');
            document.getElementById('adminOrderModal').style.display = 'none';
            // Reload orders
            if(typeof loadOrders === 'function') loadOrders();
        } else {
            alert('Failed to update status');
        }
    } catch(e) {
        alert('Error updating status');
    }
};

function renderOrdersFiltered(ordersArray) {
    const tbody = document.getElementById("ordersTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    
    // Check if the table header has "Action" column, if not, add it
    const thead = tbody.closest('table').querySelector('thead tr');
    if (thead && !thead.innerHTML.includes('Action')) {
        thead.innerHTML += '<th>Action</th>';
    }
    
    if(!ordersArray || ordersArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted, #64748b); padding:30px;">No orders found for selected filter</td></tr>`;
        return;
    }

    ordersArray.forEach(order => {
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleString() : "N/A";
        tbody.innerHTML += `
        <tr>
            <td data-label="Order ID">#${order.id}</td>
            <td data-label="Date">${dateStr}</td>
            <td data-label="User">${order.user_name || 'N/A'}</td>
            <td data-label="Type">${order.type}</td>
            <td data-label="Amount">Rs. ${order.total_amount}</td>
            <td data-label="Payment">
                <span class="status-badge status-pending" style="background: var(--surface-soft); color: var(--brand-primary); padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                    ${order.payment_status || "Pending"}
                </span>
            </td>
            <td data-label="Status">
                <span class="status-badge" style="background: var(--surface-soft); color: var(--brand-secondary); padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
                    ${order.order_status || "Pending"}
                </span>
            </td>
            <td data-label="Action">
                <button onclick="viewAdminOrder(${order.id})" style="padding:4px 8px; border-radius:4px; border:none; background:var(--brand-primary); color:white; cursor:pointer;">View</button>
            </td>
        </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const ordersDateFilter = document.getElementById("ordersDateFilter");
    if(ordersDateFilter) {
        ordersDateFilter.addEventListener("change", (e) => {
            const filter = e.target.value;
            if(filter === "all") {
                renderOrdersFiltered(hkAllOrdersData);
                return;
            }
            
            const now = new Date();
            const filtered = hkAllOrdersData.filter(order => {
                if(!order.created_at) return false;
                const orderDate = new Date(order.created_at);
                
                if(filter === "today") {
                    return orderDate.toDateString() === now.toDateString();
                }
                else if(filter === "yesterday") {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return orderDate.toDateString() === yesterday.toDateString();
                }
                else if(filter === "this_week") {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return orderDate >= weekAgo;
                }
                else if(filter === "this_month") {
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
            renderOrdersFiltered(filtered);
        });
    }
});




