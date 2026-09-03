// SuperTris 瑪利歐道具系統與動態像素進度條 (回歸生動 Emoji)
const Mario = {
  ITEM_PROBABILITIES: [
    { type: 'coin', label: '🪙 COIN (+1)', weight: 60 },
    { type: 'red_mushroom', label: '🍄 MUSHROOM (Score ×2)', weight: 18 },
    { type: 'fire_flower', label: '🌸 FIRE (Bomb ×5)', weight: 14 },
    { type: 'green_mushroom', label: '🍄 1UP (Life +1)', weight: 5 },
    { type: 'super_star', label: '⭐ STAR (Laser Clear)', weight: 3 }
  ],

  activeEffects: {
    scoreMultiplier: 1,
    multiplierTimer: 0,
    multiplierTotal: 0,
    fireBombsRemaining: 0,
    starMode: false,
    starTimer: 0,
    starTotal: 0
  },

  itemsUsedCount: {
    red_mushroom: 0,
    green_mushroom: 0,
    fire_flower: 0,
    super_star: 0
  },

  reset() {
    this.activeEffects = {
      scoreMultiplier: 1,
      multiplierTimer: 0,
      multiplierTotal: 0,
      fireBombsRemaining: 0,
      starMode: false,
      starTimer: 0,
      starTotal: 0
    };
    this.itemsUsedCount = {
      red_mushroom: 0,
      green_mushroom: 0,
      fire_flower: 0,
      super_star: 0
    };
    this.updateHUD();
  },

  rollItem() {
    const totalWeight = this.ITEM_PROBABILITIES.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const item of this.ITEM_PROBABILITIES) {
      if (rand < item.weight) {
        return item.type;
      }
      rand -= item.weight;
    }
    return 'coin';
  },

  triggerItem(itemType, gameContext) {
    let toastKey = '';

    switch (itemType) {
      case 'coin':
        gameContext.scoreEngine.addCoins(1);
        window.SoundEngine.playCoin();
        this.showToast('🪙 +1 COIN');
        break;

      case 'red_mushroom':
        this.activeEffects.scoreMultiplier = 2;
        this.activeEffects.multiplierTimer += 30;
        this.activeEffects.multiplierTotal = Math.max(this.activeEffects.multiplierTotal, this.activeEffects.multiplierTimer);
        this.itemsUsedCount.red_mushroom++;
        window.SoundEngine.playPowerUp();
        toastKey = 'item_red_mushroom';
        this.showToast(window.I18N.t(toastKey));
        break;

      case 'green_mushroom':
        gameContext.scoreEngine.addLives(1);
        this.itemsUsedCount.green_mushroom++;
        window.SoundEngine.playOneUp();
        toastKey = 'item_green_mushroom';
        this.showToast(window.I18N.t(toastKey));
        break;

      case 'fire_flower':
        this.activeEffects.fireBombsRemaining += 5;
        this.itemsUsedCount.fire_flower++;
        window.SoundEngine.playFireFlower();
        toastKey = 'item_fire_flower';
        this.showToast(window.I18N.t(toastKey));
        break;

      case 'super_star':
        this.activeEffects.starMode = true;
        this.activeEffects.starTimer = 15;
        this.activeEffects.starTotal = 15;
        this.itemsUsedCount.super_star++;
        window.SoundEngine.playStarJingle();
        toastKey = 'item_super_star';
        this.showToast(window.I18N.t(toastKey));
        break;
    }

    this.updateHUD();
  },

  mutateRandomCellToQuestion(board) {
    if (Math.random() > 0.25) return;

    const candidates = [];
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        if (board.grid[r][c] !== null && !board.grid[r][c].isQuestion) {
          candidates.push({ r, c });
        }
      }
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      board.grid[pick.r][pick.c].isQuestion = true;
    }
  },

  tickTimers(deltaSec = 1) {
    let changed = false;

    if (this.activeEffects.multiplierTimer > 0) {
      this.activeEffects.multiplierTimer -= deltaSec;
      if (this.activeEffects.multiplierTimer <= 0) {
        this.activeEffects.scoreMultiplier = 1;
        this.activeEffects.multiplierTimer = 0;
        this.activeEffects.multiplierTotal = 0;
        changed = true;
      }
    }

    if (this.activeEffects.starTimer > 0) {
      this.activeEffects.starTimer -= deltaSec;
      if (this.activeEffects.starTimer <= 0) {
        this.activeEffects.starMode = false;
        this.activeEffects.starTimer = 0;
        this.activeEffects.starTotal = 0;
        changed = true;
      }
    }

    if (changed || this.activeEffects.multiplierTimer > 0 || this.activeEffects.starTimer > 0) {
      this.updateHUD();
    }
  },

  consumeFireBomb() {
    if (this.activeEffects.fireBombsRemaining > 0) {
      this.activeEffects.fireBombsRemaining--;
      this.updateHUD();
      return true;
    }
    return false;
  },

  showToast(text) {
    const toast = document.getElementById('item-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove('hidden', 'fade-out');
    toast.classList.add('pop-in');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.classList.add('hidden'), 500);
    }, 1800);
  },

  updateHUD() {
    const bar = document.getElementById('active-powerups');
    if (!bar) return;

    let html = '';

    if (this.activeEffects.scoreMultiplier > 1 && this.activeEffects.multiplierTimer > 0) {
      const remain = Math.ceil(this.activeEffects.multiplierTimer);
      const pct = Math.min(100, Math.max(0, (this.activeEffects.multiplierTimer / (this.activeEffects.multiplierTotal || 30)) * 100));
      const danger = remain <= 5 ? 'danger' : '';
      html += `
        <div class="buff-bar-container">
          <span>🍄 2x (${remain}s)</span>
          <div class="buff-track"><div class="buff-fill ${danger}" style="width: ${pct}%"></div></div>
        </div>
      `;
    }

    if (this.activeEffects.fireBombsRemaining > 0) {
      html += `
        <div class="buff-bar-container">
          <span>🌸 BOMB x${this.activeEffects.fireBombsRemaining}</span>
        </div>
      `;
    }

    if (this.activeEffects.starMode && this.activeEffects.starTimer > 0) {
      const remain = Math.ceil(this.activeEffects.starTimer);
      const pct = Math.min(100, Math.max(0, (this.activeEffects.starTimer / (this.activeEffects.starTotal || 15)) * 100));
      const danger = remain <= 4 ? 'danger' : '';
      html += `
        <div class="buff-bar-container">
          <span>⭐ STAR (${remain}s)</span>
          <div class="buff-track"><div class="buff-fill ${danger}" style="width: ${pct}%"></div></div>
        </div>
      `;
    }

    bar.innerHTML = html;
  }
};

window.Mario = Mario;
