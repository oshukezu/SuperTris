// SuperTris 控制輸入模組 (鍵盤 + 手機純手勢引擎與四層防縮放攔截)
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

  // 1. 鍵盤控制 (支援單人與雙人跨機分工)
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

      // 左右位移 (單人 或 多人 Host/P1 舵手)
      if (!isMulti || role === 'host') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.game.moveCurrentPiece(-1, 0, 1);
          if (isMulti) window.Multiplayer.sendAction('move', { dx: -1 });
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.game.moveCurrentPiece(1, 0, 1);
          if (isMulti) window.Multiplayer.sendAction('move', { dx: 1 });
        }
      }

      // 旋轉與軟落 (單人 或 多人 Guest/P2 引擎)
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

      // Hard Drop (僅限單人鍵盤 Space 觸發，手機手勢不支援)
      if (!isMulti && e.code === 'Space') {
        this.game.hardDrop(1);
      }
    });
  }

  // 2. 手機純手勢引擎 (滑動平移、下滑加速、單擊旋轉、取消 Hard Drop)
  initTouchGestures() {
    const touchArea = document.getElementById('touch-gesture-area') || document.body;
    const swipeThreshold = 22; // 水平移動觸發門檻 (px)
    const softDropThreshold = 26; // 下滑加速門檻 (px)

    touchArea.addEventListener('touchstart', (e) => {
      // 避免在按鈕或輸入框上滑動攔截
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
      e.preventDefault();
      if (this.game.isPaused || this.game.isGameOver) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastSwipeX;
      const deltaY = touch.clientY - this.lastSwipeY;

      const isMulti = this.game.mode === 'coop' && window.Multiplayer && window.Multiplayer.isConnected;
      const role = window.Multiplayer ? window.Multiplayer.role : null;

      // 水平滑動：左右平移 (單人 或 P1 舵手)
      if (!isMulti || role === 'host') {
        if (Math.abs(deltaX) >= swipeThreshold) {
          const dir = deltaX > 0 ? 1 : -1;
          this.game.moveCurrentPiece(dir, 0, 1);
          this.lastSwipeX = touch.clientX;
          if (isMulti) window.Multiplayer.sendAction('move', { dx: dir });
        }
      }

      // 垂直下滑：加速軟落 (單人 或 P2 引擎)
      if (!isMulti || role === 'guest') {
        if (deltaY >= softDropThreshold && !this.isSwipingDown) {
          this.isSwipingDown = true;
          this.game.moveCurrentPiece(0, 1, 1);
          if (isMulti) window.Multiplayer.sendAction('soft_drop', {});

          // 持續按住向下滑時，週期性軟落
          this.softDropInterval = setInterval(() => {
            if (this.isSwipingDown && !this.game.isPaused && !this.game.isGameOver) {
              this.game.moveCurrentPiece(0, 1, 1);
              if (isMulti) window.Multiplayer.sendAction('soft_drop', {});
            }
          }, 90);
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

      // 單擊判斷：時間短於 220ms 且位移小於 14px -> 順時針旋轉
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

  // 3. 四層防跑版與嚴禁雙擊縮放攔截 (Anti-Zoom & Touch-Action Guards)
  initAntiZoomGuards() {
    // 阻止 iOS 多指縮放
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    // 攔截連續雙擊縮放
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
