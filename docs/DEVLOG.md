# SuperTris 開發工作日誌 (Development Log)

---

### [2026-09-04] 炸彈十字爆破引爆問號方塊生成獎勵實作
- **炸彈引爆問號磚獎勵 (Bomb Triggers Question Rewards)**：
  - 在 `src/board.js` 的 `explodeCross` 中，清空格子的同時收集十字範圍內所有被炸毀的問號方塊坐標（`destroyedQuestions`）。
  - 在 `src/tetris.js` 實作 `triggerQuestionRewards`：炸毀問號磚時，在該被炸掉的格子上即刻生成跳躍金幣（若抽中金幣）或冒出道具並延遲生效（若抽中道具）。
- **單檔 400 行限制維護**：
  - 全專案單檔行數維持在 **8~399 行**，完全符合 400 行上限。
