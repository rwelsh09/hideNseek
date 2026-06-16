import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        # the base path is /HideAndSeek as shown in the initial state
        await page.goto('http://localhost:4321/HideAndSeek')
        await page.wait_for_timeout(2000)

        # Let's take a screenshot of the initial state
        await page.screenshot(path='initial_state.png')

        # Try to find the "Questions" or "+ Add Question" button via CSS selectors or ARIA roles
        add_btn = page.locator('text="+ Add Question"')
        if await add_btn.count() > 0:
            await add_btn.first.click()
        else:
            # Let's try to find a generic tab that says "Questions"
            questions_tab = page.locator('text="Questions"')
            if await questions_tab.count() > 0:
                await questions_tab.first.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path='after_questions_click.png')
                if await page.locator('text="+ Add Question"').count() > 0:
                    await page.locator('text="+ Add Question"').first.click()

        await page.wait_for_timeout(500)

        # Click the 0.5km Radar
        radar_btn = page.locator('text="0.5km Radar"')
        if await radar_btn.count() > 0:
            await radar_btn.first.click()

        await page.wait_for_timeout(1000)
        await page.screenshot(path='before_manual_delete.png')

        # Press Escape to close preview settings
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)

        # We need the trash button
        # Instead, let's look for specific class names: "bg-surface-secondary cursor-pointer items-center justify-center rounded transition-colors flex h-8 w-8 hover:bg-surface-tertiary"
        trash_buttons = await page.locator('.bg-surface-secondary.cursor-pointer.items-center.justify-center.rounded.transition-colors.flex.h-8.w-8').all()
        print(f"Found {len(trash_buttons)} trash buttons")
        if len(trash_buttons) >= 2:
            # The trash button is usually the second one (export, trash, lock)
            await trash_buttons[1].click()
            print("Clicked trash button")
            await page.wait_for_timeout(500)
        elif len(trash_buttons) > 0:
            await trash_buttons[0].click()
            print("Clicked first button matching classes")
            await page.wait_for_timeout(500)

        await page.screenshot(path='after_manual_delete.png')
        await browser.close()

asyncio.run(run())
