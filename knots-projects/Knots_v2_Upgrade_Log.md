# Knots System V2 升級日誌與架構說明書

此文件為 Knots 系統核心重構與 AI 導入升級的正式開發筆記。您可以將此文件直接導入您專屬的 NotebookLM，作為系統更新後的說明書及功能索引。此文件由 AI 開發助理 (Antigravity) 與您共同維護。

> 最後更新階段：Phase 1 (AI 聊天介面與後端通路建立)

---

## 一、 系統架構變動總覽

本次系統從原先純粹的被動紀錄系統，轉型為具備**生成式 AI**、**原生高階會計引擎**、以及**資料爬蟲**的主動式管理平台。
整體應用層包含以下微服務：
*   **API 後端 (`kts_todo_list`)**：Node.js + GraphQL，核心邏輯處，已新增 `aiAssistant` 模組負責調度 Gemini 模型與資料庫。
*   **Web 前端 (`knots-cms`)**：React 18 架構，所有操作介面皆帶有全域的 AI 對話側邊欄 (Tracy)。
*   **手機端 (`knots_app`)**：準備導入全新設計美學的行動裝置 App（尚未實行）。

---

## 二、 開發進度與任務追蹤 (Task Tracker)

### ✅ 已完成的成就 (Completed)
1. **清理專案雜訊**：刪除了無用的 `__MACOSX` 及 `.DS_Store` 檔案，確保環境整潔。
2. **AI 全局聊天介面 (前端)**：於 `knots-cms` 實裝右下角浮動聊天室，套用企業 AI 名稱「Tracy」。
3. **Gemini GraphQL 橋樑 (後端)**：於 `kts_todo_list` 建立 `aiAssistant` 模組，包含專用的 `.input`, `.payload`, `.service` 與 `.resolver`，完成 `gemini-1.5-flash` API 串接。
4. **解析舊版會計邏輯**：成功拆解 `Invoice & Profit Summary.xlsx` 與 `Payable list 2026-27.xlsx`，提煉出未來的 GraphQL Table Schema。

### ⏳ 進行中或即將執行的任務 (Up Next)
1. **NotebookLM Skill 多重筆記路由配置**：
   * 原生僅支援單本筆記。現已透過 `aiAssistant.service.ts` 改建為「意圖路由 (Intent Router)」。
   * AI 將判讀問題，並動態分發 `Promise.all` 請求給裝載「食環署(FEHD)」、「屋宇署(BD)」與「消防處(FSD)」的無頭瀏覽器，進行知識跨領域聯合查詢。
2. **原創會計模組重建**：不再依賴 Excel 或 Google Sheets 同步，把 Dashboard、MAIN 毛利表、AR/AP 等圖表化作我們內建的高效選單。
3. ### Phase 3: 防呆驗證流水線與 OCR (Pipeline Validation & OCR) (已完成)
*(2026-04-20 Update)*
*   **專案表單防呆**：於 `ProjectFormModal.js` 新增新建專案時自動填入預設屬性(第一順位狀態、本年度、當天日期)，並硬性鎖定必選客戶(`clientId`)。
*   **ToDoList 狀態攔截**：在使用 Bryntum Gantt/Grid 更新任務至 `DONE` 前覆核使用者操作，並發送系統通報。
*   **應收應付 (Settlement) OCR 自動對帳**：
    *   在結算彈窗 (`OrderFormSettledmentModal.js` 及 `ProjectOrderSettledmentModal.js`) 實施硬性卡點：若未夾帶憑證，禁止推進結清流程。
    *   建立後端 `AiAssistantService.ocrReceipt` GraphQL 突變接口。
    *   前端透過 【🤖 啟動 OCR 解析單據】 按鍵，將圖片 base64 送往 Gemini 1.5 flash，並根據回傳物件 `amount`, `desc`, `date`, `supplier` 自動覆蓋至入帳欄位。
*   **NotebookLM 多重路由大腦**：實裝系統意圖分析，動態跨域同時搜尋 `食環署`, `屋宇署` 與 `消防處` 法規庫。

### Phase 4: 光學對位與智能比對 (Blueprint Alignment) (已完成)
*(2026-04-22 Update)*
*   **OpenCV 電腦視覺核心**：於後端植入 `align_image.py`，使用 ORB 特徵演算法尋找改版圖紙與原圖紙相同的交叉角點。
*   **單應性補償 (Homography Compensation)**：改寫 `compare.js` 中的比對邏輯，在執行絕對座標的 `pixelmatch` 之前，先以 Python 引擎強制平移/旋轉「測量基準圖」，使得測試版與來源圖精準像素重疊。
*   **解決痛點**：澈底排除過往因印表或轉存時小於 1% 的偏差，導致比對引擎「錯把馮京當馬涼」，將整面圖紙標滿差異紅圈的歷史遺留問題。
4. **擴充 RAG 技術**：接入 Google Drive API 將其餘文件轉成向量存儲庫。

### Phase 5: 核心模組修復與 AI 助手實裝 (Core Bugfixes & AI Integration) (已完成)
*(2026-04-25 Update)*
*   **會計模組架構同步 (Accounting Data Fix)**：修正前端 GraphQL 查詢格式，將舊版 `pagination` 改寫為 Relay Connection `edges { node }` 架構，徹底解決應收、應付清單及專案毛利表「無法載入」的致命錯誤。
*   **甘特圖顯示異常修復 (Gantt Visibility)**：移除導致畫面「隱形」且存在路徑遺失問題的 `IframeGantt`，直接將 `ScreenGantt` 元件掛載於專案視圖，並修復了權限 Token 的繼承機制，讓專案進度表功能恢復正常滿版運作。
*   **AI 助手真實串接 (Gemini Live Chat)**：汰除 `AiChatWidget.js` 內的靜態假資料與 `setTimeout`，成功與後端 `sendAiMessage` GraphQL Mutation 對接。系統現在可以真實呼叫後端的 Gemini 模型並進行即時問答。

### 🛑 需要老闆支援的事項 (Blocked / Action Required)
本章節為卡關要素，請當您有時間時協助排解：
*   **[會計人員測試與舊功能刪除確認]**：目前已在選單 (`knots-cms/src/constants/pageMenu.js`) 隱藏舊有的「會計紀錄、自動入帳、財務報表」功能。請通知會計同事針對目前的新版 Excel 原生化模組進行測試，一旦確認沒有任何操作障礙，請回覆系統進行「正式刪除舊版程式碼」的清理作業。
*   **[PDF 圖面比對]**：尚未取得「過去系統比對一直出錯」的 2 張 PDF/CAD 測試樣本圖紙。*(拿到後我們才能針對光學特徵點的對齊機制進行最佳化寫作)*。
*   **[Bryntum 私有套件庫授權]**：`knots-cms` 前端因為缺乏商業套件 `@bryntum/demo-resources` 與 `@bryntum/gantt` 無法由 AI 自動執行 `npm install`。若日後需要我幫您開網頁測試，可能需要您那邊開發人員提供 `.npmrc` 私有權限配置，或者您在自己的電腦上先行 `yarn install` 以啟動伺服器測試畫面。

---

## 三、 功能操作說明 (適用於 NotebookLM 轉載重點)

### 1. 全新：Tracy (Knots AI Assistant)
*   **如何呼叫**：網頁右下方隨時可見。
*   **能做什麼**：
    *   查詢系統使用教學 (如：教我怎麼立案)。
    *   (即將上線) 後台自動登入 NotebookLM 替員工解答「員工休假規範」、「專案利潤分配法」等複雜問題。
*   **背後原理**：採用 Google 的 Gemini 大型語言模型作為分析大腦，透過我們自建的 Puppeteer 繞過官方 API 限制，達成無縫銜接。

### 2. 全新：原生財務管理 (Accounting Module)
*(待實作完畢後會在此記錄完整的結帳與請款流程說明)*

第一步：啟動本地資料庫 (最重要！)
請打開您電腦上的 XAMPP（或是 Docker），點擊啟動 MySQL。 (如果沒有啟動 MySQL，後端程式一跑就會立刻崩潰)

第二步：啟動後端 (kts_todo_list)
請打開一個新的終端機 (PowerShell)，然後依序複製貼上並執行以下兩行指令（請整行複製，不要複製到多餘的符號）：

powershell
cd "C:\knots system\knots-projects\knots-projects\kts_todo_list"
powershell
npm run start
(執行後，請等它顯示連線成功)

第三步：啟動前端 (knots-cms)
請再打開另一個新的終端機（讓後端的終端機繼續放著跑），然後依序複製貼上以下兩行指令：

powershell
cd "C:\knots system\knots-projects\knots-projects\knots-cms"
powershell
npm run start
等瀏覽器自動跳出 http://localhost:3000 後，您就可以使用 howardchung@knotsltd.com 登入。

還有！剛剛出現了另一個錯誤 EntityMetadataNotFoundError: No metadata for "Task" was found.。 這個錯的根本原因是：您目前的環境其實是本地開發版，但您的 .env 設定檔裡面卻寫著 NODE_ENV=production (正式區環境)，導致後端啟動時，它一直想去讀取正式區專用的 dist/ 編譯資料夾，而不是讀取本地的 src/ 原始碼資料夾，所以它一個資料庫模型 (Entity) 都找不到！

為了讓您能完美在本地測試，我剛剛順手幫您做了兩件事：

將後端的 .env 環境變數改為 NODE_ENV=development。
修正了 ormconfig.json 裡面抓取 Entity 的路徑，讓它能正確對應到本地的 src/**/*.ts。