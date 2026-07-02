const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto("http://localhost:4321/HideAndSeek");

    await page.evaluate(() => {
        localStorage.setItem("hasSeenRules", "true");
        localStorage.setItem("hasDismissedNextStepsChecklist", "true");
        localStorage.setItem("tutorial-completed", "true");
    });
    await page.reload();

    await page.waitForSelector(".leaflet-container");

    await page.evaluate(() => {
        document
            .querySelectorAll(".driver-overlay")
            .forEach((el) => el.remove());
        document.body.classList.remove("driver-active");
    });

    // Open sidebar
    await page.evaluate(() => {
        const qBtn = document.querySelector(
            'button[data-tutorial-id="questions-sidebar-btn"]',
        );
        if (qBtn) qBtn.click();
    });

    await page.waitForTimeout(1000);

    // Directly append question data
    await page.evaluate(() => {
        const qBtn = document.querySelector(
            'button[data-tutorial-id="questions-sidebar-btn"]',
        );
        if (qBtn) qBtn.click(); // toggle? let's make sure it's open, actually dispatch the event

        const evt = new CustomEvent("questionModified", { detail: null });
        window.dispatchEvent(evt);
    });

    // Since Playwright scripts seem to randomly time out clicking the sidebar,
    // I will just mock the state locally using page.evaluate to add the closest question directly
    await page.evaluate(() => {
        const nanostores = window.__nanostores; // If we attached them to window, maybe not.

        // Actually, just click 'Paste Question' if we can find it
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (b.innerText && b.innerText.includes("Paste Question")) {
                navigator.clipboard.readText = async () =>
                    JSON.stringify({
                        key: 1714088998064,
                        id: "closest",
                        data: {
                            color: "black",
                            collapsed: false,
                            drag: true,
                            locationType: "museum",
                            lat: 51.0447,
                            lng: -114.0719,
                            radius: 2,
                            unit: "kilometers",
                            showLabels: false,
                            location: false,
                        },
                    });
                b.click();
                break;
            }
        }
    });

    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "verification.png" });

    await browser.close();
})();
