// SuperTris 瑪利歐道具系統與特殊磚塊效果 (Mario Mechanics)
const Mario = {
  ITEM_PROBABILITIES: [
    { type: 'coin', label: '🪙 金幣 (+1)', weight: 60 },
    { type: 'red_mushroom', label: '🍄 紅蘑菇 (得分×2)', weight: 18 },
    { type: 'fire_flower', label: '🌸 火焰花 (炸彈×5)', weight: 14 },
    { type: 'green_mushroom', label: '🍄 綠蘑菇 (1UP)', weight: 5 },
    { type: 'super_star', label: '⭐ 無敵星星 (穿透消除)', weight: 3 }
  ],

  activeEffects: {
    scoreMultiplier: 1,      // 得分倍率 (紅蘑菇)
    multiplierTimer: 0,      // 剩餘秒數
    fireBombsRemaining: 0,   // 剩餘火焰炸彈次數 (火焰花)
    starMode: false,         // 無敵星穿透模式
    starTimer: 0             // 剩餘秒數
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
      fireBombsRemaining: 0,
      starMode: false,
      starTimer: 0
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
        this.showToast('🪙 +1 COIN!');
        break;

      case 'red_mushroom':
        // 紅蘑菇時間累加 (+30 秒)
        this.activeEffects.scoreMultiplier = 2;
        this.activeEffects.multiplierTimer += 30;
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
        // 火焰花次數累加 (+5 次)
        this.activeEffects.fireBombsRemaining += 5;
        this.itemsUsedCount.fire_flower++;
        window.SoundEngine.playFireFlower();
        toastKey = 'item_fire_flower';
        this.showToast(window.I18N.t(toastKey));
        break;

      case 'super_star':
        // 無敵星時間刷新為 15 秒 (不累加)
        this.activeEffects.starMode = true;
        this.activeEffects.starTimer = 15;
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
        changed = true;
      }
    }

    if (this.activeEffects.starTimer > 0) {
      this.activeEffects.starTimer -= deltaSec;
      if (this.activeEffects.starTimer <= 0) {
        this.activeEffects.starMode = false;
        this.activeEffects.starTimer = 0;
        changed = true;
      }
    }

    if (changed) this.updateHUD();
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
    }, 2000);
  },

  updateHUD() {
    const bar = document.getElementById('active-powerups');
    if (!bar) return;

    const buffs = [];
    if (this.activeEffects.scoreMultiplier > 1) {
      buffs.push(`🍄 ×2 (${Math.ceil(this.activeEffects.multiplierTimer)}s)`);
    }
    if (this.activeEffects.fireBombsRemaining > 0) {
      buffs.push(`🌸 💣 ×${this.activeEffects.fireBombsRemaining}`);
    }
    if (this.activeEffects.starMode) {
      buffs.push(`⭐ STAR (${Math.ceil(this.activeEffects.starTimer)}s)`);
    }

    bar.innerHTML = buffs.map(b => `<span class="buff-badge">${b}</span>`).join(' ');
  }
};

window.Mario = Mario;
