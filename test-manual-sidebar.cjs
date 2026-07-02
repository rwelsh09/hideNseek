const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", (msg) => {
        if (msg.type() === "error") {
            console.log("BROWSER ERROR:", msg.text());
        }
    });

    page.on("pageerror", (err) => {
        console.log("PAGE ERROR:", err.message);
    });

    await page.goto("http://localhost:4321/HideAndSeek/");

    await page.evaluate(() => {
        localStorage.setItem("hasSeenRules", "true");
        localStorage.setItem("hasDismissedNextStepsChecklist", "true");
        localStorage.setItem("tutorial-completed", "true");
    });
    await page.reload();
    await page.waitForTimeout(2000);

    // Clear driver overlay explicitly
    await page.evaluate(() => {
        document
            .querySelectorAll(".driver-overlay")
            .forEach((el) => el.remove());
        document.body.classList.remove("driver-active");
    });
    await page.waitForTimeout(500);

    console.log("Adding closest question...");
    await page.click('button:has-text("Add Question")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Closest")');
    await page.waitForTimeout(1000);

    console.log("Opening sidebar directly...");
    await page.click('button[data-tutorial-id="questions-sidebar-btn"]');
    await page.waitForTimeout(1000);

    const sidebarOpen = await page.evaluate(() => {
        return document
            .querySelector('[data-tutorial-id="questions-sidebar-btn"]')
            .getAttribute("data-state");
    });
    console.log("Sidebar toggle state:", sidebarOpen);

    await page.screenshot({ path: "sidebar-test.png" });
    console.log("Test completed.");
    await browser.close();
})();
