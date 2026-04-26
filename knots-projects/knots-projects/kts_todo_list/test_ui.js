const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE: [${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`BROWSER ERROR: ${error.message}`);
    });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log("Typing credentials...");
    await page.type('input[type="text"], input[type="email"], input[name="email"]', 'howardchung@knotsltd.com');
    await page.type('input[type="password"]', 'hide9932050');
    await page.keyboard.press('Enter');
    
    console.log("Waiting 10 seconds for login to settle...");
    await page.waitForTimeout(10000);
    
    console.log("Taking dashboard screenshot...");
    await page.screenshot({ path: 'screenshot_dashboard.png' });
    
    console.log("Navigating to Gantt page...");
    // Let's assume there is a menu item we can click, or we just change URL.
    await page.goto('http://localhost:3000/gantt', { waitUntil: 'networkidle2' }).catch(e => console.log('Gantt URL failed, ignoring.'));
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshot_gantt.png' });
    
    await browser.close();
    console.log('Screenshots saved.');
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
