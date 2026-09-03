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

    this.mode = 'single'; // 'single' | 'coop'
    this.p1Piece = null;
    this.p2Piece = null;
    this.nextPiece = null;

    this.isPaused = false;
    this.isGameOver = false;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.lastSyncTime = 0;

    this.controls = new window.Controls(this);
    this.initHUDButtons();
    this.initVisibilityListener();

    if (window.Multiplayer) {
      window.Multiplayer.init(this);
    }
  }

  initHUDButtons() {
    document.getElementById('pause-btn')?.addEventListener('click', () => this.togglePause());
    document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());
    document.getElementById('mute-toggle-btn')?.addEventListener('click', () => window.SoundEngine.toggleMute());
    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => window.I18N.toggleLanguage());
    document.getElementById('play-single-btn')?.addEventListener('click', () => this.startNewGame('single'));
    document.getElementById('btn-play-again')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btn-back-menu')?.addEventListener('click', () => this.returnToTitle());
    document.getElementById('btn-submit-score')?.addEventListener('click', () => this.submitGameOverScore());
    document.getElementById('pause-overlay')?.addEventListener('click', () => this.togglePause());
  }

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

    window.SoundEngine.playIntroBGM();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  restartGame() {
    this.startNewGame(this.mode);
  }

  returnToTitle() {
    this.isPaused = true;
    if (window.Multiplayer && window.Multiplayer.isConnected) {
      window.Multiplayer.leaveRoom();
    }
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
    p.playerIndex = 1; // 雙人同控一塊
    p.x = 3;

    if (this.board.isCollision(p.getBlocks())) {
      this.handleLifeLost();
      return;
    }

    this.p1Piece = p;
    this.nextPiece = this.bag.next();
  }

  moveCurrentPiece(dx, dy, playerIndex = 1) {
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver) return;

    const testBlocks = piece.getBlocks(piece.x + dx, piece.y + dy);
    if (!this.board.isCollision(testBlocks)) {
      piece.x += dx;
      piece.y += dy;
      if (dx !== 0) window.SoundEngine.playMove();
      return true;
    } else if (dy > 0) {
      this.lockCurrentPiece(1);
    }
    return false;
  }

  rotateCurrentPiece(dir = 1, playerIndex = 1) {
    const piece = this.p1Piece;
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
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver) return;

    while (this.moveCurrentPiece(0, 1, 1)) {
      // 墜落到底
    }
    window.SoundEngine.playDrop();
  }

  lockCurrentPiece(playerIndex = 1) {
    const piece = this.p1Piece;
    if (!piece) return;

    const isStar = window.Mario && window.Mario.activeEffects.starMode;
    const hasBomb = window.Mario && window.Mario.activeEffects.fireBombsRemaining > 0;

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
      this.spawnPiece(1);
      return;
    }

    this.board.lockPiece(piece);

    if (window.Mario) {
      window.Mario.mutateRandomCellToQuestion(this.board);
    }

    this.checkCascadeLineClears();
    this.spawnPiece(1);
  }

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
      this.dropCounter = 0;
    }

    if (window.Mario) window.Mario.tickTimers(dt / 1000);

    // 房主定期廣播盤面權威狀態 (每 150ms)
    if (time - this.lastSyncTime > 150) {
      if (window.Multiplayer && window.Multiplayer.role === 'host') {
        window.Multiplayer.broadcastState({
          score: this.scoreEngine.score,
          lines: this.scoreEngine.lines,
          level: this.scoreEngine.level,
          coins: this.scoreEngine.coins,
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
