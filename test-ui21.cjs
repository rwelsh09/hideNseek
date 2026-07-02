const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const page = await context.newPage();

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

    const questionData = {
        key: 1714088998064,
        id: "closest",
        data: {
            color: "black",
            collapsed: false,
            drag: true,
            locationType: "museum",
            lat: 51.0447,
            lng: -114.0719,
            radius: 2,
            unit: "kilometers",
            showLabels: false,
            location: false,
        },
    };

    await page.evaluate(async (dataStr) => {
        await navigator.clipboard.writeText(dataStr);
    }, JSON.stringify(questionData));

    await page.click('button[data-tutorial-id="questions-sidebar-btn"]', {
        force: true,
    });

    await page.waitForTimeout(500);

    await page.click('button:has-text("Paste Question")', { force: true });

    await page.waitForTimeout(2000);

    try {
        const isVisible = await page.evaluate(() => {
            return (
                document.body.innerText.includes("Location Type") &&
                document.body.innerText.includes("Show Name Labels")
            );
        });
        console.log("Is Closest Question rendered in sidebar?", isVisible);

        console.log("Successfully opened sidebar and waited without crashing!");
    } catch (e) {
        console.error("Error during wait:", e.message);
    }

    await browser.close();
})();
