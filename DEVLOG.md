# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-03] 手機純手勢操控、四層防跑版防縮放與跨機雙人連線全面重構
- **手機端純手勢操作重構**：
  - 徹底移除舊有的 SVG D-Pad 虛擬按鍵，釋放全螢幕觸控面積。
  - 水平滑動（Swipe Left/Right）：靈敏平移方塊（每位移 22px 觸發一格位移）。
  - 垂直向下滑動（Swipe Down）：進入軟落加速，手指持續按住時維持週期性軟落。
  - 單擊螢幕任意處（Tap）：觸發順時針旋轉。
  - 完全移除手機端 Hard Drop，徹底消除手勢滑移時誤判觸發落地暴斃的風險。
- **四層立體防跑版與嚴禁縮放防護**：
  - Viewport 嚴格配置 `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no`。
  - 全域 CSS 注入 `touch-action: none !important; user-select: none !important; -webkit-touch-callout: none !important;`。
  - 容器固定鎖定 `height: 100dvh; max-height: 100dvh; overflow: hidden;`，禁止滾動條彈跳。
  - JS 攔截 `gesturestart/change/end` 多指縮放，以及攔截 300ms 內的連續快速 `touchend`，徹底杜絕 iOS Safari 雙擊放大與畫面晃動。
- **Supabase Realtime 跨裝置雙人配對與分工合作**：
  - 新增專屬模組 `js/multiplayer.js`（239 行），採用 Supabase Realtime 廣播頻道。
  - 統一電腦與行動端的雙人遊玩體驗：
    - **P1 房主（舵手）**：建立房間產生 4 碼邀請碼，負責方塊**水平左右移動**（滑動 / 方向鍵）。
    - **P2 訪客（引擎）**：輸入 4 碼邀請碼加入，負責方塊**旋轉與加速**（點擊螢幕 / 下滑加速）。
  - 兩人共控同一塊方塊，房主每 150ms 權威廣播棋盤狀態與分數，實現極低延遲的默契連線合作。
- **檔案規範檢查**：
  - 全專案單檔行數維持在 88~337 行，完全符合 400 行上限。
