# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-03] 終極優化：全 Emoji 替換、800ms Lock Delay、連續直落與版面防橫移跑版
- **全面移除 Emoji，改用純 CSS 16x16 點陣圖標與 8-Bit 標籤**：
  - 徹底清除全站所有 Emoji（金幣、蘑菇、星星、火焰花、獎牌、喇叭等）。
  - 在 `style.css` 透過純 CSS 像素陰影與裁切實作 `.icon-coin`、`.icon-mushroom`、`.icon-star`、`.icon-fire` 16x16 點陣圖標，零外部圖片依賴，原汁原味呈現紅白機 8-bit 風格。
  - 按鈕與文字全數改為 NES 經典大寫文字（`[SOUND]`, `[PAUSE]`, `[RESTART]`, `[RANK]`, `NO.1`, `[1UP]` 等）。
- **HUD 道具動態倒數收縮進度條**：
  - `js/mario.js` 實作動態像素進度條與大字倒數秒數（`SCORE x2 (28s)`、`SUPER STAR (12s)`），秒數小於等於 5 秒時進入紅色警示閃爍。
- **手機觸控連續極速直落 (Continuous Fast Drop)**：
  - `src/controls.js`：向下滑動短按為單格軟落；持續按住時以每 60ms 快速下墜一格的頻率進入極速連續直落，手指放開立即停止。
- **800ms 碰地微調延遲 (Lock Delay)**：
  - `src/tetris.js`：當方塊碰觸底部或積木表面時啟動 800ms 緩衝計時器；期間每次左右平移或旋轉微調皆重新刷新 800ms（上限 15 次）。
  - 碰地橫移微調時伴隨輕脆的 30ms 短音（`SoundEngine.playLockSlide()`）。
- **移除左側按鈕、頂部導航列整合**：
  - 棋盤左側完全清空，棋盤居中極大化。
  - 頂部導航列完整整併：`[EN/中] [SOUND] [PAUSE] [RESET] [RANK]`。
- **根治手機下拉誤觸與第三方瀏覽器左右橫移跑版**：
  - 全域設定 `position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important; overscroll-behavior: none !important;`。
  - 全域 `touchmove` 被動監聽關閉並呼叫 `e.preventDefault()`，徹底阻斷原生下拉刷新與 WebView 橫向拉扯位移。
- **行數規範嚴格審查**：
  - 全專案單檔行數維持在 87~371 行，完全符合 400 行限制。
