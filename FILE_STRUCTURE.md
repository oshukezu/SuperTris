# SuperTris 檔案結構清單 (File Structure List)

> 本文件記錄專案目錄結構、檔案職責與行數監控（所有單檔均嚴格小於 400 行）。每次檔案結構異動均會在此更新。

```
SuperTris/
├── index.html              # 主頁面入口（含 Title Screen、Canvas、手勢感應層、房間配對彈窗、Modal UI）
├── style.css               # 全域 8-bit Pixel 樣式、四層防縮放與 100dvh 固定版面
├── README.md               # 中英雙語專案說明文件（GitHub 發布用）
├── LICENSE                 # MIT 開源授權
├── DEVLOG.md               # 開發工作日誌（即時記錄每次更動）
├── FILE_STRUCTURE.md       # 本檔案結構清單
├── .gitignore              # Git 忽略設定
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 自動部署 Actions 配置
├── src/                    # 遊戲核心引擎模組 (上限 400 行/檔)
│   ├── tetris.js           # 遊戲主循環、狀態控制、連線分工合作整合 (337行)
│   ├── renderer.js         # 畫面繪製、像素磚塊紋理渲染、Ghost與Next預覽 (109行)
│   ├── board.js            # 棋盤 Matrix、消行判定、垂直重力塌陷演算法 (172行)
│   ├── piece.js            # Tetromino 定義、1x1問號磚支援、SRS Wall Kick (157行)
│   ├── score.js            # 計分、Combo、溫和速度曲線、99命數上限 (138行)
│   └── controls.js         # 鍵盤監聽、手機純手勢引擎與四層防縮放攔截 (174行)
├── js/                     # 周邊功能模組 (上限 400 行/檔)
│   ├── multiplayer.js      # [新增] Supabase Realtime 4碼配對、動作廣播與同步 (239行)
│   ├── mario.js            # 瑪利歐道具疊加規則、場地轉問號磚、Buff管理 (191行)
│   ├── audio.js            # Web Audio API 8-bit 程式合成音效與 BGM (179行)
│   ├── i18n.js             # 繁體中文 (zh-TW) 與英文 (en) 多語系字典與切換 (170行)
│   ├── leaderboard.js      # 排行榜 Modal 渲染、勝率百分比計算、分頁切換 (88行)
│   ├── supabase-service.js # Supabase REST API / JS SDK 整合與分數上傳 (106行)
│   ├── storage.js          # 本地 localStorage 離線資料管理 (90行)
│   ├── config.example.js   # Supabase 設定檔範本（開源公開） (9行)
│   └── config.js           # 本地實際 Supabase 憑證設定（已加入 .gitignore） (8行)
├── assets/
│   ├── sprites/            # 像素圖案資源
│   └── sounds/             # 備用音訊資源
└── supabase/
    └── schema.sql          # Supabase scores 表格定義與 RLS 安全規則 (45行)
```
