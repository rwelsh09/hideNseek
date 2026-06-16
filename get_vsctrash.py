import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('http://localhost:4321')
        await page.click('text=Questions')
        await page.wait_for_timeout(1000)
        await page.click('text=+ Add Question')
        await page.wait_for_timeout(500)
        await page.click('text=0.5km Radar')
        await page.wait_for_timeout(500)
        html = await page.content()
        with open('page_content.html', 'w') as f:
            f.write(html)
        await browser.close()

asyncio.run(run())
