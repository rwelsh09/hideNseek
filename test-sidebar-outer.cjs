const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

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

    const getOuterDataState = async () => {
        return await page.evaluate(() => {
            const outer = document.querySelector(".group.peer");
            if (!outer) return "no outer div";
            return (
                outer.getAttribute("data-state") +
                " / " +
                outer.getAttribute("data-collapsible")
            );
        });
    };

    console.log(
        "State BEFORE adding question (default state):",
        await getOuterDataState(),
    );

    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    console.log(
        "State AFTER clicking trigger (closed):",
        await getOuterDataState(),
    );

    // Click it again to open
    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);
    console.log(
        "State AFTER clicking trigger again (opened):",
        await getOuterDataState(),
    );

    // Add closest question
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

    console.log(
        "State AFTER ADDING closest question:",
        await getOuterDataState(),
    );

    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    console.log(
        "State AFTER CLICKING TRIGGER AGAIN (should toggle):",
        await getOuterDataState(),
    );

    await browser.close();
})();
