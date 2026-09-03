# SuperTris 檔案結構清單 (File Structure List)

> 本文件記錄專案目錄結構、檔案職責與行數監控（所有單檔均嚴格小於 400 行）。每次檔案結構異動均會在此更新。

```
SuperTris/
├── index.html              # 主頁面入口（42px純白代碼、type="tel"電話鍵盤、雙層HUD）
├── style.css               # 4欄Grid對齊、全螢幕暫停樣式、10秒Demo動畫、21px選單 (366行)
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
│   ├── tetris.js           # P2暫停禁用、P1 PAUSE提示、TIME計時、⭐星星重力落砂 (385行)
│   ├── renderer.js         # 畫面繪製、34px像素大磚塊、💥炸彈、⭐星星方塊繪製 (127行)
│   ├── board.js            # 棋盤 Matrix、消行、十字爆破、⭐星星解體落砂演算法 (135行)
│   ├── piece.js            # Tetromino 定義、1x1問號/炸彈方塊支援、SRS (157行)
│   ├── score.js            # 計分、Gem寶石系統、連鎖階梯倍率、99命數上限 (122行)
│   └── controls.js         # 鍵盤監聽、純手勢引擎、手動下滑 isManual 標記 (166行)
├── js/                     # 周邊功能模組 (上限 400 行/檔)
│   ├── multiplayer.js      # 42px即時生成、防自我連線、Enter鍵、電話鍵盤支援 (194行)
│   ├── mario.js            # 瑪利歐道具、Gem寶石💎、動態倒數進度條 (221行)
│   ├── audio.js            # Web Audio API 8-bit 合成、30ms 碰地微調音效 (162行)
│   ├── i18n.js             # 繁中/英雙語字典（純code/代碼、防呆提示、Share/Enter code） (174行)
│   ├── leaderboard.js      # 排行榜 Modal 渲染、固定 TOP 10、空值 -- 填補 (97行)
│   ├── supabase-service.js # Supabase REST API / JS SDK 整合與分數上傳 (106行)
│   ├── storage.js          # 本地 localStorage 離線資料管理 (90行)
│   ├── config.example.js   # Supabase 設定檔範本（開源公開） (9行)
│   └── config.js           # 本地實際 Supabase 憑證設定 (8行)
├── assets/
│   ├── sprites/            # 像素圖案資源
│   └── sounds/             # 備用音訊資源
└── supabase/
    └── schema.sql          # Supabase scores 表格定義與 RLS 安全規則 (45行)
```
