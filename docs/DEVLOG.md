# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-03] 1985 NES全螢幕經典首頁、Flexbox全平台防跑版與俐方體8-Bit中英像素字型
- **1985 NES 經典全螢幕首頁 (Classic Fullscreen Title)**：
  - 首頁填滿全螢幕（`position: fixed; inset: 0;`），採用經典 NES 天空藍底色（`#5c94fc`）。
  - 復刻頂部數據列 `MARIO 000000 | 💎x00 | WORLD 1-1 | TIME`。
  - 中央呈現帶鉚釘與黑白雙層投影的經典棕色大木牌 `SUPER TRIS`。
  - 底部呈現經典像素綠色山丘、草叢與 8-Bit 紅磚地磚。
- **全平台 Flexbox 終極防跑版架構**：
  - 頂部導航列 `.top-nav` 與置頂 HUD `.top-hud-bar` 設置 `flex-shrink: 0;` 永久牢固釘在頂端，絕不被網址列伸縮推擠。
  - 棋盤容器採用 `flex: 1; min-height: 0;` 搭配 `object-fit: contain; aspect-ratio: 1 / 2;`，在任何手機與平板瀏覽器（Safari/Chrome/LINE）中均能完美居中最大化適配。
- **俐方體 11 號 (Cubic 11) 像素中英字型**：
  - 引入開源點陣繁體中文字型 `Cubic 11` 與 `Press Start 2P`，中英文字級完美等高，徹底消除系統黑體造成的視覺脫節感。
- **單檔 400 行限制審查**：
  - 全專案單檔行數維持在 87~377 行，完全符合 400 行上限。
