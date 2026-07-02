const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:4321/HideAndSeek');

  await page.evaluate(() => {
    localStorage.setItem('hasSeenRules', 'true');
    localStorage.setItem('hasDismissedNextStepsChecklist', 'true');
    localStorage.setItem('tutorial-completed', 'true');
  });
  await page.reload();

  await page.waitForSelector('.leaflet-container');

  await page.evaluate(() => {
      document.querySelectorAll('.driver-overlay').forEach(el => el.remove());
      document.body.classList.remove('driver-active');
  });

  // Inject a mock to bypass overpass API
  await page.route('**/*overpass-api*', route => {
      route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ elements: [] })
      });
  });

  // Open the "Add Question" dialog
  await page.click('button:has-text("Add Question")', { force: true });

  // Wait for the popup
  await page.waitForTimeout(500);

  // Click the Closest tab directly by value
  await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
          if (b.value === "closest") { b.click(); break; }
      }
  });

  // Click Museum
  await page.waitForTimeout(500);
  await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
          if (b.innerText && b.innerText.includes("Museum")) { b.click(); break; }
      }
  });

  // Click Store Question
  await page.waitForTimeout(500);
  await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
          if (b.innerText && b.innerText.includes("Store Question in Sidebar")) { b.click(); break; }
      }
  });

  // Wait a bit
  await page.waitForTimeout(1000);

  // Open the Questions sidebar
  await page.evaluate(() => {
      const qBtn = document.querySelector('button[data-tutorial-id="questions-sidebar-btn"]');
      if (qBtn) qBtn.click();
  });

  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'verification.png' });

  await browser.close();
})();
