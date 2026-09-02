// SuperTris 計分、等級、金幣、UP命數與 Combo 管理 (Score Module)
class ScoreEngine {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.coins = 0;
    this.lives = 3;       // 預設 3 條命 (UP 數)
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = Date.now();
    this.playDuration = 0; // 秒
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.coins = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = Date.now();
    this.playDuration = 0;
    this.updateHUD();
  }

  // 1. 消行計分 (標準任天堂計分法 × 連擊加乘 × 蘑菇加倍)
  addClearedLines(count) {
    if (count <= 0) {
      this.combo = 0; // 中斷連擊
      this.updateHUD();
      return 0;
    }

    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // 基礎行數分數
    let baseScore = 0;
    switch (count) {
      case 1: baseScore = 100; break;
      case 2: baseScore = 300; break;
      case 3: baseScore = 500; break;
      case 4: baseScore = 800; break; // Tetris!
      default: baseScore = count * 250; break;
    }

    // 連擊倍率
    let comboMultiplier = 1;
    if (this.combo === 2) comboMultiplier = 1.5;
    else if (this.combo === 3) comboMultiplier = 2.0;
    else if (this.combo >= 4) comboMultiplier = 3.0;

    // 紅蘑菇加倍效果
    const itemMultiplier = (window.Mario && window.Mario.activeEffects.scoreMultiplier) || 1;

    const gained = Math.round(baseScore * this.level * comboMultiplier * itemMultiplier);
    this.score += gained;
    this.lines += count;

    // 金幣獲取 (1行 1枚, 2行 3枚, 3行 5枚, 4行 10枚)
    const coinReward = count === 4 ? 10 : (count * 2 - 1);
    this.addCoins(coinReward);

    // 等級成長：每消除 10 行升一級
    const targetLevel = Math.floor(this.lines / 10) + 1;
    if (targetLevel > this.level) {
      this.level = targetLevel;
      window.SoundEngine.playPowerUp();
    }

    this.updateHUD();
    return gained;
  }

  // 2. 金幣累積 (滿 100 兌換 1UP)
  addCoins(amount) {
    this.coins += amount;
    while (this.coins >= 100) {
      this.coins -= 100;
      this.addLives(1);
      window.SoundEngine.playOneUp();
      if (window.Mario) window.Mario.showToast(window.I18N.t('coin_100_bonus'));
    }
    this.updateHUD();
  }

  // 3. UP 命數管理 (上限 99 命)
  addLives(amount = 1) {
    this.lives = Math.min(99, this.lives + amount);
    this.updateHUD();
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    return this.lives <= 0; // 是否真正 Game Over
  }

  // 4. 計算掉落間隔時間 (毫秒，隨等級加快)
  // Level 1=1200ms，Level 20 前每升一級 -30ms，Level 20 後每升一級 -15ms
  getDropInterval() {
    if (this.level <= 20) {
      return Math.max(600, 1200 - (this.level - 1) * 30);
    }
    // Level 20 後快速加速段
    const extraLevels = this.level - 20;
    return Math.max(80, 600 - extraLevels * 15);
  }

  updateHUD() {
    const elScore = document.getElementById('hud-score');
    const elLevel = document.getElementById('hud-level');
    const elLines = document.getElementById('hud-lines');
    const elCoins = document.getElementById('hud-coins');
    const elLives = document.getElementById('hud-lives');
    const elCombo = document.getElementById('hud-combo');

    if (elScore) elScore.textContent = this.score.toLocaleString();
    if (elLevel) elLevel.textContent = this.level;
    if (elLines) elLines.textContent = this.lines;
    if (elCoins) elCoins.textContent = this.coins;
    if (elLives) elLives.textContent = '🍄 × ' + this.lives;
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
