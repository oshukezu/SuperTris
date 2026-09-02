// SuperTris 遊戲核心主引擎 (Game Engine & State Controller)
class SuperTrisGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.nextCanvas = document.getElementById('next-canvas');

    this.cols = 10;
    this.rows = 20;
    this.cellSize = 28;

    this.board = new window.Board(this.cols, this.rows);
    this.scoreEngine = new window.ScoreEngine();
    this.bag = new window.RandomBag();
    this.renderer = new window.Renderer(this.canvas, this.nextCanvas, this.cellSize);

    this.mode = 'single';
    this.p1Piece = null;
    this.p2Piece = null;
    this.nextPiece = null;

    this.isPaused = false;
    this.isGameOver = false;
    this.dropCounter = 0;
    this.lastTime = 0;

    this.controls = new window.Controls(this);
    this.initHUDButtons();
    this.initVisibilityListener();
  }

  initHUDButtons() {
    document.getElementById('pause-btn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());
    document.getElementById('mute-toggle-btn')?.addEventListener('click', () => window.SoundEngine.toggleMute());
    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => window.I18N.toggleLanguage());
    document.getElementById('play-single-btn')?.addEventListener('click', () => this.startNewGame('single'));
    document.getElementById('play-coop-btn')?.addEventListener('click', () => this.startNewGame('coop'));
    document.getElementById('btn-play-again')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btn-back-menu')?.addEventListener('click', () => this.returnToTitle());
    document.getElementById('btn-submit-score')?.addEventListener('click', () => this.submitGameOverScore());
    document.getElementById('pause-overlay')?.addEventListener('click', () => this.togglePause());
  }

  // 監聽頁面切換 / 最小化 / 手機來電自動暫停 (Page Visibility API)
  initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.isPaused && !this.isGameOver) {
        this.togglePause();
      }
    });
    window.addEventListener('blur', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.togglePause();
      }
    });
  }

  startNewGame(mode = 'single') {
    this.mode = mode;
    this.isGameOver = false;
    this.isPaused = false;
    this.board.reset();
    this.scoreEngine.reset();
    this.bag = new window.RandomBag();
    if (window.Mario) window.Mario.reset();

    document.getElementById('title-screen')?.classList.add('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('hud')?.classList.remove('hidden');

    this.nextPiece = this.bag.next();
    this.spawnPiece(1);
    if (this.mode === 'coop') this.spawnPiece(2);

    window.SoundEngine.playIntroBGM();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  restartGame() {
    this.startNewGame(this.mode);
  }

  returnToTitle() {
    this.isPaused = true;
    document.getElementById('title-screen')?.classList.remove('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('hud')?.classList.add('hidden');
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
    let p = this.nextPiece || this.bag.next();
    p.playerIndex = playerIndex;
    p.x = playerIndex === 2 ? 6 : 3;

    if (this.board.isCollision(p.getBlocks())) {
      this.handleLifeLost();
      return;
    }

    if (playerIndex === 1) {
      this.p1Piece = p;
      this.nextPiece = this.bag.next();
    } else {
      this.p2Piece = p;
    }
  }

  moveCurrentPiece(dx, dy, playerIndex = 1) {
    const piece = playerIndex === 1 ? this.p1Piece : this.p2Piece;
    if (!piece || this.isPaused || this.isGameOver) return;

    const testBlocks = piece.getBlocks(piece.x + dx, piece.y + dy);
    if (!this.board.isCollision(testBlocks)) {
      piece.x += dx;
      piece.y += dy;
      if (dx !== 0) window.SoundEngine.playMove();
      return true;
    } else if (dy > 0) {
      this.lockCurrentPiece(playerIndex);
    }
    return false;
  }

  rotateCurrentPiece(dir = 1, playerIndex = 1) {
    const piece = playerIndex === 1 ? this.p1Piece : this.p2Piece;
    if (!piece || this.isPaused || this.isGameOver) return;
    if (piece.type === 'Q') return;

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
        return;
      }
    }
  }

  hardDrop(playerIndex = 1) {
    const piece = playerIndex === 1 ? this.p1Piece : this.p2Piece;
    if (!piece || this.isPaused || this.isGameOver) return;

    while (this.moveCurrentPiece(0, 1, playerIndex)) {
      // 墜落到底
    }
    window.SoundEngine.playDrop();
  }

  lockCurrentPiece(playerIndex = 1) {
    const piece = playerIndex === 1 ? this.p1Piece : this.p2Piece;
    if (!piece) return;

    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;

    // 1. 若處於雙主動特效或無敵星狀態：無敵星優先貫穿消除，若有炸彈同步引爆
    if (isStar || hasBomb) {
      if (isStar) {
        this.board.laserClearDown(piece.getBlocks());
        window.SoundEngine.playLineClear(2);
      }
      if (hasBomb && window.Mario.consumeFireBomb()) {
        this.board.explodeAround(piece.x + 1, piece.y + 1);
        window.SoundEngine.playExplosion();
      }
      this.checkCascadeLineClears();
      this.spawnPiece(playerIndex);
      return;
    }

    // 2. 一般鎖定至棋盤
    this.board.lockPiece(piece);

    // 3. 落地後，有機率讓場地內既有磚塊隨機轉換為問號磚
    if (window.Mario) {
      window.Mario.mutateRandomCellToQuestion(this.board);
    }

    // 4. 檢查滿行消除與問號磚道具觸發
    this.checkCascadeLineClears();

    // 5. 生成下一塊
    this.spawnPiece(playerIndex);
  }

  // 檢查滿行消除 (支援重力塌陷後的連鎖消行)
  checkCascadeLineClears() {
    const fullLines = this.board.findFullLines();
    if (fullLines.length > 0) {
      const questionBlockCount = this.board.removeLines(fullLines);
      this.scoreEngine.addClearedLines(fullLines.length);
      window.SoundEngine.playLineClear(fullLines.length);

      if (questionBlockCount > 0 && window.Mario) {
        for (let i = 0; i < questionBlockCount; i++) {
          const item = window.Mario.rollItem();
          window.Mario.triggerItem(item, this);
        }
      }

      if (fullLines.length === 4) {
        this.triggerTetrisSpecialEffect();
      }
    } else {
      this.scoreEngine.addClearedLines(0);
    }
  }

  handleLifeLost() {
    window.SoundEngine.playLifeLost();
    const isOver = this.scoreEngine.loseLife();

    if (isOver) {
      this.triggerGameOver();
    } else {
      this.board.clearHalfBoard();
      // 扣命重生時「清空所有活躍特效」
      if (window.Mario) {
        window.Mario.reset();
        window.Mario.showToast(window.I18N.t('life_lost'));
      }
      this.spawnPiece(1);
      if (this.mode === 'coop') this.spawnPiece(2);
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
    window.SoundEngine.playGameOver();

    const isNewHigh = window.Storage.recordGame(
      this.scoreEngine.score,
      this.scoreEngine.lines,
      this.scoreEngine.maxCombo,
      this.mode
    );

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
      coins: this.scoreEngine.coins,
      mode: this.mode,
      items_used: window.Mario ? window.Mario.itemsUsedCount : {}
    });

    if (btn) btn.textContent = window.I18N.t('submitted');
    setTimeout(() => {
      window.Leaderboard.show();
    }, 400);
  }

  gameLoop(time = 0) {
    if (this.isPaused || this.isGameOver) return;

    const dt = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += dt;
    const dropInterval = this.scoreEngine.getDropInterval();

    if (this.dropCounter > dropInterval) {
      this.moveCurrentPiece(0, 1, 1);
      if (this.mode === 'coop') this.moveCurrentPiece(0, 1, 2);
      this.dropCounter = 0;
    }

    if (window.Mario) window.Mario.tickTimers(dt / 1000);

    this.renderer.render(this.board, this.p1Piece, this.p2Piece, this.nextPiece, this.mode);
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.SuperTrisGame = SuperTrisGame;
