const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const errors = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            errors.push(msg.text());
        }
    });
    page.on("pageerror", (err) => {
        errors.push(err.message);
    });

    await page.goto("http://localhost:4321/HideAndSeek/");

    await page.evaluate(() => {
        localStorage.setItem("hasSeenRules", "true");
        localStorage.setItem("hasDismissedNextStepsChecklist", "true");
        localStorage.setItem("tutorial-completed", "true");
    });
    await page.reload();
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
        document
            .querySelectorAll(".driver-overlay")
            .forEach((el) => el.remove());
        document.body.classList.remove("driver-active");
    });

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

    await page.click('button:has-text("Add Question")', { force: true });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (b.value === "closest") {
                b.click();
                break;
            }
        }
    });
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
    await page.waitForTimeout(1000);

    // Now click to open sidebar
    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(1000);

    if (errors.length > 0) {
        console.log("CAUGHT ERRORS:", errors);
    } else {
        console.log("NO ERRORS DETECTED.");
    }

    await browser.close();
})();
