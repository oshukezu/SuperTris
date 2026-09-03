// SuperTris 遊戲主引擎 (首頁方向鍵選單、閃爍開局、雙人同方塊鏡像同步、WakeLock)
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
    this.wakeLock = null;
    this.selectedMenuIndex = 0;
    this.controls = new window.Controls(this);
    window.GameUIHelper.initHUDButtons(this);
    this.initTitleMenuKeys();
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
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => { this.wakeLock = null; });
      }
    } catch (e) {}
  }
  releaseWakeLock() {
    if (this.wakeLock) { this.wakeLock.release().catch(() => {}); this.wakeLock = null; }
  }
  initTitleMenuKeys() {
    const items = [document.getElementById('play-single-btn'), document.getElementById('play-coop-btn')];
    const updateCursor = () => {
      items.forEach((btn, idx) => {
        const isSel = idx === this.selectedMenuIndex;
        btn?.classList.toggle('active', isSel);
        btn?.querySelector('.nes-cursor')?.classList.toggle('hidden-cursor', !isSel);
      });
    };
    window.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('in-title')) return;
      if (document.getElementById('room-modal') && !document.getElementById('room-modal').classList.contains('hidden')) return;
      if (e.key === 'ArrowUp' || e.key === 'KeyW' || e.key === 'ArrowDown' || e.key === 'KeyS') {
        this.selectedMenuIndex = (this.selectedMenuIndex + 1) % 2;
        updateCursor();
        window.SoundEngine.playMove();
      } else if (e.key === 'Enter' || e.key === 'Space') {
        e.preventDefault();
        this.confirmMenuSelection(this.selectedMenuIndex === 0 ? 'single' : 'coop');
      }
    });
    items[0]?.addEventListener('click', () => this.confirmMenuSelection('single'));
    items[1]?.addEventListener('click', () => this.confirmMenuSelection('coop'));
  }
  confirmMenuSelection(mode) {
    const targetBtn = mode === 'single' ? document.getElementById('play-single-btn') : document.getElementById('play-coop-btn');
    if (!targetBtn || targetBtn.classList.contains('menu-blinking')) return;
    this.selectedMenuIndex = mode === 'single' ? 0 : 1;
    [document.getElementById('play-single-btn'), document.getElementById('play-coop-btn')].forEach((b, i) => {
      b?.classList.toggle('active', i === this.selectedMenuIndex);
      b?.querySelector('.nes-cursor')?.classList.toggle('hidden-cursor', i !== this.selectedMenuIndex);
    });
    window.SoundEngine.playIntroBGM();
    targetBtn.classList.add('menu-blinking');
    setTimeout(() => {
      targetBtn.classList.remove('menu-blinking');
      if (mode === 'single') this.startNewGame('single');
      else {
        document.getElementById('room-modal')?.classList.remove('hidden');
        if (window.Multiplayer) window.Multiplayer.openDirectHosting();
      }
    }, 600);
  }
  updateRoleBadge() {
    const badge = document.getElementById('header-role-badge');
    const pauseBtn = document.getElementById('pause-btn');
    if (!badge) return;
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected) {
      badge.classList.remove('hidden');
      const isHost = window.Multiplayer.role === 'host';
      badge.textContent = window.I18N.t(isHost ? 'role_badge_p1' : 'role_badge_p2');
      badge.classList.toggle('badge-engine', !isHost);
      if (pauseBtn) { pauseBtn.style.opacity = isHost ? '1' : '0.5'; pauseBtn.style.pointerEvents = isHost ? 'auto' : 'none'; }
    } else {
      badge.classList.add('hidden');
      if (pauseBtn) { pauseBtn.style.opacity = '1'; pauseBtn.style.pointerEvents = 'auto'; }
    }
  }
  startNewGame(mode = 'single') {
    this.mode = mode;
    this.isGameOver = false;
    this.isPaused = false;
    this.lockAccumulator = 0;
    this.lockResets = 0;
    this.dropCounter = 0;
    this.elapsedSeconds = 0;
    document.getElementById('set-drawer')?.classList.add('hidden');
    this.board.reset();
    this.scoreEngine.reset();
    this.bag = new window.RandomBag();
    if (window.Mario) window.Mario.reset();
    document.body.classList.remove('in-title');
    document.getElementById('title-screen')?.classList.add('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('game-main-area')?.classList.remove('hidden');
    document.getElementById('pause-overlay')?.classList.add('hidden');
    this.updateRoleBadge();
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'guest') {
      this.p1Piece = null;
      this.nextPiece = null;
    } else {
      this.nextPiece = this.bag.next();
      this.spawnPiece(1);
    }
    this.requestWakeLock();
    window.SoundEngine.playIntroBGM();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  applyMirroredPiece(pieceData, nextPieceData) {
    if (!pieceData) { this.p1Piece = null; return; }
    if (!this.p1Piece) this.p1Piece = new window.Piece(pieceData.type);
    this.p1Piece.type = pieceData.type;
    this.p1Piece.x = pieceData.x;
    this.p1Piece.y = pieceData.y;
    this.p1Piece.rotation = pieceData.rotation;
    this.p1Piece.shape = pieceData.shape;
    this.p1Piece.isBomb = pieceData.isBomb;
    this.p1Piece.isQuestion = pieceData.isQuestion;
    if (nextPieceData) this.nextPiece = nextPieceData;
  }
  returnToTitle() {
    this.isPaused = true;
    this.lockAccumulator = 0;
    this.releaseWakeLock();
    document.getElementById('set-drawer')?.classList.add('hidden');
    if (window.Multiplayer && window.Multiplayer.isConnected) window.Multiplayer.leaveRoom();
    this.initInitialHUD();
    this.updateRoleBadge();
    document.body.classList.add('in-title');
    document.getElementById('title-screen')?.classList.remove('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');
    document.getElementById('game-main-area')?.classList.add('hidden');
    document.getElementById('pause-overlay')?.classList.add('hidden');
  }
  togglePause() {
    if (this.isGameOver) return;
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'guest') return;
    this.applyPauseSync(!this.isPaused);
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected) {
      window.Multiplayer.sendPauseSync(this.isPaused);
    }
  }
  applyPauseSync(isPaused) {
    this.isPaused = isPaused;
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.classList.toggle('hidden', !this.isPaused);
    if (this.isPaused) {
      this.releaseWakeLock();
    } else {
      this.requestWakeLock();
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
    if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'host') {
      window.Multiplayer.broadcastActivePiece(this.p1Piece, this.nextPiece);
    }
    if (this.board.isCollision(this.p1Piece.getBlocks())) this.handleLifeLost();
  }
  isPieceGrounded() {
    return this.p1Piece ? this.board.isCollision(this.p1Piece.getBlocks(this.p1Piece.x, this.p1Piece.y + 1)) : false;
  }
  moveCurrentPiece(dx, dy, playerIndex = 1, isManual = false) {
    const piece = this.p1Piece;
    if (!piece || this.isPaused || this.isGameOver) return false;
    const testBlocks = piece.getBlocks(piece.x + dx, piece.y + dy);
    if (!this.board.isCollision(testBlocks)) {
      piece.x += dx;
      piece.y += dy;
      if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'host') {
        window.Multiplayer.broadcastActivePiece(this.p1Piece, this.nextPiece);
      }
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
        if (this.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'host') {
          window.Multiplayer.broadcastActivePiece(this.p1Piece, this.nextPiece);
        }
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
    if (!this.p1Piece || this.isPaused || this.isGameOver) return;
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
    if (isStar) {
      this.board.shatterAndDropBlocks(piece);
      window.SoundEngine.playLineClear(1);
      this.checkLinesAndClear(true);
      this.spawnPiece(1);
      return;
    }
    if (hasBomb && window.Mario.consumeFireBomb()) {
      this.board.explodeCross(piece.x, piece.y);
      window.SoundEngine.playExplosion();
      this.board.applyGravity();
      this.checkLinesAndClear(true);
      this.spawnPiece(1);
      return;
    }
    this.board.lockPiece(piece);
    if (window.Mario) window.Mario.mutateRandomCellToQuestion(this.board);
    this.checkLinesAndClear(false);
    this.spawnPiece(1);
  }
  checkLinesAndClear(allowCascade = false, cascade = 1) {
    const full = this.board.findFullLines();
    if (full.length > 0) {
      const { questionCount, qPositions } = this.board.removeLines(full);
      let mult = cascade === 2 ? 1.5 : (cascade === 3 ? 2.0 : (cascade >= 4 ? 3.0 : 1));
      this.scoreEngine.addClearedLines(full.length, mult);
      window.SoundEngine.playLineClear(full.length);
      full.forEach(r => { this.renderer.addCoinAnimation(4, r); this.renderer.addCoinAnimation(5, r); });
      if (questionCount > 0 && window.Mario) {
        qPositions.forEach(pos => {
          const item = window.Mario.rollItem();
          this.renderer.addItemRiseAnimation(pos.x, pos.y, item);
          setTimeout(() => { if (!this.isGameOver) window.Mario.triggerItem(item, this); }, 500);
        });
      }
      if (full.length === 4) {
        const fx = document.getElementById('tetris-firework-fx');
        if (fx) { fx.classList.remove('hidden'); setTimeout(() => fx.classList.add('hidden'), 1200); }
      }
      if (this.board.isBoardEmpty()) {
        this.scoreEngine.addAllClearBonus();
        if (window.Mario) window.Mario.showToast('ALL CLEAR! +3,000 & 💎5');
        window.SoundEngine.play1UP();
      }
      if (allowCascade) { this.board.applyGravity(); this.checkLinesAndClear(true, cascade + 1); }
    } else if (cascade === 1) {
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
      if (window.Mario) { window.Mario.reset(); window.Mario.showToast(window.I18N.t('life_lost')); }
      this.spawnPiece(1);
    }
  }
  async triggerGameOver() {
    this.isGameOver = true;
    this.lockAccumulator = 0;
    this.releaseWakeLock();
    document.getElementById('set-drawer')?.classList.add('hidden');
    window.SoundEngine.playGameOver();
    const isNewHigh = window.Storage.recordGame(this.scoreEngine.score, this.scoreEngine.lines, this.scoreEngine.maxCombo, this.mode);
    const pct = await window.SupabaseService.calculatePercentile(this.scoreEngine.score, this.mode);
    document.getElementById('go-score').textContent = this.scoreEngine.score.toLocaleString();
    document.getElementById('go-lines').textContent = this.scoreEngine.lines;
    document.getElementById('go-combo').textContent = this.scoreEngine.maxCombo;
    document.getElementById('go-percent').textContent = pct;
    document.getElementById('go-new-record')?.classList.toggle('hidden', !isNewHigh);
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = window.Storage.getPlayerName();
    document.getElementById('game-over-modal')?.classList.remove('hidden');
  }
  async submitGameOverScore() {
    await window.GameUIHelper.submitScore(this);
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
    if (worldEl) worldEl.textContent = `1-${Math.min(4, this.scoreEngine.level)}`;
    if (this.mode !== 'coop' || (window.Multiplayer && window.Multiplayer.role === 'host')) {
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
    this.renderer.render(this.board, this.p1Piece, null, this.nextPiece, this.mode, this.scoreEngine.level);
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
window.SuperTrisGame = SuperTrisGame;
