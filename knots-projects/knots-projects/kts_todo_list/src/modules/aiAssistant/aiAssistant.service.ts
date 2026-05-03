import { Service, Inject } from "typedi";
import { AiChatMessageInput } from "./input/aiChatMessage.input";
import { AiChatMessagePayload } from "./payload/aiChatMessage.payload";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NotebookLmSkillService } from "./notebookLmSkill.service";
import { AiMemoryService } from "../aiMemory/aiMemory.service";
import { AiOcrReceiptInput } from "./input/aiOcrReceipt.input";
import { AiOcrReceiptPayload } from "./payload/aiOcrReceipt.payload";

@Service()
export class AiAssistantService {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  
  constructor(
    @Inject(() => NotebookLmSkillService)
    private readonly notebookLmSkill: NotebookLmSkillService,
    @Inject(() => AiMemoryService)
    private readonly aiMemoryService: AiMemoryService
  ) {
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    this.apiKeys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
  }

  private getModel(modelName: string) {
    if (this.apiKeys.length === 0) throw new Error("No Gemini API keys found");
    const key = this.apiKeys[this.currentKeyIndex];
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: modelName });
  }

  private async generateContentWithRetry(modelName: string, prompt: any, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = this.getModel(modelName);
        return await model.generateContent(prompt);
      } catch (error: any) {
        // If it's a 429 Resource Exhausted error, and we have multiple keys, rotate and retry
        if (error.status === 429 || error.message?.includes('429')) {
          console.warn(`[AI Assistant] 429 Rate Limit hit with key index ${this.currentKeyIndex}. Rotating...`);
          this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
          // Only wait briefly if we haven't exhausted our keys
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue; // Retry with new key
          }
        }
        throw error; // Not a 429, or out of retries
      }
    }
    throw new Error("Max retries exceeded for Gemini API");
  }

  async processMessage(input: AiChatMessageInput, userId?: string): Promise<AiChatMessagePayload> {
    try {
      if (this.apiKeys.length === 0) {
        return { response: "伺服器未設定 Gemini API 金鑰 (GEMINI_API_KEYS)，請在後端設定檔中加入。" };
      }
      
      let memoryContext = "";
      if (userId) {
        const memoryContent = await this.aiMemoryService.getMemory(userId);
        if (memoryContent) {
          memoryContext = `\n\n【關於這位使用者的專屬記憶】：\n${memoryContent}`;
        }
      }

      // Prompt 模板 (導入 Tracy 的靈魂與意圖路由/Intent Routing)
      const prompt = `你現在是 Knots 系統的專屬資深 AI 助理「Tracy」。${memoryContext}

【你的角色與性格】
你是公司內部的得力助手。你說話專業、精練、語氣溫暖但不過度熱情。你喜歡使用條列式整理重點，並預設使用繁體中文（台灣/香港用語）回答。你絕不會說出自己是語言模型，你的身分就是「Tracy」。

【你的核心守則】
1. 當被問及系統操作時，請給予友善的引導。
2. 當無法確定答案、或缺乏背景資料時，請誠實告知，絕不捏造（Hallucinate）工程數據或法規。
3. 對於使用者的問候，請保持專業友善的簡短回應。

【法規查閱路由機制 (最高優先級)】
我們公司有三本專屬的外部知識庫 (NotebookLM)。請嚴格判斷使用者的問題是否需要查閱以下內部法規：
- [FEHD] 食環署：涉及飲食場所牌照申請流程、相關裝修法例、廚房規格。
- [BD] 屋宇署：涉及建築條例、小型工程、入則工程 (A&A works)、結構改動。
- [FSD] 消防處：涉及建築物消防安全、餐廳消防通風條例、消防設備規定。

如果你判斷使用者的問題「需要」查閱上述法規才能精準回答，請你**「完全停止」**扮演對話助理，**「只」**回覆對應的觸發標籤，例如 "[CALL_NOTEBOOKLM_FEHD]"，或者若需跨域查詢則同時寫上多個標籤 "[CALL_NOTEBOOKLM_FEHD][CALL_NOTEBOOKLM_BD]"。此時請絕對不要輸出任何其他文字。

如果問題「不需要」查法規，請直接以 Tracy 的身分，友善、專業地回答使用者。

【專屬記憶儲存機制】
你必須默默記下關於使用者的重要個人資訊。
- 若使用者明確說出「請記下來」、「幫我記住」、「以後記得」等指令。
- 若使用者提及所屬「特定專案名稱/編號」、「職位頭銜」或「直屬主管」。
- 若使用者表達對系統輸出的格式偏好（例如：「以後給我都用英文」）。
符合以上條件時，請在你的回覆「最下方」加上 \`[SAVE_MEMORY: 要記下的重點]\` 標籤。這不會被使用者看見。請勿記錄生活瑣事或無關工作的內容。

使用者說：
"${input.message}"
`;
      
      const result = await this.generateContentWithRetry("gemini-3.1-flash-lite-preview", prompt);
      let text = (await result.response).text();

      // Skill Interceptor: 攔截並轉交給 NotebookLM Puppeteer 處理
      if (text.includes("[CALL_NOTEBOOKLM")) {
        const queryToNotebookLM = input.message;
        const targetIds: string[] = [];
        const targetNames: string[] = [];

        if (text.includes("[CALL_NOTEBOOKLM_FEHD]") && process.env.NOTEBOOKLM_ID_FEHD) { targetIds.push(process.env.NOTEBOOKLM_ID_FEHD); targetNames.push("食環署法規(FEHD)"); }
        if (text.includes("[CALL_NOTEBOOKLM_BD]") && process.env.NOTEBOOKLM_ID_BD) { targetIds.push(process.env.NOTEBOOKLM_ID_BD); targetNames.push("屋宇署法規(BD)"); }
        if (text.includes("[CALL_NOTEBOOKLM_FSD]") && process.env.NOTEBOOKLM_ID_FSD) { targetIds.push(process.env.NOTEBOOKLM_ID_FSD); targetNames.push("消防處法規(FSD)"); }

        if (targetIds.length > 0) {
          text = `🔍 正在為您同時翻閱 NotebookLM (${targetNames.join("、")})，這通常需要約 15~30 秒鐘，請稍候...\n\n`;
          
          // 平行觸發多本筆記查詢
          const fetchPromises = targetIds.map(id => this.notebookLmSkill.queryNotebookLm(id, queryToNotebookLM));
          const notebookReplies = await Promise.all(fetchPromises);
          
          let aggregatedResult = notebookReplies.map((reply, i) => `【來自 ${targetNames[i]} 的結果】：\n${reply}\n\n`).join("---\n");
          
          // 追加一道統整手續 (Optionally synthesize using Gemini), 但為了速度我們直接回傳
          text += aggregatedResult;
        } else {
          text = "抱歉，您想查詢的對應法規筆記遺失或未設定。請聯絡系統管理員補上 .env 中的 NOTEBOOKLM_ID 變數。";
        }
      }

      // Memory Extraction Interceptor: 攔截並寫入記憶
      const memoryRegex = /\[SAVE_MEMORY:\s*(.*?)\]/g;
      let match;
      while ((match = memoryRegex.exec(text)) !== null) {
        const memoryToSave = match[1];
        if (userId) {
          await this.aiMemoryService.appendMemory(userId, memoryToSave);
        }
      }
      text = text.replace(/\[SAVE_MEMORY:\s*(.*?)\]/g, "").trim();

      return {
        response: text,
      };
    } catch (e: any) {
      return {
        response: `[系統錯誤] AI 引擎呼叫失敗: ${e.message}`,
      };
    }
  }

  async ocrReceipt(input: AiOcrReceiptInput): Promise<AiOcrReceiptPayload> {
    try {
      if (this.apiKeys.length === 0) {
        return { success: false, error: "伺服器未設定 Gemini API 金鑰 (GEMINI_API_KEYS)。" };
      }
      
      const prompt = `您是一個專業的發票與收據光學辨識(OCR)專家。請從提供的圖片中擷取以下資訊，並嚴格使用 JSON 格式回覆，不要包含 markdown 標籤或任何其他文字：
{
  "amount": <數字，總金額>,
  "desc": "<字串，購買項目摘要>",
  "date": "<字串，日期格式 YYYY-MM-DD>",
  "supplier": "<字串，商店或供應商名稱>"
}`;

      // Image formatting
      let base64Data = input.imageUrl;
      let mimeType = "image/jpeg";
      if (input.imageUrl.startsWith('data:image/')) {
        const matches = input.imageUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
           base64Data = input.imageUrl.split(',')[1];
        }
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType
        },
      };

      const result = await this.generateContentWithRetry("gemini-3.1-flash-lite-preview", [prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim().replace(/^\`\`\`json/i, '').replace(/^\`\`\`/i, '').replace(/\`\`\`$/i, '').trim();
      
      const parsed = JSON.parse(text);
      return {
        success: true,
        amount: parsed.amount,
        desc: parsed.desc,
        date: parsed.date,
        supplier: parsed.supplier
      };

    } catch (e: any) {
       return { success: false, error: `解析失敗: ${e.message}` };
    }
  }
}
