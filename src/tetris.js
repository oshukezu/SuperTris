// SuperTris 遊戲核心主引擎 (雙層經典HUD、TIME計時器、💥炸彈方塊與雙人職責標籤)
class SuperTrisGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.nextCanvas = document.getElementById('next-canvas');
    this.cols = 10;
    this.rows = 20;
    this.cellSize = 34;
    this.board = new window.Board(this.cols, this.rows);
    this.scoreEngine = new window.ScoreEngine();
    this.bag = new window.RandomBag();
    this.renderer = new window.Renderer(this.canvas, this.nextCanvas, this.cellSize);
    this.mode = 'single';
    this.p1Piece = null;
    this.nextPiece = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.lastSyncTime = 0;
    this.elapsedSeconds = 0;
    this.lockDelay = 600;
    this.lockAccumulator = 0;
    this.lockResets = 0;
    this.maxLockResets = 15;
    this.controls = new window.Controls(this);
    this.initHUDButtons();
    this.initVisibilityListener();
    this.initInitialHUD();
    if (window.Multiplayer) window.Multiplayer.init(this);
  }

  initInitialHUD() {
    const highScore = window.Storage ? window.Storage.getHighScore('single') : 0;
    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = String(highScore).padStart(6, '0');
    const timeEl = document.getElementById('hud-time');
    if (timeEl) timeEl.textContent = '--:--';
    const worldEl = document.getElementById('hud-world');
    if (worldEl) worldEl.textContent = '1-1';
  }

  initHUDButtons() {
    const setBtn = document.getElementById('set-menu-btn');
    const setDrawer = document.getElementById('set-drawer');
    setBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      setDrawer?.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#set-drawer') && !e.target.closest('#set-menu-btn')) this.hideDrawer();
    });
    document.getElementById('pause-btn')?.addEventListener('click', () => { this.hideDrawer(); this.togglePause(); });
    document.getElementById('restart-btn')?.addEventListener('click', () => { this.hideDrawer(); this.restartGame(); });
    document.getElementById('mute-toggle-btn')?.addEventListener('click', () => { window.SoundEngine.toggleMute(); this.updateSoundBtnText(); });
    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => { window.I18N.toggleLanguage(); this.updateSoundBtnText(); this.updateRoleBadge(); });
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => { this.hideDrawer(); window.Leaderboard.show(); });
    document.getElementById('play-single-btn')?.addEventListener('click', () => this.startNewGame('single'));
    document.getElementById('btn-play-again')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btn-back-menu')?.addEventListener('click', () => this.returnToTitle());
    document.getElementById('btn-submit-score')?.addEventListener('click', () => this.submitGameOverScore());
    document.getElementById('pause-overlay')?.addEventListener('click', () => this.togglePause());
  }

  hideDrawer() {
    document.getElementById('set-drawer')?.classList.add('hidden');
  }

  updateSoundBtnText() {
    const btn = document.getElementById('mute-toggle-btn');
    if (btn) btn.textContent = window.SoundEngine.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
  }

  updateRoleBadge() {
    const badge = document.getElementById('header-role-badge');
    if (!badge) return;
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected) {
      badge.classList.remove('hidden');
      if (window.Multiplayer.role === 'host') {
        badge.textContent = window.I18N.t('role_badge_p1');
        badge.classList.remove('badge-engine');
      } else {
        badge.textContent = window.I18N.t('role_badge_p2');
        badge.classList.add('badge-engine');
      }
    } else {
      badge.classList.add('hidden');
    }
  }

  initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.isPaused && !this.isGameOver) this.togglePause();
    });
    window.addEventListener('blur', () => {
      if (!this.isPaused && !this.isGameOver) this.togglePause();
    });
  }

  startNewGame(mode = 'single') {
    this.mode = mode;
    this.isGameOver = false;
    this.isPaused = false;
    this.lockAccumulator = 0;
    this.lockResets = 0;
    this.dropCounter = 0;
    this.elapsedSeconds = 0;
    this.hideDrawer();
    this.board.reset();
    this.scoreEngine.reset();
    this.bag = new window.RandomBag();
    if (window.Mario) window.Mario.reset();
    document.getElementById('title-screen')?.classList.add('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('game-main-area')?.classList.remove('hidden');
    this.updateRoleBadge();
    this.nextPiece = this.bag.next();
    this.spawnPiece(1);
    window.SoundEngine.playIntroBGM();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  restartGame() {
    this.startNewGame(this.mode);
  }

  returnToTitle() {
    this.isPaused = true;
    this.lockAccumulator = 0;
    this.hideDrawer();
    if (window.Multiplayer && window.Multiplayer.isConnected) window.Multiplayer.leaveRoom();
    this.initInitialHUD();
    this.updateRoleBadge();
    document.getElementById('title-screen')?.classList.remove('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('game-main-area')?.classList.add('hidden');
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.classList.toggle('hidden', !this.isPaused);
    if (!this.isPaused) {
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  spawnPiece(playerIndex = 1) {
    this.lockAccumulator = 0;
    this.lockResets = 0;
    if (window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0) {
      this.p1Piece = new window.Piece('Q', false, 1);
      this.p1Piece.isBomb = true;
    } else {
      let p = this.nextPiece || this.bag.next();
      p.playerIndex = 1;
      p.x = 3;
      p.y = 0;
      this.p1Piece = p;
      this.nextPiece = this.bag.next();
    }
    if (this.board.isCollision(this.p1Piece.getBlocks())) {
      this.handleLifeLost();
      return;
    }
  }

  isPieceGrounded() {
    if (!this.p1Piece) return false;
    return this.board.isCollision(this.p1Piece.getBlocks(this.p1Piece.x, this.p1Piece.y + 1));
  }

  moveCurrentPiece(dx, dy, playerIndex = 1, isManual = false) {
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver) return false;
    const testBlocks = piece.getBlocks(piece.x + dx, piece.y + dy);
    if (!this.board.isCollision(testBlocks)) {
      piece.x += dx;
      piece.y += dy;
      if (dx !== 0) {
        window.SoundEngine.playMove();
        if (this.isPieceGrounded() && this.lockResets < this.maxLockResets) {
          this.lockResets++;
          this.lockAccumulator = 0;
          window.SoundEngine.playLockSlide();
        }
      }
      return true;
    } else if (dy > 0 && isManual) {
      this.lockCurrentPiece(1);
    }
    return false;
  }

  rotateCurrentPiece(dir = 1, playerIndex = 1) {
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver || piece.type === 'Q') return;
    const newShape = piece.getRotatedMatrix(dir);
    const newRotation = (piece.rotation + (dir > 0 ? 1 : 3)) % 4;
    const kickTable = piece.type === 'I' ? window.WALL_KICK_DATA.I : window.WALL_KICK_DATA.NORMAL;
    const kicks = kickTable[piece.rotation] || [[0, 0]];
    for (const [kx, ky] of kicks) {
      const testBlocks = piece.getBlocks(piece.x + kx, piece.y - ky, newShape);
      if (!this.board.isCollision(testBlocks)) {
        piece.shape = newShape;
        piece.rotation = newRotation;
        piece.x += kx;
        piece.y -= ky;
        window.SoundEngine.playRotate();
        if (this.isPieceGrounded() && this.lockResets < this.maxLockResets) {
          this.lockResets++;
          this.lockAccumulator = 0;
          window.SoundEngine.playLockSlide();
        }
        return;
      }
    }
  }

  hardDrop(playerIndex = 1) {
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver) return;
    while (this.moveCurrentPiece(0, 1, 1, false)) {}
    this.lockCurrentPiece(1);
    window.SoundEngine.playDrop();
  }

  lockCurrentPiece(playerIndex = 1) {
    const piece = this.p1Piece;
    if (!piece) return;
    this.lockAccumulator = 0;
    this.lockResets = 0;
    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;
    if (isStar || hasBomb) {
      if (isStar) { this.board.laserClearDown(piece.getBlocks()); window.SoundEngine.playLineClear(2); }
      if (hasBomb && window.Mario.consumeFireBomb()) { this.board.explodeCross(piece.x, piece.y); window.SoundEngine.playExplosion(); }
      this.checkCascadeLineClears(1);
      this.spawnPiece(1);
      return;
    }
    this.board.lockPiece(piece);
    if (window.Mario) window.Mario.mutateRandomCellToQuestion(this.board);
    this.checkCascadeLineClears(1);
    this.spawnPiece(1);
  }

  checkCascadeLineClears(cascadeLevel = 1) {
    const fullLines = this.board.findFullLines();
    if (fullLines.length > 0) {
      const qCount = this.board.removeLines(fullLines);
      let cascadeMultiplier = 1;
      if (cascadeLevel === 2) cascadeMultiplier = 1.5;
      else if (cascadeLevel === 3) cascadeMultiplier = 2.0;
      else if (cascadeLevel >= 4) cascadeMultiplier = 3.0;

      this.scoreEngine.addClearedLines(fullLines.length, cascadeMultiplier);
      window.SoundEngine.playLineClear(fullLines.length);

      if (cascadeLevel > 1) {
        this.scoreEngine.addGems(1);
        if (window.Mario) window.Mario.showToast(`CASCADE x${cascadeLevel - 1} COMBO! (+💎1)`);
      }
      if (qCount > 0 && window.Mario) {
        for (let i = 0; i < qCount; i++) window.Mario.triggerItem(window.Mario.rollItem(), this);
      }
      if (fullLines.length === 4) this.triggerTetrisSpecialEffect();
      this.board.applyGravity();
      this.checkCascadeLineClears(cascadeLevel + 1);
    } else if (cascadeLevel === 1) {
      this.scoreEngine.addClearedLines(0);
    }
  }

  handleLifeLost() {
    this.lockAccumulator = 0;
    window.SoundEngine.playLifeLost();
    if (this.scoreEngine.loseLife()) {
      this.triggerGameOver();
    } else {
      this.board.clearHalfBoard();
      if (window.Mario) {
        window.Mario.reset();
        window.Mario.showToast(window.I18N.t('life_lost'));
      }
      this.spawnPiece(1);
    }
  }

  triggerTetrisSpecialEffect() {
    const fx = document.getElementById('tetris-firework-fx');
    if (fx) {
      fx.classList.remove('hidden');
      setTimeout(() => fx.classList.add('hidden'), 1200);
    }
  }

  async triggerGameOver() {
    this.isGameOver = true;
    this.lockAccumulator = 0;
    this.hideDrawer();
    window.SoundEngine.playGameOver();
    const isNewHigh = window.Storage.recordGame(this.scoreEngine.score, this.scoreEngine.lines, this.scoreEngine.maxCombo, this.mode);
    const pct = await window.SupabaseService.calculatePercentile(this.scoreEngine.score, this.mode);
    document.getElementById('go-score').textContent = this.scoreEngine.score.toLocaleString();
    document.getElementById('go-lines').textContent = this.scoreEngine.lines;
    document.getElementById('go-combo').textContent = this.scoreEngine.maxCombo;
    document.getElementById('go-percent').textContent = pct;
    const recordBadge = document.getElementById('go-new-record');
    if (recordBadge) recordBadge.classList.toggle('hidden', !isNewHigh);
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = window.Storage.getPlayerName();
    document.getElementById('game-over-modal')?.classList.remove('hidden');
  }

  async submitGameOverScore() {
    const input = document.getElementById('player-name-input');
    const name = input ? input.value.trim() : 'Mario';
    if (!name) return;
    window.Storage.setPlayerName(name);
    const btn = document.getElementById('btn-submit-score');
    if (btn) btn.textContent = window.I18N.t('submitting');
    await window.SupabaseService.submitScore({
      nickname: name,
      score: this.scoreEngine.score,
      lines_cleared: this.scoreEngine.lines,
      max_combo: this.scoreEngine.maxCombo,
      level: this.scoreEngine.level,
      coins: this.scoreEngine.gems,
      mode: this.mode,
      items_used: window.Mario ? window.Mario.itemsUsedCount : {}
    });
    if (btn) btn.textContent = window.I18N.t('submitted');
    setTimeout(() => window.Leaderboard.show(), 400);
  }

  gameLoop(time = 0) {
    if (this.isPaused || this.isGameOver) return;
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.elapsedSeconds += dt / 1000;
    const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(Math.floor(this.elapsedSeconds % 60)).padStart(2, '0');
    const timeEl = document.getElementById('hud-time');
    if (timeEl) timeEl.textContent = `${mins}:${secs}`;

    const worldEl = document.getElementById('hud-world');
    if (worldEl) worldEl.textContent = `1-${Math.min(4, Math.floor(this.scoreEngine.lines / 10) + 1)}`;

    if (this.isPieceGrounded()) {
      this.lockAccumulator += dt;
      if (this.lockAccumulator >= this.lockDelay) this.lockCurrentPiece(1);
    } else {
      this.lockAccumulator = 0;
    }

    this.dropCounter += dt;
    if (this.dropCounter > this.scoreEngine.getDropInterval()) {
      this.moveCurrentPiece(0, 1, 1, false);
      this.dropCounter = 0;
    }

    if (window.Mario) window.Mario.tickTimers(dt / 1000);
    if (time - this.lastSyncTime > 150) {
      if (window.Multiplayer && window.Multiplayer.role === 'host') {
        window.Multiplayer.broadcastState({
          score: this.scoreEngine.score,
          lines: this.scoreEngine.lines,
          level: this.scoreEngine.level,
          coins: this.scoreEngine.gems,
          lives: this.scoreEngine.lives,
          grid: this.board.grid
        });
      }
      this.lastSyncTime = time;
    }
    this.renderer.render(this.board, this.p1Piece, null, this.nextPiece, this.mode);
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.SuperTrisGame = SuperTrisGame;
