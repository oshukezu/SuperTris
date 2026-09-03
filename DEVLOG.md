# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-03] 碰地鎖定循環幀同步徹底修復與手動即時鎖定
- **徹底修復方塊落底後不掉下一塊之嚴重 Bug**：
  - 徹底移除先前依賴瀏覽器非同步 `setTimeout` 的定時器機制，改用主循環每幀 `dt`（delta time 毫秒）在 `gameLoop` 中累加 `lockAccumulator`。
  - 自然下落碰底時，每幀累加 `lockAccumulator += dt`，滿 600ms 100% 同步執行 `lockCurrentPiece(1)` 並立即生成下一塊 `spawnPiece(1)`。
  - 左右平移或旋轉微調時重置 `lockAccumulator = 0`（上限 15 次）。
- **手動加速下滑碰底「即時鎖定」**：
  - 當玩家主動手動向下推動方塊（手勢向下滑或鍵盤向下鍵）且方塊碰底時，跳過 600ms 緩衝立即觸發鎖定並瞬間生成下一塊，操作反饋極致靈敏。
- **介面層級防衝突**：
  - 於 `triggerGameOver()` 與 `returnToTitle()` 時自動強制隱藏 `[SET]` 抽屜面板，避免遮擋結算數據與輸入框。
- **單檔 400 行規範審查**：
  - 全專案單檔行數維持在 87~363 行，完全符合 400 行上限。
