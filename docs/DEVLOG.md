# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-03] 第二排HUD去框同色融為一體與遊戲期間Screen Wake Lock螢幕常亮
- **第二排 HUD 純粹化**：
  - `.sub-hud-row` 去除所有邊框（`border: none;`），背景改為透明（`background: transparent;`），與第一排深色頂部融為一體，視覺清爽大氣。
- **Screen Wake Lock 螢幕常亮機制**：
  - 在 `src/tetris.js` 整合 `navigator.wakeLock.request('screen')`。
  - 進入遊戲開始遊玩與解除暫停時鎖定螢幕保持常亮，防止暗屏休眠。
  - 暫停、Game Over 或回到首頁標題時自動釋放 Wake Lock，保護電池。

---

### [2026-09-03] 暫停畫面文字統一為純粹經典 PAUSED（去除所有括號與贅字）
- **暫停遮罩極簡化**：
  - 暫停畫面去除 `(TAP ANYWHERE TO RESUME)` 等所有括號與贅字，全螢幕中央僅大氣顯示純粹的 **`PAUSED`**。

---

### [2026-09-03] 42px純白代碼即時生成、電話數字鍵盤、全站統一code與防呆機制
- **代碼第 1 毫秒即時生成**：
  - 點擊 `2P player` 打開彈窗瞬間立即生成 4 位隨機代碼並渲染展示，升級為 **42px 純白大字**。
- **原生電話純數字鍵盤配置**：
  - 輸入框設置 `type="tel" inputmode="numeric" pattern="[0-9]*"`。
- **單檔 400 行限制審查**：
  - 全專案單檔行數維持在 87~398 行，完全符合 400 行上限。
