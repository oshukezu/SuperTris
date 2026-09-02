# SuperTris — 俄羅斯方塊 × 超級瑪利歐 (Tetris × Super Mario)

<div align="center">

![SuperTris 8-Bit Banner](https://img.shields.io/badge/Retro_Game-8--Bit_Pixel-red?style=for-the-badge)
![License MIT](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)
![Supabase Enabled](https://img.shields.io/badge/Cloud_Leaderboard-Supabase-3ecf8e?style=for-the-badge)

**經典俄羅斯方塊與超級瑪利歐世界觀的完美結合！**
帶有道具系統、三階段危機色階、8-Bit Web Audio 音效與雲端排行榜的輕量級網頁遊戲。

[繁體中文](#繁體中文說明) | [English](#english-documentation)

</div>

---

## 繁體中文說明

### 🎮 遊戲特色
1. **瑪利歐道具系統**：
   - 🪙 **金幣**：每收集 100 枚自動兌換 **1UP (加一條命)**！
   - 🍄 **紅色蘑菇**：30 秒內得分加倍 (×2)！
   - 🍄 **綠色蘑菇**：立即增加 1 條命 (1UP)！
   - 🌸 **火焰花**：後續 5 次方塊落下引爆 3×3 範圍周圍磚塊！
   - ⭐ **無敵星星**：15 秒內方塊落下具備雷射穿透消除效果！
2. **三階段高度危機色階**：
   - 堆疊 < 50%：混磚紅系（安全）
   - 堆疊 ≥ 50%：暖棕土系（警戒）
   - 堆疊 ≥ 80% (剩 4 行)：鋼藍系（臨界警示）
3. **8-Bit 程式合成音效**：全程使用 Web Audio API 原生合成方波與三角波音效，零版權爭議。
4. **雲端排行榜**：支援 Supabase 雲端資料庫儲存成績，並即時計算超越玩家百分比（若無配置則自動 Fallback 至本機 localStorage 離線儲存）。
5. **單人冒險與雙人合作**：支援單人無限生存模式與同鍵盤雙人合作模式。

---

### 🕹️ 操作方式

#### 電腦鍵盤 (單人 / P1)
- `←` / `→` 或 `A` / `D`：左右移動
- `↓` 或 `S`：加速落下（軟落）
- `↑` (雙擊) 或 `Space`：**瞬間落下到底 (Hard Drop)**
- `↑` (單擊) 或 `W` / `X`：順時針旋轉
- `Z`：逆時針旋轉
- `C`：**暫存方塊 (Hold)**
- `P`：暫停遊戲

#### 電腦鍵盤 (雙人合作 P2)
- `J` / `L` 或 `4` / `6`：左右移動
- `K` 或 `5`：加速落下
- `I` 或 `8`：旋轉方塊
- `Enter` 或 `0`：瞬間落下

#### 手機 / 平板 (Touch Pad)
- **SVG D-Pad 十字鍵**：左右滑移、下方軟落、上方旋轉
- **A 鍵**：旋轉方塊
- **B 鍵**：暫存方塊 (Hold)
- **DROP 鍵**：瞬間落下
- ⚠️ *本遊戲禁止橫向操作，請以直向螢幕進行遊玩。*

---

### ☁️ Supabase 雲端排行榜設定

1. 在 [Supabase](https://supabase.com/) 建立免費專案。
2. 進入 SQL Editor，執行本專案中的 `supabase/schema.sql` 建立資料表與 RLS 安全規則。
3. 複製 `js/config.example.js` 為 `js/config.js`，填入您的 `SUPABASE_URL` 與 `SUPABASE_ANON_KEY`：
   ```js
   window.SUPERTRIS_CONFIG = {
     SUPABASE_URL: 'https://your-project.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-key',
     ENABLE_CLOUD_LEADERBOARD: true
   };
   ```
4. 部署至 GitHub Pages 即大功告成！

---

## English Documentation

### 🎮 Features
- **Mario Item System**: Coins (100 Coins = 1UP), Red Mushroom (Score ×2), Green Mushroom (1UP), Fire Flower (3x3 Bomb drops), Super Star (Laser clear).
- **Dynamic 3-Phase Color Palette**: Shifts dynamically according to board stack height (Safe Red -> Warning Brown -> Critical Blue).
- **8-Bit Web Audio Synth**: Synthesizes authentic retro 8-bit sound effects without copyright issues.
- **Cloud Leaderboard**: Powered by Supabase with live percentile calculation and offline localStorage fallback.
- **Single & 2-Player Co-op Modes**.

### 📄 License
Released under the [MIT License](LICENSE).
