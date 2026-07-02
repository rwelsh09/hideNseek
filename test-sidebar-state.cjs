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

    const getSidebarDataState = async () => {
        return await page.evaluate(() => {
            const triggerBtn = document.querySelector(
                'button[data-sidebar="trigger"]',
            );
            if (!triggerBtn) return "no trigger";

            const sidebar = document.querySelector(
                'div[data-sidebar="sidebar"]',
            );
            if (!sidebar) return "no sidebar";

            return {
                trigger: triggerBtn.outerHTML,
                sidebarState: sidebar.getAttribute("data-state"),
                sidebarClasses: sidebar.className,
                wrapperState: document
                    .querySelector(".group\\/sidebar-wrapper")
                    ?.getAttribute("data-state"),
            };
        });
    };

    console.log("State BEFORE adding question:");
    console.log(await getSidebarDataState());

    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    console.log("State AFTER clicking trigger:");
    console.log(await getSidebarDataState());

    // Close it
    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    // Add question
    await page.click('button:has-text("Add Question")', { force: true });
    await page.waitForTimeout(500);

    // Using keyboard to close it or add it
    // Actually, wait, let's just use the mock from previous script
    await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (const b of buttons) {
            if (b.innerText && b.innerText.includes("Radius")) {
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

    console.log("State AFTER ADDING QUESTION (should be closed):");
    console.log(await getSidebarDataState());

    await page.evaluate(() => {
        const triggerBtn = document.querySelector(
            'button[data-sidebar="trigger"]',
        );
        if (triggerBtn) triggerBtn.click();
    });
    await page.waitForTimeout(500);

    console.log("State AFTER CLICKING TRIGGER AGAIN:");
    console.log(await getSidebarDataState());

    await browser.close();
})();
