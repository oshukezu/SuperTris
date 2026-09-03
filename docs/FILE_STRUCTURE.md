# SuperTris 檔案結構清單 (File Structure List)

> 本文件記錄專案目錄結構、檔案職責與行數監控（所有單檔均嚴格小於 400 行）。每次檔案結構異動均會在此更新。

```
SuperTris/
├── index.html              # 主頁面入口（P2暫停副標題、P2蘑菇等待、P1發車按鈕、電話鍵盤）
├── style.css               # 蘑菇跳動動畫、選單閃爍動畫、去框透明、全螢幕暫停 (389行)
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
│   ├── renderer.js         # 3階堆疊高度磚色、LV3隱藏Ghost、1985動畫 (277行)
│   ├── tetris.js           # 首頁方向鍵選單、雙人同方塊同步、300ms心跳、WakeLock (393行)
│   ├── game_ui.js          # 1P專屬暫停權限、HUD 按鈕事件監聽、成績提交 (77行)
│   ├── controls.js         # 鍵盤監聽、純手勢引擎、P1/P2 嚴格分工與雙擊硬降 (151行)
│   ├── board.js            # 棋盤 Matrix、isBoardEmpty全清檢測、⭐星星解體落砂 (137行)
│   ├── piece.js            # Tetromino 定義、1x1問號/炸彈方塊支援、SRS (157行)
│   └── score.js            # 每消20行升級、AllClear獎勵(+3000&💎5)、99命數上限 (101行)
├── js/                     # 周邊功能模組 (上限 400 行/檔)
│   ├── multiplayer.js      # P1開局握手、hard_drop接收、P2蘑菇等待、電話鍵盤 (249行)
│   ├── mario.js            # 瑪利歐道具、Gem寶石💎、動態倒數進度條 (221行)
│   ├── audio.js            # Web Audio API 8-bit 合成、30ms 碰地微調音效 (162行)
│   ├── i18n.js             # 繁中/英雙語字典（等待 1p 解除暫停/隊友已連線） (182行)
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
