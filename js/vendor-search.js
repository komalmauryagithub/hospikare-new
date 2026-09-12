(function () {
    const searchInputSelector =
        ".vendorLiveSearchInput[data-search-target]";

    function normalizeText(value) {
        return value
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function filterVendorTable(input) {
        const target =
            document.querySelector(
                input.dataset.searchTarget
            );

        if (!target) {
            return;
        }

        const query =
            normalizeText(input.value);

        Array.from(target.querySelectorAll("tr"))
            .forEach(row => {
                const rowText =
                    normalizeText(row.textContent);

                row.style.display =
                    !query || rowText.includes(query)
                        ? ""
                        : "none";
            });
    }

    function filterAllVendorTables() {
        document.querySelectorAll(searchInputSelector)
            .forEach(filterVendorTable);
    }

    document.addEventListener("input", event => {
        if (event.target.matches(searchInputSelector)) {
            filterVendorTable(event.target);
        }
    });

    let filterFrame;
    const observer =
        new MutationObserver(() => {
            cancelAnimationFrame(filterFrame);
            filterFrame =
                requestAnimationFrame(
                    filterAllVendorTables
                );
        });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    filterAllVendorTables();
})();
