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
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#enableProfileEditBtn')) {
            window.setProfileMode('edit');
        }
        if (e.target.closest('#cancelProfileEdit')) {
            // Revert to view mode. The data will still be what it was unless they refresh,
            // but we can just close the modal or revert mode.
            // Wait, clicking cancel already closes the modal via the native event listener in amb.js.
            // But next time they open, it should be view mode.
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
