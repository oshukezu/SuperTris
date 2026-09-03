# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-04] 1985 NES 超級瑪利歐原版像素磚塊風格全面重塑
- **1985 瑪利歐像素交錯磚紋 (Classic Mario Brick Block)**：
  - 在 `src/renderer.js` 實作 `drawMarioBrick`：每顆方塊繪製 4 塊交錯錯位磚石，帶有深黑橫豎磚縫（Mortar Lines）、頂部高光與底部暗影，保留俄羅斯方塊辨識色相的同時散發濃厚的 1985 紅白機情懷。
- **1985 暖金問號方塊 (Question Block ?)**：
  - 實作 `drawQuestionBlock`：暖金色 `#fc9838` 底色、雙層暗橘立體邊框、4 個角落經典 2x2 像素深色小鉚釘（Corner Rivets）與中央粗體 8-Bit 像素白色問號。
- **1985 城堡石磚 / 炸彈 (Castle Stone Block 💥)**：
  - 庫巴城堡地底深灰石磚質感與 💥 標誌。
- **單檔 400 行限制維護**：
  - 全專案單檔行數維持在 **8~393 行**，完全符合 400 行上限。
