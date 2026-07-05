import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})

        # Inject script to run before page loads to set local storage correctly
        await context.add_init_script("""
            localStorage.setItem('hasSeenRules', 'true');
            localStorage.setItem('hasDismissedNextStepsChecklist', 'true');
            localStorage.setItem('tutorial-completed', 'true');
        """)

        page = await context.new_page()

        print("Navigating to app...")
        await page.goto("http://localhost:4321/hideNseek")
        await page.wait_for_load_state("networkidle")

        print("Waiting for page to load...")
        await asyncio.sleep(3)

        # Try to clear driver DOM state just in case it still showed up
        await page.evaluate("""
            document.querySelectorAll('.driver-overlay').forEach(el => el.remove());
            document.querySelectorAll('.driver-popover').forEach(el => el.remove());
            document.body.classList.remove('driver-active');
        """)

        # Wait for the Options button to be attached and visible
        print("Clicking Options...")
        options_btn = page.locator("button:has-text('Options')")
        await options_btn.wait_for(state="visible", timeout=10000)
        await options_btn.first.click(force=True)
        await asyncio.sleep(2)

        # Now click Add Question using evaluate to bypass viewport checks
        print("Clicking Add Question...")
        await page.evaluate("""
            const addBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Add Question'));
            if (addBtn) addBtn.click();
        """)
        await asyncio.sleep(2)

        # Click the Match question type (specifically, click 'Museum')
        print("Selecting 'Match' Museum question type...")
        await page.evaluate("""
            const museumBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Museum') && el.closest('.border-red-500'));
            if (museumBtn) {
                museumBtn.click();
            } else {
                const anyMatch = Array.from(document.querySelectorAll('button')).find(el => el.closest('.border-red-500') || el.closest('.bg-red-500'));
                if (anyMatch) anyMatch.click();
            }
        """)
        await asyncio.sleep(2)

        # Click the first question to expand it
        print("Expanding first question...")
        await page.evaluate("""
            const questionBtn = document.querySelector('button.flex.items-center.justify-between.w-full.bg-card');
            if (questionBtn) questionBtn.click();
        """)
        await asyncio.sleep(2)

        print("Taking screenshot...")
        await page.screenshot(path="/home/jules/verification/delete-button-final.png", full_page=False)

        await browser.close()
        print("Done.")

asyncio.run(main())
