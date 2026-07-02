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

    // Keep sidebar OPEN so Add Question is visible

    // Add question
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

    // Take a screenshot to show what is in the sidebar
    await page.screenshot({ path: "sidebar-after-add.png" });

    const sidebarContent = await page.evaluate(() => {
        const sidebar = document.querySelector('div[data-sidebar="sidebar"]');
        return sidebar
            ? sidebar.innerHTML.substring(0, 500)
            : "NO SIDEBAR DOM ELEMENT";
    });

    console.log("Sidebar DOM preview length:", sidebarContent.length);

    const hasQuestionCard = await page.evaluate(() => {
        return !!document.querySelector(
            '.group\\/menu-item input[type="number"]',
        ); // Radius input
    });
    console.log("Has Question Card?", hasQuestionCard);

    await browser.close();
})();
