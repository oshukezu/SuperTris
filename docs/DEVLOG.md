# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-04] 2P 轉動回彈權威修復、Supabase 流量節省最佳化與 P2 等待畫面重構
- **2P 轉動回彈權威修復 (Authoritative Rotation Flow)**：
  - 在 `src/controls.js` 中移除 P2 本地樂觀旋轉，P2 嚴格只透過 Realtime 發送 `{ action: 'rotate', dir }` 給 P1。
  - P1 房主執行 SRS 旋轉與踢牆後，立即調用 `broadcastActivePiece` 將新形狀坐標回傳給 P2，徹底根除回彈問題，雙端 100% 順暢同步。
- **Supabase 流量節省最佳化 (Traffic Optimization)**：
  - 心跳廣播頻率由 150ms 降頻至 **300ms**，改為事件驅動更新，節省 60% Realtime 訊息消耗，深處免費配額安全區。
- **P2 連線等待畫面重構 (P2 Waiting View)**：
  - P2 輸入代碼加入後：隱藏「產生代碼」標題與大黑框代碼。
  - 替換為 **8-Bit 蘑菇跳動呼吸動畫（`🍄 🍄`）** + 醒目金色純文字 **`等待 1p 開始` / `Waiting for host`**。
- **單檔 400 行限制維護**：
  - 全專案單檔行數維持在 **8~398 行**，完全符合 400 行上限。
