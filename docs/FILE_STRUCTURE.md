# SuperTris 檔案結構清單 (File Structure List)

> 本文件記錄專案目錄結構、檔案職責與行數監控（所有單檔均嚴格小於 400 行）。每次檔案結構異動均會在此更新。

```
SuperTris/
├── index.html              # 主頁面入口（純粹PAUSED遮罩、42px純白代碼、type="tel"電話鍵盤）
├── style.css               # 4欄Grid去框透明、全螢幕暫停、10秒Demo動畫、21px選單 (359行)
├── README.md               # 中英雙語專案說明文件（GitHub 首頁展示用）
├── LICENSE                 # MIT 開源授權
├── .gitignore              # Git 忽略設定
├── .gitattributes          # Git 屬性設定
├── docs/                   # 專案開發與維護說明文件資料夾
│   ├── DEVLOG.md           # 開發工作日誌（即時記錄每次更動）
│   └── FILE_STRUCTURE.md   # 本檔案結構清單
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 自動部署 Actions 配置
├── src/                    # 遊戲核心引擎模組 (上限 400 行/檔)
│   ├── tetris.js           # AllClear獎勵、常態消行不震塌、WakeLock常亮、⭐星星落砂 (398行)
│   ├── renderer.js         # LV3隱藏Ghost、1985金幣拋跳、道具冒出動畫、大磚塊 (215行)
│   ├── board.js            # 棋盤 Matrix、isBoardEmpty全清檢測、⭐星星解體落砂 (137行)
│   ├── piece.js            # Tetromino 定義、1x1問號/炸彈方塊支援、SRS (157行)
│   ├── score.js            # 每消20行升級、AllClear獎勵(+3000&💎5)、99命數上限 (101行)
│   └── controls.js         # 鍵盤監聽、純手勢引擎、手動下滑 isManual 標記 (166行)
├── js/                     # 周邊功能模組 (上限 400 行/檔)
│   ├── multiplayer.js      # isAvailable修復、42px生成、防自我連線、電話鍵盤 (194行)
│   ├── mario.js            # 瑪利歐道具、Gem寶石💎、動態倒數進度條 (221行)
│   ├── audio.js            # Web Audio API 8-bit 合成、30ms 碰地微調音效 (162行)
│   ├── i18n.js             # 繁中/英雙語字典（純code/代碼、PAUSED、Share/Enter code） (174行)
│   ├── leaderboard.js      # 排行榜 Modal 渲染、固定 TOP 10、空值 -- 填補 (97行)
│   ├── supabase-service.js # 補齊isConfigured與getTopScores支援、排行榜資料獲取 (109行)
│   ├── storage.js          # 本地 localStorage 離線資料管理 (90行)
│   ├── config.example.js   # Supabase 設定檔範本（開源公開） (9行)
│   └── config.js           # 本地實際 Supabase 憑證設定 (8行)
├── assets/
│   ├── sprites/            # 像素圖案資源
│   └── sounds/             # 備用音訊資源
└── supabase/
    └── schema.sql          # Supabase scores 表格定義與 RLS 安全規則 (45行)
```
