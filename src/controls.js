// SuperTris 手勢與鍵盤控制器 (純觸控手勢、單擊即轉向、雙人權威轉送)
class Controls {
  constructor(game) {
    this.game = game;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isDragging = false;
    this.dragThreshold = 18;
    this.tapTimeThreshold = 250;
    this.tapDistThreshold = 12;
    this.initKeyboard();
    this.initTouchGestures();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (this.game.isPaused || this.game.isGameOver) return;
      if (document.body.classList.contains('in-title')) return;

      const isCoop = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = isCoop ? window.Multiplayer.role : null;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (!isCoop || role === 'host') this.game.moveCurrentPiece(-1, 0, 1, false);
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (!isCoop || role === 'host') this.game.moveCurrentPiece(1, 0, 1, false);
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (!isCoop) {
            this.game.moveCurrentPiece(0, 1, 1, true);
          } else if (role === 'guest') {
            window.Multiplayer.sendAction({ action: 'soft_drop' });
          }
          break;
        case 'ArrowUp':
        case 'KeyW':
          if (!isCoop) {
            this.game.rotateCurrentPiece(1, 1);
          } else if (role === 'guest') {
            window.Multiplayer.sendAction({ action: 'rotate', dir: 1 });
          }
          break;
        case 'Space':
          e.preventDefault();
          if (!isCoop) {
            this.game.hardDrop(1);
          } else if (role === 'guest') {
            window.Multiplayer.sendAction({ action: 'soft_drop' });
          }
          break;
      }
    });
  }

  initTouchGestures() {
    const area = document.getElementById('touch-gesture-area') || document.body;
    area.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    area.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    area.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    area.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
  }

  handleTouchStart(e) {
    if (this.game.isPaused || this.game.isGameOver) return;
    if (document.body.classList.contains('in-title')) return;
    if (e.touches.length > 0) {
      e.preventDefault();
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.touchStartTime = performance.now();
      this.isDragging = false;
    }
  }

  handleTouchMove(e) {
    if (this.game.isPaused || this.game.isGameOver) return;
    if (document.body.classList.contains('in-title')) return;
    if (e.touches.length > 0) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      const isCoop = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = isCoop ? window.Multiplayer.role : null;

      if (Math.abs(dx) > this.dragThreshold && (!isCoop || role === 'host')) {
        const step = dx > 0 ? 1 : -1;
        this.game.moveCurrentPiece(step, 0, 1, false);
        this.touchStartX = t.clientX;
        this.isDragging = true;
      }

      if (dy > this.dragThreshold) {
        if (!isCoop) {
          this.game.moveCurrentPiece(0, 1, 1, true);
        } else if (role === 'guest') {
          window.Multiplayer.sendAction({ action: 'soft_drop' });
        }
        this.touchStartY = t.clientY;
        this.isDragging = true;
      }
    }
  }

  handleTouchEnd(e) {
    if (this.game.isPaused || this.game.isGameOver) return;
    if (document.body.classList.contains('in-title')) return;
    e.preventDefault();

    const dt = performance.now() - this.touchStartTime;
    const changed = e.changedTouches[0];
    if (!changed) return;

    const totalDx = Math.abs(changed.clientX - this.touchStartX);
    const totalDy = Math.abs(changed.clientY - this.touchStartY);
    const isTap = !this.isDragging && dt < this.tapTimeThreshold && totalDx < this.tapDistThreshold && totalDy < this.tapDistThreshold;

    if (isTap) {
      const isCoop = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = isCoop ? window.Multiplayer.role : null;

      if (!isCoop) {
        this.game.rotateCurrentPiece(1, 1);
      } else if (role === 'guest') {
        // P2 嚴格只向 P1 發送指令，等待 P1 廣播回傳，徹底防止回彈
        window.Multiplayer.sendAction({ action: 'rotate', dir: 1 });
      }
    }
  }
}

window.Controls = Controls;
