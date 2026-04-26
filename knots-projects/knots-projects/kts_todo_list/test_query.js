const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    console.log("Typing credentials...");
    await page.type('input[type="email"], input[name="email"]', 'howardchung@knotsltd.com');
    await page.type('input[type="password"]', 'hide9932050');
    await page.keyboard.press('Enter');
    
    console.log("Waiting for token...");
    await page.waitForTimeout(5000); // give time to login and set cookie
    
    const cookies = await page.cookies();
    const tokenCookie = cookies.find(c => c.name === 'authToken');
    
    if(!tokenCookie) {
      console.log("LOGIN FAILED. Could not get authToken cookie.");
      await browser.close();
      return;
    }
    console.log("GOT TOKEN! Querying projectOrders...");
    
    const query = `
      query getApList {
        projectOrders(pagination: { limit: 1000, offset: 0 }) {
          orders {
            id
            realId
            supplier
            amount
            orderedDate
            settlement
            desc
          }
        }
      }
    `;
    
    const res = await fetch('http://localhost:3000/todo-graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenCookie.value}`
      },
      body: JSON.stringify({ query })
    });
    
    const json = await res.json();
    console.log("GRAPHQL RESPONSE:", JSON.stringify(json, null, 2));
    
    await browser.close();
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
