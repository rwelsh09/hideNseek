import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 720})

        await page.goto("http://localhost:4321/hideNseek", wait_until="networkidle")

        await page.evaluate("""
            localStorage.setItem('showTutorials', 'false');
            localStorage.setItem('hasSeenRules', 'true');
            const questions = [{
                id: "test-id",
                type: "HotCold",
                lat: 0,
                lng: 0,
                locationName: "Test Location",
                result: "Cold",
                timestamp: Date.now(),
                locked: false,
                collapsed: false,
                distance: 0,
                bearing: 0
            }];
            localStorage.setItem('questions', JSON.stringify(questions));
        """)

        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # On desktop, sidebar might be hidden, let's look for a button to toggle it
        await page.evaluate('''
            const trigger = document.querySelector('[data-sidebar="trigger"]') || document.querySelector('.peer[data-side="left"] + div > header > button') || document.querySelector('button');
            if(trigger) {
                console.log("Trigger found");
                trigger.click();
            } else {
                console.log("No trigger found");
            }
        ''')
        await page.wait_for_timeout(2000)

        await page.screenshot(path="verification/screenshot-unlocked.png")

        print("Trying to lock the question...")
        try:
            await page.evaluate('''
                const lockBtn = document.querySelector('[data-tutorial-id="tutorial-lock-btn"]');
                if(lockBtn) {
                    lockBtn.click();
                } else {
                    console.log("Lock btn not found");
                }
            ''')
            await page.wait_for_timeout(2000)
            await page.screenshot(path="verification/screenshot-locked.png")
        except Exception as e:
            print("Could not lock question:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
