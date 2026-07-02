const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on("console", (msg) => console.log("BROWSER CONSOLE:", msg.text()));
    page.on("pageerror", (error) =>
        console.log("BROWSER ERROR:", error.message),
    );

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

    // Inject a mock to bypass overpass API and provide deterministic locations
    await page.route("**/*overpass-api*", (route) => {
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                elements: [
                    {
                        type: "node",
                        id: 1,
                        lat: 51.05,
                        lon: -114.05,
                        tags: { name: "Fake Museum" },
                    },
                ],
            }),
        });
    });

    // Open the "Add Question" dialog
    await page.click('button:has-text("Add Question")', { force: true });

    // Wait for the popup
    await page.waitForTimeout(500);

    // Click the Closest tab directly by value
    await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (b.value === "closest") {
                b.click();
                break;
            }
        }
    });

    // Click Museum
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (b.innerText && b.innerText.includes("Museum")) {
                b.click();
                break;
            }
        }
    });

    // Wait a bit and click Store Question
    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (
                b.innerText &&
                b.innerText.includes("Store Question in Sidebar")
            ) {
                b.click();
                break;
            }
        }
    });

    // Wait a bit
    await page.waitForTimeout(1000);

    // Take a screenshot before opening the sidebar
    await page.screenshot({ path: "before-sidebar.png" });

    // Open the Questions sidebar
    console.log("Opening questions sidebar");
    await page.evaluate(() => {
        const qBtn = document.querySelector(
            'button[data-tutorial-id="questions-sidebar-btn"]',
        );
        if (qBtn) qBtn.click();
    });

    await page.waitForTimeout(1000);

    // Evaluate if responsive
    const isResponsive = await page.evaluate(() => true).catch(() => false);
    console.log("Page responsive after opening sidebar?", isResponsive);

    await page.screenshot({ path: "verification4.png" });

    await browser.close();
})();
