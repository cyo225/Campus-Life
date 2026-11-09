# Campus Life 三大核心 AI 助教與智慧推播系統建置計畫（已完成）

為朝陽科技大學【Campus Life】行動優先 PWA 導入三大核心 AI 助教與自動化推播模組：結合 `@google/genai` (Gemini 3.8 Flash) 實作「Tronclass 作業/題目一鍵解題與詳細步驟拆解」、以 Web Notifications API 結合站內通知中心實作「每日 09:00 / 12:00 / 18:00 定時提醒與考前一天加倍密集推播」，以及「考前教材/投影片自動生成三合一衝刺重點模組（考點精華 + 公式速記 + 猜題自測）」。

---

## 審查確認與核心決策 (User Review & Critical Decisions)

> [!IMPORTANT]
> 1. **AI 助教核心模型與全端架構 [已落實]**：
>    - 模型選擇：**快速平衡型（Gemini 3.8 Flash）**。
>    - 依據 Gemini 規範，所有 AI 呼叫皆在伺服器端（Express `/api/ai/*` 代理端點）使用 `@google/genai` SDK 進行呼叫與解析，保障 API 金鑰安全與多模態檔案處理效能。
> 2. **智慧定時推播雙軌系統 [已落實]**：
>    - 使用者確認選擇：**雙軌通知（瀏覽器系統級 Web Notification + 站內通知中心抽屜）**。
>    - 定時排程引擎：每日固定在 **09:00（晨間待辦通報）**、**12:00（午間未完成盤點）**、**18:00（晚間衝刺結算）** 自動檢查並推播未完成作業總數。
>    - 考試加權提醒：針對考試類待辦，平時每日 1 次，**【考前一天 (24小時內)】自動提升為每日 2 次密集推播**。
> 3. **考前教材解析「三合一」衝刺模組 [已落實]**：
>    - 使用者確認選擇：教材上傳（支援文字貼上、PDF/PPT 內容解析）後，自動產出：
>      1. **核心考點精華速讀 (Key Concepts)**：章節精要與必考重點提示。
>      2. **公式與專有名詞速記表 (Formula & Term Cheatsheet)**：考試易混淆定義與計算公式。
>      3. **隨堂猜題自測題庫 (Interactive Quiz)**：3–5 題即時自我檢驗題，支援點擊展開詳解。
> 4. **Apple / Notion 純暗灰視覺與文字細緻化傳承 [已落實]**：
>    - 嚴格維持 `#121212` 炭黑底色、`#1C1C1E` / `#242426` 質感卡片與 `#2C2C2E` 精細分割線。
>    - 卡片標題與內文一律維持清爽細緻之 `font-medium` / `font-normal` 純白文字 (`text-white`) 與適度行高 (`leading-relaxed`)，徹底杜絕過粗沾黏字重。

---

## 交付里程碑檢驗結果 (Implementation Verification)

- [x] **後端 AI API 與服務層建置**：
  - `server.ts` 配置 Express 與 Vite middleware，整合 `@google/genai`。
  - `/api/ai/solve-homework`：解析題目並生成題意核心、詳細步驟拆解（Step-by-step）與避坑指南。
  - `/api/ai/exam-digest`：解析教材內容生成考點精華、公式速記表與隨堂自測題。
- [x] **智慧定時推播雙軌系統 (`src/services/notificationService.ts`)**：
  - Web Notification 原生權限請求與推播觸發器。
  - 每日 09:00、12:00、18:00 定時檢查未完成作業數量自動推播。
  - 考前 24H 自動加倍啟動早晚 2 次密集倒數通知。
  - 站內通知中心抽屜 (`NotificationCenterModal.tsx`)，支援未讀紅點、一鍵已讀、歷史紀錄與 4 組即時模擬測試觸發器。
- [x] **前端元件整合與 UI 打造**：
  - `src/components/AIHomeworkSolverModal.tsx`：TronClass 作業題目貼上/附件上傳、Gemini 即時解題、步驟解析與一鍵儲存綁定。
  - `src/components/AIExamDigestModal.tsx`：考前教材/投影片文字解析，產出 5 大考點、公式速記與 3 題互動式自測題（含即時答題解析）。
  - `src/components/Header.tsx`：新增通知鈴鐺與未讀數徽章。
  - `src/components/tabs/TodoView.tsx`：新增「AI 智慧助教中心」橫幅、作業卡片「AI 步驟解析」收合檢視與「重新推導」功能、考試卡片「3合1 複習包」快捷按鈕。
- [x] **編譯與驗證**：
  - `compile_applet` 與 `lint_applet` 同步通過（0 errors）。
  - Dev 伺服器在 Port 3000 上順暢運行，API 端點驗證成功。
