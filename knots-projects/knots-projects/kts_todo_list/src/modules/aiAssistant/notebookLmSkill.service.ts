import { Service } from "typedi";
import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";

@Service()
export class NotebookLmSkillService {
  private browser: Browser | null = null;
  private readonly NOTEBOOK_URL_BASE = "https://notebooklm.google.com/notebook/";
  
  // NOTE: You must login to Google using a Chrome profile and pass the path here to bypass Captcha/Auth
  private readonly USER_DATA_DIR_PATH = path.resolve(__dirname, '../../../../notebooklm-chrome-profile');

  constructor() {}

  /**
   * Initializes the headless browser instance with the persistent profile.
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        userDataDir: this.USER_DATA_DIR_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled', // Try to hide automation flag
          '--disable-dev-shm-usage',
        ]
      });
    }
    return this.browser;
  }

  /**
   * Sends a prompt to a specific NotebookLM document and scrapes the response.
   * 
   * @param params 
   */
  async queryNotebookLm(notebookId: string, prompt: string): Promise<string> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    let aiResponse = "";

    try {
      // 1. Navigate to NotebookLM notebook
      await page.goto(`${this.NOTEBOOK_URL_BASE}${notebookId}`);
      
      // Wait for the UI to settle (NotebookLM is a heavy React/WebComponent app)
      await page.waitForTimeout(5000); 

      // 2. Find the Chat Input area. 
      // Note: Google's DOM changes often. You might need to update this selector.
      // Usually it's either a <textarea> or a contenteditable div with specific ARIA labels.
      const chatInputSelector = 'textarea'; 
      await page.waitForSelector(chatInputSelector, { timeout: 10000 });
      
      // Type the prompt gracefully
      await page.type(chatInputSelector, prompt, { delay: 50 });
      
      // Hit Enter to send
      await page.keyboard.press('Enter');

      // 3. Wait for the model to finish generating. 
      // We look for the "stop" button to disappear or a specific loading spinner to vanish.
      // Easiest heuristic: wait a fixed time or wait for new text blocks to appear.
      await page.waitForTimeout(10000); 

      // 4. Scrape the last response block
      // In NotebookLM, AI responses are usually wrapped in specific classes or inside a list
      const responseSelector = 'div[role="log"] > div:last-child p, .message-bubble-ai p'; // Generic fallback selectors
      
      try {
        await page.waitForSelector(responseSelector, { timeout: 5000 });
        const textResults = await page.$$eval(responseSelector, elements => 
          elements.map(el => el.textContent).join('\n\n')
        );
        aiResponse = textResults || "⚠️ NotebookLM 順利送出訊息，但未能抓取到回應文字。DOM 結構可能已改變。";
      } catch (e) {
        aiResponse = "⚠️ NotebookLM 抓取回應超時，或者找不到文字結果框架。";
      }

    } catch (error: any) {
      console.error("[NotebookLM Skill Error]:", error);
      aiResponse = `[系統錯誤] NotebookLM 連線失敗: ${error.message}\n(請確認您的 Chrome Profile 是否已登入 Google 帳號授權)`;
    } finally {
      await page.close();
    }

    return aiResponse;
  }

  /**
   * Closes the browser explicitly. Call this when shutting down the server.
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
