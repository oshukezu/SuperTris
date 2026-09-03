# SuperTris 檔案結構清單 (File Structure List)

> 本文件記錄專案目錄結構、檔案職責與行數監控（所有單檔均嚴格小於 400 行）。每次檔案結構異動均會在此更新。

```
SuperTris/
├── index.html              # 主頁面入口（無 Emoji、頂部整合按鈕、全螢幕手勢層、房間配對彈窗）
├── style.css               # 全域 8-bit Pixel 樣式、純CSS 16x16 點陣圖標、終極防橫移鎖死
├── README.md               # 中英雙語專案說明文件（GitHub 發布用）
├── LICENSE                 # MIT 開源授權
├── DEVLOG.md               # 開發工作日誌（即時記錄每次更動）
├── FILE_STRUCTURE.md       # 本檔案結構清單
├── .gitignore              # Git 忽略設定
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 自動部署 Actions 配置
├── src/                    # 遊戲核心引擎模組 (上限 400 行/檔)
│   ├── tetris.js           # 主循環、800ms Lock Delay 碰地微調緩衝、狀態控制 (371行)
│   ├── renderer.js         # 畫面繪製、像素磚塊紋理渲染、Ghost與Next預覽 (109行)
│   ├── board.js            # 棋盤 Matrix、消行判定、垂直重力塌陷演算法 (172行)
│   ├── piece.js            # Tetromino 定義、1x1問號磚支援、SRS Wall Kick (157行)
│   ├── score.js            # 計分、Combo、溫和速度曲線、99命數上限 (138行)
│   └── controls.js         # 鍵盤監聽、純手勢引擎、60ms 連續高速直落 (168行)
├── js/                     # 周邊功能模組 (上限 400 行/檔)
│   ├── multiplayer.js      # Supabase Realtime 4碼配對、動作廣播與同步 (239行)
│   ├── mario.js            # 瑪利歐道具疊加、動態倒數收縮進度條 (228行)
│   ├── audio.js            # Web Audio API 8-bit 合成、30ms 碰地微調音效 (162行)
│   ├── i18n.js             # 繁中/英雙語字典（純 8-bit NES 標籤無 Emoji） (168行)
│   ├── leaderboard.js      # 排行榜 Modal 渲染、NO.1/2/3 標籤、分頁切換 (87行)
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
