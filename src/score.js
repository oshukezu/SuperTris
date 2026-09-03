// SuperTris 計分與倍率引擎 (每消20行升級、All Clear 全清獎勵、99命數上限)
class ScoreEngine {
  constructor() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gems = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.baseLineScores = [0, 100, 300, 500, 800];
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gems = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.updateHUD();
  }

  addClearedLines(lineCount, cascadeMultiplier = 1.0) {
    if (lineCount > 0) {
      this.lines += lineCount;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      // 規則：每消 20 行提升一個等級
      this.level = Math.floor(this.lines / 20) + 1;

      const baseScore = this.baseLineScores[Math.min(lineCount, 4)] || 100;
      let mushroomMult = 1.0;
      if (window.Mario && window.Mario.activeEffects.scoreMultiplier > 1) {
        mushroomMult = window.Mario.activeEffects.scoreMultiplier;
      }
      const comboMult = 1 + (this.combo - 1) * 0.1;
      const earned = Math.round(baseScore * this.level * mushroomMult * comboMult * cascadeMultiplier);
      this.score += earned;
      this.addGems(lineCount);
    } else {
      this.combo = 0;
    }
    this.updateHUD();
  }

  // All Clear 全清獎勵 (+3000 分 & +💎5)
  addAllClearBonus() {
    this.score += 3000;
    this.addGems(5);
    this.updateHUD();
  }

  addGems(amount = 1) {
    this.gems += amount;
    if (this.gems >= 100) {
      const extraLives = Math.floor(this.gems / 100);
      this.gems = this.gems % 100;
      this.addLives(extraLives);
      if (window.Mario) window.Mario.showToast(window.I18N.t('coin_100_bonus'));
      window.SoundEngine.play1UP();
    }
    this.updateHUD();
  }

  addLives(amount = 1) {
    this.lives = Math.min(99, this.lives + amount);
    this.updateHUD();
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    return this.lives <= 0;
  }

  getDropInterval() {
    // 依等級加速 (每20行降間隔)
    const base = 800;
    const factor = Math.max(120, base - (this.level - 1) * 65);
    return factor;
  }

  updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = String(this.score).padStart(6, '0');

    const gemsEl = document.getElementById('hud-coins');
    if (gemsEl) gemsEl.textContent = this.gems;

    const linesEl = document.getElementById('hud-lines');
    if (linesEl) linesEl.textContent = this.lines;

    const livesEl = document.getElementById('hud-lives');
    if (livesEl) livesEl.textContent = this.lives;
  }
}

window.ScoreEngine = ScoreEngine;
