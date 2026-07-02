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

    // Inject a mock to bypass overpass API
    await page.route("**/*overpass-api*", (route) => {
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ elements: [] }),
        });
    });

    // Open the "Add Question" dialog
    await page.click('button:has-text("Add Question")', { force: true });

    // Wait for the popup and select Closest
    await page.waitForSelector("text=Closest");
    const closestBtn = await page.$('button[value="closest"]');
    if (closestBtn) await closestBtn.click({ force: true });

    // Click Museum
    await page.waitForSelector('button:has-text("Museum")');
    await page.click('button:has-text("Museum")', { force: true });

    // Click Store Question
    await page.click('button:has-text("Store Question in Sidebar")', {
        force: true,
    });

    // Wait a bit
    await page.waitForTimeout(1000);

    // Open the Questions sidebar
    await page.evaluate(() => {
        const qBtn = document.querySelector(
            'button[data-tutorial-id="questions-sidebar-btn"]',
        );
        if (qBtn) qBtn.click();
    });

    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "verification.png" });

    await browser.close();
})();
