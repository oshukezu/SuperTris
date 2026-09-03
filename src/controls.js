// SuperTris 控制輸入模組 (鍵盤 + 手機純手勢引擎與連續直落)
class Controls {
  constructor(game) {
    this.game = game;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastSwipeX = 0;
    this.lastSwipeY = 0;
    this.isSwipingDown = false;
    this.softDropInterval = null;

    this.initKeyboard();
    this.initTouchGestures();
    this.initAntiZoomGuards();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP') {
        this.game.togglePause();
        return;
      }

      if (this.game.isPaused || this.game.isGameOver) return;

      const isMulti = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = window.Multiplayer ? window.Multiplayer.role : null;

      // 左右位移 (單人 或 P1 舵手)
      if (!isMulti || role === 'host') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.game.moveCurrentPiece(-1, 0, 1);
          if (isMulti) window.Multiplayer.sendAction('move', { dx: -1 });
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.game.moveCurrentPiece(1, 0, 1);
          if (isMulti) window.Multiplayer.sendAction('move', { dx: 1 });
        }
      }

      // 旋轉與軟落 (單人 或 P2 引擎)
      if (!isMulti || role === 'guest') {
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          this.game.moveCurrentPiece(0, 1, 1);
          if (isMulti) window.Multiplayer.sendAction('soft_drop', {});
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') {
          this.game.rotateCurrentPiece(1, 1);
          if (isMulti) window.Multiplayer.sendAction('rotate', { dir: 1 });
        } else if (e.code === 'KeyZ') {
          this.game.rotateCurrentPiece(-1, 1);
          if (isMulti) window.Multiplayer.sendAction('rotate', { dir: -1 });
        }
      }

      if (!isMulti && e.code === 'Space') {
        this.game.hardDrop(1);
      }
    });
  }

  // 手機純手勢引擎 (滑動平移、持續下滑極速直落、單擊旋轉)
  initTouchGestures() {
    const touchArea = document.getElementById('touch-gesture-area') || document.body;
    const swipeThreshold = 20; // 降低水平移動觸發門檻提升靈敏度 (20px)
    const softDropThreshold = 22; // 下滑加速門檻 (22px)

    touchArea.addEventListener('touchstart', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault();

      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.lastSwipeX = touch.clientX;
      this.lastSwipeY = touch.clientY;
      this.touchStartTime = performance.now();
      this.isSwipingDown = false;
      clearInterval(this.softDropInterval);
    }, { passive: false });

    touchArea.addEventListener('touchmove', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault(); // 阻斷瀏覽器原生下拉刷新與工具列
      if (this.game.isPaused || this.game.isGameOver) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastSwipeX;
      const deltaY = touch.clientY - this.lastSwipeY;

      const isMulti = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = window.Multiplayer ? window.Multiplayer.role : null;

      // 水平平移
      if (!isMulti || role === 'host') {
        if (Math.abs(deltaX) >= swipeThreshold) {
          const dir = deltaX > 0 ? 1 : -1;
          this.game.moveCurrentPiece(dir, 0, 1);
          this.lastSwipeX = touch.clientX;
          if (isMulti) window.Multiplayer.sendAction('move', { dx: dir });
        }
      }

      // 垂直下滑：觸控按住持續「極速連續直落 (60ms)」
      if (!isMulti || role === 'guest') {
        if (deltaY >= softDropThreshold && !this.isSwipingDown) {
          this.isSwipingDown = true;
          this.game.moveCurrentPiece(0, 1, 1);
          if (isMulti) window.Multiplayer.sendAction('soft_drop', {});

          clearInterval(this.softDropInterval);
          this.softDropInterval = setInterval(() => {
            if (this.isSwipingDown && !this.game.isPaused && !this.game.isGameOver) {
              this.game.moveCurrentPiece(0, 1, 1);
              if (isMulti) window.Multiplayer.sendAction('soft_drop', {});
            }
          }, 60); // 縮短為 60ms，提供快速順暢的連續直落手感
        }
      }
    }, { passive: false });

    touchArea.addEventListener('touchend', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault();
      clearInterval(this.softDropInterval);
      this.isSwipingDown = false;

      if (this.game.isPaused || this.game.isGameOver) return;

      const duration = performance.now() - this.touchStartTime;
      const changedTouch = e.changedTouches[0];
      const totalDistX = Math.abs(changedTouch.clientX - this.touchStartX);
      const totalDistY = Math.abs(changedTouch.clientY - this.touchStartY);

      // 單擊旋轉判斷 (時間 < 220ms 且位移 < 14px)
      if (duration < 220 && totalDistX < 14 && totalDistY < 14) {
        const isMulti = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
        const role = window.Multiplayer ? window.Multiplayer.role : null;

        if (!isMulti || role === 'guest') {
          this.game.rotateCurrentPiece(1, 1);
          if (isMulti) window.Multiplayer.sendAction('rotate', { dir: 1 });
        }
      }
    }, { passive: false });
  }

  initAntiZoomGuards() {
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      if (e.target.closest('input')) return;
      const now = performance.now();
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      lastTap = now;
    }, { passive: false });
  }
}

window.Controls = Controls;
