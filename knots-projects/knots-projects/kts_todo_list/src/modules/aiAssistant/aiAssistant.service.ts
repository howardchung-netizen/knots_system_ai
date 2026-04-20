import { Service, Inject } from "typedi";
import { AiChatMessageInput } from "./input/aiChatMessage.input";
import { AiChatMessagePayload } from "./payload/aiChatMessage.payload";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NotebookLmSkillService } from "./notebookLmSkill.service";
import { AiOcrReceiptInput } from "./input/aiOcrReceipt.input";
import { AiOcrReceiptPayload } from "./payload/aiOcrReceipt.payload";

@Service()
export class AiAssistantService {
  private genAI: GoogleGenerativeAI;
  
  constructor(
    @Inject(type => NotebookLmSkillService)
    private readonly notebookLmSkill: NotebookLmSkillService
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }

  async processMessage(input: AiChatMessageInput): Promise<AiChatMessagePayload> {
    try {
      if(!process.env.GEMINI_API_KEY) {
        return { response: "伺服器未設定 Gemini API 金鑰 (GEMINI_API_KEY)，請在後端設定檔中加入。" };
      }

      // 取得模型
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prompt 模板 (意圖路由/Intent Routing)
      const prompt = `您是 Knots 系統的專屬 AI 助理「Tracy」。
請判斷使用者的問題是否需要查閱公司內部法規。
這三本法規筆記的守備範圍如下：
- [FEHD] 食環署：飲食場所牌照申請流程、相關裝修法例。
- [BD] 屋宇署：建築條例、小型工程、入則工程 (A&A works)。
- [FSD] 消防處：建築物及餐廳消防通風條例。

如果使用者提出的問題需要查閱上述法規，請您「只」回覆對應的觸發標籤，例如 "[CALL_NOTEBOOKLM_FEHD]"，或者若需跨域查詢則同時寫上多個標籤 "[CALL_NOTEBOOKLM_FEHD][CALL_NOTEBOOKLM_FSD]"。此時請不要有任何其他廢話對話。
如果問題完全不需要查法規，請直接發揮助理的角色，友善、專業地回答使用者。

使用者說：
"${input.message}"
`;
      
      const result = await model.generateContent(prompt);
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
      if(!process.env.GEMINI_API_KEY) {
        return { success: false, error: "伺服器未設定 Gemini API 金鑰 (GEMINI_API_KEY)。" };
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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

      const result = await model.generateContent([prompt, imagePart]);
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
       return { success: false, error: \`解析失敗: \${e.message}\` };
    }
  }
}
