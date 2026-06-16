import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('http://localhost:4321')
        await page.wait_for_timeout(2000)

        # Add question
        try:
            await page.click('text=+ Add Question', timeout=2000)
        except Exception:
            await page.click('text=Questions')
            await page.wait_for_timeout(500)
            await page.click('text=+ Add Question')

        await page.wait_for_timeout(500)
        await page.click('text=0.5km Radar')
        await page.wait_for_timeout(500)

        # screenshot before delete
        await page.screenshot(path='before_manual_delete.png')

        # Click the delete button
        # In src/components/cards/base.tsx, we have a button containing VscTrash
        # The button has className that contains "h-8" "w-8" "cursor-pointer" "items-center" "justify-center"
        # Since there's also a trash button in PreviewSettings, let's target the one in the sidebar.
        trash_buttons = await page.locator('button.cursor-pointer.items-center.justify-center.h-8.w-8').all()
        print(f"Found {len(trash_buttons)} trash buttons")

        # In the before_delete.png screenshot from before, we saw that PreviewSettings pops up.
        # So we press Escape to close it.
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)

        # now get the trash buttons again
        trash_buttons = await page.locator('button.cursor-pointer.items-center.justify-center.h-8.w-8').all()

        if len(trash_buttons) > 0:
            # We'll just click the first one we find
            await trash_buttons[0].click()
            await page.wait_for_timeout(500)

        await page.screenshot(path='after_manual_delete.png')
        await browser.close()

asyncio.run(run())
