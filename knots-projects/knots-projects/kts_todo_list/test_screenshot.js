const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log("Typing credentials...");
    await page.type('input[type="text"], input[type="email"], input[name="email"]', 'howardchung@knotsltd.com');
    await page.type('input[type="password"]', 'hide9932050');
    await page.keyboard.press('Enter');
    
    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log("Navigation timeout, continuing..."));
    await page.waitForTimeout(5000);
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'test_screenshot.png' });
    await browser.close();
    console.log('Screenshot saved to test_screenshot.png');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
