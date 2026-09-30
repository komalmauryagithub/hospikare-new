(function () {
    const SEARCH_SELECTOR = ".nav-center .top-search";
    let observer = null;
    let isApplyingSearch = false;
    let suppressObserver = false;

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getSearchInput() {
        return document.querySelector(SEARCH_SELECTOR);
    }

    function getSearchRoot() {
        return (
            document.getElementById("mainContent")
            || document.getElementById("mainContainer")
        );
    }

    function isVisible(element) {
        if (!element || element.hidden) {
            return false;
        }

        const style = window.getComputedStyle(element);

        return (
            style.display !== "none"
            && style.visibility !== "hidden"
        );
    }

    function getSearchScope(root) {
        const visibleSection = Array.from(root.children)
            .find(child =>
                isVisible(child)
                && (
                    child.matches("section, div, main")
                    || child.querySelector("table, .dashCard, .vendorCard")
                )
            );

        return visibleSection || root;
    }

    function removeEmptyRows(root) {
        root.querySelectorAll("tr[data-vendor-search-empty='true']")
            .forEach(row => row.remove());
    }

    function addEmptyRow(table) {
        const tbody = table.tBodies[0];

        if (!tbody) {
            return;
        }

        const columnCount =
            table.tHead?.rows?.[0]?.cells?.length
            || table.rows?.[0]?.cells?.length
            || 1;
        const row = document.createElement("tr");
        row.dataset.vendorSearchEmpty = "true";
        row.innerHTML = `
            <td colspan="${columnCount}" style="text-align:center; padding:20px; color:var(--text-muted);">
                No matching results
            </td>
        `;
        tbody.appendChild(row);
    }

    function filterTables(root, query) {
        let targetCount = 0;

        root.querySelectorAll("table").forEach(table => {
            const tbody = table.tBodies[0];

            if (!tbody) {
                return;
            }

            const rows = Array.from(tbody.rows)
                .filter(row => row.dataset.vendorSearchEmpty !== "true");

            if (rows.length === 0) {
                return;
            }

            let matchedRows = 0;

            rows.forEach(row => {
                const text = normalize(row.textContent);
                const shouldShow = !query || text.includes(query);
                row.hidden = !shouldShow;
                targetCount++;

                if (shouldShow) {
                    matchedRows++;
                }
            });

            if (query && matchedRows === 0) {
                addEmptyRow(table);
            }
        });

        return targetCount;
    }

    function filterCards(root, query) {
        const cards = Array.from(
            root.querySelectorAll(".dashCard, .vendorCard, .equipmentCard, .medicineCard")
        ).filter(card => !card.closest("table"));

        cards.forEach(card => {
            const shouldShow =
                !query || normalize(card.textContent).includes(query);
            card.hidden = !shouldShow;
        });
    }

    function applyVendorTopSearch() {
        if (isApplyingSearch) {
            return;
        }

        const input = getSearchInput();
        const root = getSearchRoot();

        if (!input || !root) {
            return;
        }

        isApplyingSearch = true;
        suppressObserver = true;
        const query = normalize(input.value);
        removeEmptyRows(root);
        const scope = getSearchScope(root);
        const tableTargetCount = filterTables(scope, query);

        if (tableTargetCount === 0) {
            filterCards(scope, query);
        }
        else if (!query) {
            filterCards(scope, query);
        }

        root.dataset.searchQuery = query;
        isApplyingSearch = false;
        window.requestAnimationFrame(() => {
            suppressObserver = false;
        });
    }

    function setupVendorTopSearch() {
        const input = getSearchInput();
        const root = getSearchRoot();

        if (!input || !root || input.dataset.vendorSearchReady === "true") {
            return;
        }

        input.dataset.vendorSearchReady = "true";
        input.setAttribute("autocomplete", "off");
        input.setAttribute("aria-label", "Search current panel");

        const icon = input.closest(".search-wrapper")?.querySelector("i");

        if (icon) {
            icon.setAttribute("role", "button");
            icon.setAttribute("tabindex", "0");
            icon.setAttribute("title", "Search");
            icon.addEventListener("click", () => {
                input.focus();
                applyVendorTopSearch();
            });
            icon.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    input.focus();
                    applyVendorTopSearch();
                }
            });
        }

        input.addEventListener("input", applyVendorTopSearch);
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                applyVendorTopSearch();
            }

            if (event.key === "Escape") {
                input.value = "";
                applyVendorTopSearch();
            }
        });

        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(() => {
            if (suppressObserver) {
                return;
            }

            window.requestAnimationFrame(applyVendorTopSearch);
        });
        observer.observe(root, {
            childList: true,
            subtree: true
        });

        applyVendorTopSearch();
    }

    window.setupVendorTopSearch = setupVendorTopSearch;
    window.applyVendorTopSearch = applyVendorTopSearch;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupVendorTopSearch);
    }
    else {
        setupVendorTopSearch();
    }
})();

window.setProfileMode = function(mode) {
    const form = document.getElementById('vendorProfileForm');
    if (!form) return;
    const inputs = form.querySelectorAll('input, select, textarea');
    const closeBtn = document.getElementById('closeProfileBtn');
    const editBtn = document.getElementById('enableProfileEditBtn');
    const cancelBtn = document.getElementById('cancelProfileEdit');
    const saveBtn = document.getElementById('saveProfileBtn');

    if (mode === 'view') {
        inputs.forEach(input => input.disabled = true);
        if(closeBtn) closeBtn.style.display = 'block';
        if(editBtn) editBtn.style.display = 'block';
        if(cancelBtn) cancelBtn.style.display = 'none';
        if(saveBtn) saveBtn.style.display = 'none';
    } else {
        inputs.forEach(input => input.disabled = false);
        if(closeBtn) closeBtn.style.display = 'none';
        if(editBtn) editBtn.style.display = 'none';
        if(cancelBtn) cancelBtn.style.display = 'block';
        if(saveBtn) saveBtn.style.display = 'block';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (e) => {
        const btn = e.target.closest('#enableProfileEditBtn');
        if (btn) {
            btn.disabled = true;
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Request...';
            try {
                // Fetch user info to get user id
                const userRes = await fetch('/api/user/profile', { credentials: 'include' });
                const userData = await userRes.json();
                const userId = userData.user?.id;
                
                if (!userId) {
                    alert('Could not verify user session. Please re-login.');
                    btn.disabled = false;
                    btn.innerHTML = origHtml;
                    return;
                }

                const res = await fetch('/api/vendor/request-profile-edit/user/' + userId, { method: 'POST', credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    alert('Edit request sent to Admin successfully!\nOnce Admin approves your request, you will be able to update your profile details.');
                    btn.innerHTML = '<i class="fa-solid fa-clock"></i> Edit Request Pending Admin Approval';
                    btn.style.background = '#94a3b8';
                    btn.style.boxShadow = 'none';
                    btn.style.cursor = 'not-allowed';

                    const bannerContainer = document.getElementById('profileStatusBannerContainer');
                    if (bannerContainer) {
                        bannerContainer.innerHTML = `
                            <div style="padding:12px 16px; background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; font-size:13px; color:#78350f; font-weight:500; display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                                <i class="fa-solid fa-hourglass-half" style="color:#d97706; font-size:18px;"></i>
                                <div style="flex:1;">
                                    <strong>Edit Request Pending Admin Approval.</strong> You have requested permission to update your vendor profile. Once Admin approves the request, the fields will become editable.
                                </div>
                            </div>
                        `;
                    }
                } else {
                    alert(data.message || 'Failed to send edit request.');
                    btn.disabled = false;
                    btn.innerHTML = origHtml;
                }
            } catch (err) {
                console.error('Request edit error:', err);
                alert('Network error while sending edit request to Admin.');
                btn.disabled = false;
                btn.innerHTML = origHtml;
            }
        }
        if (e.target.closest('#cancelProfileEdit')) {
            const triggerText = document.getElementById('profileTriggerText');
            if (triggerText && triggerText.innerText === 'My Profile') {
                window.setProfileMode('view');
            }
        }
        if (e.target.closest('#closeProfileBtn')) {
            const modal = document.getElementById('profileModal');
            if (modal) modal.style.display = 'none';
        }
    });
});
