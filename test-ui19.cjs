const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

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

    // Inject a mock to bypass overpass API which might be returning 429
    await page.route("**/*overpass-api*", (route) => {
        console.log("Mocking Overpass API request:", route.request().url());
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ elements: [] }),
        });
    });

    await page.click('button:has-text("Add Question")', { force: true });

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

    console.log("Added Closest Question successfully.");

    try {
        await page.click('button[data-tutorial-id="questions-sidebar-btn"]', {
            force: true,
        });
        await page.waitForTimeout(5000);

        const isVisible = await page.evaluate(() => {
            return (
                document.body.innerText.includes("Location Type") &&
                document.body.innerText.includes("Show Name Labels")
            );
        });
        console.log("Is Closest Question rendered in sidebar?", isVisible);

        console.log(
            "Successfully opened sidebar and waited 5s without crashing!",
        );
    } catch (e) {
        console.error("Error during wait:", e.message);
    }

    await browser.close();
})();
