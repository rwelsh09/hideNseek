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

    // The sidebar trigger on the left
    await page.click('div[data-tutorial-id="left-sidebar-trigger"] button');
    await page.waitForTimeout(500);

    console.log("Adding closest question from inside sidebar...");
    await page.click('button:has-text("Add Question")');
    await page.waitForTimeout(500);

    // Wait for the popup
    await page.waitForSelector("text=Closest Location", { timeout: 5000 });
    await page.click("text=Closest Location");
    await page.waitForTimeout(1000);

    // The popup might have closed, now let's see what happens to the sidebar
    await page.screenshot({ path: "sidebar-test3.png" });

    // Check if sidebar is still open or crashed
    const hasSidebar = await page.evaluate(() => {
        return !!document.querySelector(".group\\/sidebar-wrapper"); // Shadcn sidebar wrapper class usually
    });
    console.log("Has sidebar wrapper:", hasSidebar);

    console.log("Test completed.");
    await browser.close();
})();
