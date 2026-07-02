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

    await page.waitForTimeout(500);

    // Since Overpass is 429ing and taking forever, let's trigger creating the Closest question by manipulating nanostores or just injecting it via clipboard.

    await page.evaluate(async () => {
        const q = {
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

        // dispatch an event that test script can listen to or we can just modify localStorage if that works,
        // actually let's use the clipboard paste functionality
        const clipboardData = JSON.stringify(q);

        const qBtn = document.querySelector(
            'button[data-tutorial-id="questions-sidebar-btn"]',
        );
        if (qBtn) qBtn.click();
    });

    await page.waitForTimeout(1000);

    await page.evaluate(
        (clipboardData) => {
            // Find paste button
            const buttons = document.querySelectorAll("button");
            for (const b of buttons) {
                if (b.innerText && b.innerText.includes("Paste Question")) {
                    // mock clipboard read
                    navigator.clipboard.readText = async () => clipboardData;
                    b.click();
                    break;
                }
            }
        },
        JSON.stringify({
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
        }),
    );

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
