// SuperTris 計分、Combo、Gem 寶石與等級系統 (Score Module)
class ScoreEngine {
  constructor() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.gems = 0; // 升級為 Gem Stone 寶石
    this.lives = 3;
  }

  reset() {
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.gems = 0;
    this.lives = 3;
    this.updateHUD();
  }

  // 1. 消除行數計分 (支援 multiplier 與 cascadeMultiplier 連鎖倍率加成)
  addClearedLines(count, cascadeMultiplier = 1) {
    if (count <= 0) {
      this.combo = 0;
      this.updateHUD();
      return 0;
    }

    const basePoints = [0, 100, 300, 500, 800];
    const points = (basePoints[count] || count * 200) * this.level;
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const comboBonus = this.combo > 1 ? (this.combo - 1) * 50 * this.level : 0;
    const powerupMultiplier = (window.Mario && window.Mario.activeEffects.scoreMultiplier) || 1;

    // 總分 = (基礎分 + Combo加成) × 道具倍率 × 重力連鎖倍率
    const gained = Math.round((points + comboBonus) * powerupMultiplier * cascadeMultiplier);
    this.score += gained;
    this.lines += count;

    // 每消除 10 行升一級
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      window.SoundEngine.playPowerUp();
    }

    this.updateHUD();
    return gained;
  }

  // 2. Gem 寶石管理 (每滿 100 顆換 1UP)
  addGems(amount = 1) {
    this.gems += amount;
    if (this.gems >= 100) {
      this.gems -= 100;
      this.addLives(1);
      window.SoundEngine.playOneUp();
      if (window.Mario) {
        window.Mario.showToast(window.I18N.t('coin_100_bonus'));
      }
    }
    this.updateHUD();
  }

  // 兼容舊介面 addCoins
  addCoins(amount = 1) {
    this.addGems(amount);
  }

  // 3. UP 命數管理 (上限 99 命)
  addLives(amount = 1) {
    this.lives = Math.min(99, this.lives + amount);
    this.updateHUD();
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    return this.lives <= 0;
  }

  // 4. 計算掉落間隔時間 (毫秒，溫和曲線)
  getDropInterval() {
    if (this.level <= 20) {
      return Math.max(600, 1200 - (this.level - 1) * 30);
    }
    const extraLevels = this.level - 20;
    return Math.max(80, 600 - extraLevels * 15);
  }

  updateHUD() {
    const elScore = document.getElementById('hud-score');
    const elLevel = document.getElementById('hud-level');
    const elLines = document.getElementById('hud-lines');
    const elGems = document.getElementById('hud-coins');
    const elLives = document.getElementById('hud-lives');
    const elCombo = document.getElementById('hud-combo');

    if (elScore) elScore.textContent = this.score.toLocaleString();
    if (elLevel) elLevel.textContent = this.level;
    if (elLines) elLines.textContent = this.lines;
    if (elGems) elGems.textContent = this.gems;
    if (elLives) elLives.textContent = this.lives;
    if (elCombo) {
      if (this.combo > 1) {
        elCombo.textContent = `${this.combo} COMBO!`;
        elCombo.classList.remove('hidden');
      } else {
        elCombo.classList.add('hidden');
      }
    }
  }
}

window.ScoreEngine = ScoreEngine;
