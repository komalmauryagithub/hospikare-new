const fs = require('fs');
let code = fs.readFileSync('js/users.js', 'utf8');

const newLoadLabs = `
    async function loadLabs() {
        const container = $("#labsContainer");
        if (!container) return;
        renderLoading(container, "Loading labs...");
        try {
            const data = await apiGet("/api/all-labs");
            if (!data.success || !Array.isArray(data.labs) || data.labs.length === 0) {
                renderEmpty(container, "No labs available right now.");
                return;
            }
            container.innerHTML = data.labs.map(lab => {
                let testTags = '';
                if (lab.tests && Array.isArray(lab.tests)) {
                    const displayTests = lab.tests.slice(0, 3);
                    testTags = displayTests.map(t => \`<span style="background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">\${escapeHtml(t)}</span>\`).join('');
                    if (lab.tests.length > 3) {
                        testTags += \`<span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">+\${lab.tests.length - 3} more</span>\`;
                    }
                }
                
                return \`
                <article class="featuredHospitalCard" tabindex="0">
                    <div class="featuredHospitalImage" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; background: linear-gradient(135deg, #e0f2fe, #bae6fd); align-items: center; justify-content: center;">
                        <i class="fa-solid fa-microscope" style="font-size: 64px; color: #0284c7; padding: 32px;"></i>
                    </div>
                    <div class="featuredHospitalContent">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">\${escapeHtml(lab.lab_name || "Diagnostic Center")}</h3>
                        <div class="hospitalLocation">
                            <i class="fa-solid fa-location-dot"></i>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${escapeHtml(lab.address || "Location not specified")}</span>
                        </div>
                        <div class="hospitalTypes" style="margin-bottom: 8px; font-size: 11px; color: var(--hk-text-main, #334155); display: flex; gap: 6px; flex-wrap: wrap;">
                            \${testTags || '<span style="color: #94a3b8; font-style: italic;">No tests listed</span>'}
                        </div>
                        <div class="hospitalBottom">
                            <div class="hospitalBeds" style="display: flex; flex-direction: column;">
                                <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Starting at</span>
                                <span style="font-weight: 800; color: #0f172a; font-size: 16px;">\${formatMoney(lab.test_price || 500)}</span>
                            </div>
                            <button class="btn btn-primary" type="button" data-action="book-lab" data-id="\${escapeAttr(lab.id)}" data-test="\${escapeAttr(lab.lab_name)}" data-price="\${escapeAttr(lab.test_price || 500)}">Book</button>
                        </div>
                    </div>
                </article>
                \`;
            }).join("");
        } catch (error) {
            console.error(error);
            renderEmpty(container, "Labs could not be loaded.");
        }
    }
`;

code = code.replace(/async function loadLabs\(\) \{[\s\S]*?catch \(error\) \{[\s\S]*?\}[\s\S]*?\}/, newLoadLabs.trim());
fs.writeFileSync('js/users.js', code);
