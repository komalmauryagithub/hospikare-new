(function () {
    window.createVendorDashboardUi = function createVendorDashboardUi(options = {}) {
        let appliedDateFrom = "";
        let appliedDateTo = "";
        let appliedRangeLabel = "All Time";

        function formatDate(value) {
            if (!value) {
                return "";
            }

            const [year, month, day] = value.split("-").map(Number);

            return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        }

        function formatMonth(value) {
            if (!value) {
                return "";
            }

            const [year, month] = value.split("-").map(Number);

            return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
            });
        }

        function getMonthRange(value) {
            const [year, month] = value.split("-").map(Number);
            const lastDay = new Date(year, month, 0).getDate();
            const paddedMonth = String(month).padStart(2, "0");

            return {
                from: `${year}-${paddedMonth}-01`,
                to: `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`
            };
        }

        function getDateRangeLabel(from, to) {
            if (from && to) {
                return from === to
                    ? formatDate(from)
                    : `${formatDate(from)} - ${formatDate(to)}`;
            }

            if (from) {
                return `From ${formatDate(from)}`;
            }

            if (to) {
                return `Up to ${formatDate(to)}`;
            }

            return "All Time";
        }

        function normalizeRecordDate(value) {
            const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
            return match ? match[0] : "";
        }

        function isWithinRange(value) {
            if (!appliedDateFrom && !appliedDateTo) {
                return true;
            }

            const recordDate = normalizeRecordDate(value);

            if (!recordDate) {
                return false;
            }

            return !(
                (appliedDateFrom && recordDate < appliedDateFrom)
                || (appliedDateTo && recordDate > appliedDateTo)
            );
        }

        function filterRecords(records, dateFields) {
            if (!Array.isArray(records)) {
                return [];
            }

            return records.filter(record => {
                const recordDate = dateFields
                    .map(field => record[field])
                    .find(Boolean);

                return isWithinRange(recordDate);
            });
        }

        function getQueryString() {
            const query = new URLSearchParams();

            if (appliedDateFrom) {
                query.set("dateFrom", appliedDateFrom);
            }

            if (appliedDateTo) {
                query.set("dateTo", appliedDateTo);
            }

            return query.toString() ? `?${query.toString()}` : "";
        }

        function setupDateFilter() {
            const button = document.getElementById("dashboardDateFilterBtn");
            const panel = document.getElementById("dashboardDateFilterPanel");
            const label = document.getElementById("dashboardDateFilterText");
            const fromInput = document.getElementById("dashboardDateFrom");
            const toInput = document.getElementById("dashboardDateTo");
            const monthInput = document.getElementById("dashboardDateMonth");
            const yearInput = document.getElementById("dashboardDateYear");
            const error = document.getElementById("dashboardDateFilterError");
            const applyButton = document.getElementById("applyDashboardDateFilter");
            const clearButton = document.getElementById("clearDashboardDateFilter");
            const modeInputs = document.querySelectorAll(
                "input[name='dashboardDateFilterMode']"
            );
            const modeFields = document.querySelectorAll(
                "#dashboardDateFilterPanel [data-date-mode-field]"
            );

            if (!button || !panel || !label) {
                return;
            }

            const setOpen = isOpen => {
                panel.hidden = !isOpen;
                button.setAttribute("aria-expanded", String(isOpen));
            };

            const setMode = mode => {
                modeFields.forEach(field => {
                    field.hidden = field.dataset.dateModeField !== mode;
                });
                error.innerText = "";
            };

            const getMode = () => (
                document.querySelector(
                    "input[name='dashboardDateFilterMode']:checked"
                )?.value || "date"
            );

            const reload = () => {
                if (typeof options.reload === "function") {
                    options.reload();
                }
            };

            const apply = () => {
                const mode = getMode();
                let nextFrom = "";
                let nextTo = "";
                let nextLabel = "All Time";

                if (mode === "date") {
                    if (
                        fromInput.value
                        && toInput.value
                        && fromInput.value > toInput.value
                    ) {
                        error.innerText = "From Date cannot be after To Date.";
                        return;
                    }

                    nextFrom = fromInput.value;
                    nextTo = toInput.value;
                    nextLabel = getDateRangeLabel(nextFrom, nextTo);
                }
                else if (mode === "month") {
                    if (!monthInput.value) {
                        error.innerText = "Please select a month.";
                        return;
                    }

                    const range = getMonthRange(monthInput.value);
                    nextFrom = range.from;
                    nextTo = range.to;
                    nextLabel = formatMonth(monthInput.value);
                }
                else {
                    if (!yearInput.value) {
                        error.innerText = "Please select a year.";
                        return;
                    }

                    nextFrom = `${yearInput.value}-01-01`;
                    nextTo = `${yearInput.value}-12-31`;
                    nextLabel = `Year ${yearInput.value}`;
                }

                appliedDateFrom = nextFrom;
                appliedDateTo = nextTo;
                appliedRangeLabel = nextLabel;
                error.innerText = "";
                label.innerText = appliedRangeLabel;
                setOpen(false);
                reload();
            };

            const currentYear = new Date().getFullYear();
            yearInput.innerHTML = `<option value="">Select year</option>`;

            for (let year = currentYear + 1; year >= currentYear - 8; year--) {
                yearInput.innerHTML += `<option value="${year}">${year}</option>`;
            }

            button.addEventListener("click", () => setOpen(panel.hidden));
            modeInputs.forEach(input => {
                input.addEventListener("change", () => setMode(input.value));
            });
            applyButton.addEventListener("click", apply);
            clearButton.addEventListener("click", () => {
                fromInput.value = "";
                toInput.value = "";
                monthInput.value = "";
                yearInput.value = "";
                appliedDateFrom = "";
                appliedDateTo = "";
                appliedRangeLabel = "All Time";
                error.innerText = "";
                label.innerText = appliedRangeLabel;
                setOpen(false);
                reload();
            });

            [fromInput, toInput, monthInput, yearInput].forEach(input => {
                input.addEventListener("keydown", event => {
                    if (event.key === "Enter") {
                        apply();
                    }
                });
            });

            document.addEventListener("click", event => {
                if (!event.target.closest(".dashboard-date-filter")) {
                    setOpen(false);
                }
            });

            setMode(getMode());
            label.innerText = appliedRangeLabel;
        }

        function setupLinks(root = document) {
            root.querySelectorAll("[data-dashboard-target]").forEach(item => {
                if (item.dataset.dashboardLinkReady === "true") {
                    return;
                }

                const target = document.getElementById(item.dataset.dashboardTarget);

                if (!target) {
                    return;
                }

                item.dataset.dashboardLinkReady = "true";
                item.classList.add("clickable-card");
                item.setAttribute("role", "button");
                item.setAttribute("tabindex", "0");

                const openTarget = () => target.click();

                item.addEventListener("click", event => {
                    if (event.target.closest("a, button, input, select, textarea")) {
                        return;
                    }
                    openTarget();
                });

                item.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTarget();
                    }
                });
            });
        }

        return {
            filterRecords,
            getQueryString,
            setupDateFilter,
            setupLinks
        };
    };
})();
