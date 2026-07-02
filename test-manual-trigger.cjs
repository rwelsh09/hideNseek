const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", (msg) => {
        if (msg.type() === "error") {
            console.log("BROWSER ERROR:", msg.text());
        }
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

    // Check state of left sidebar BEFORE adding question
    const stateBefore = await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (!triggerBtn) return null;
        triggerBtn.click();
        return "clicked";
    });
    console.log("Sidebar state before adding question:", stateBefore);

    await page.waitForTimeout(500);
    await page.screenshot({ path: "trigger-before.png" });

    // Now, mock API and add Closest question
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

    await page.evaluate(() => {
        // hide sidebar to add question
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    console.log("Adding closest question...");
    await page.click('button:has-text("Add Question")', { force: true });
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

    // Click Store Question
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

    // Open the Questions sidebar again
    console.log("Opening questions sidebar again");
    const stateAfter = await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) {
            triggerBtn.click();
            return "clicked";
        }
        return null;
    });
    console.log("Sidebar trigger clicked after:", stateAfter);

    await page.waitForTimeout(1000);

    await page.screenshot({ path: "trigger-after.png" });

    await browser.close();
})();
