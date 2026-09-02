// SuperTris 控制輸入模組 (鍵盤 + 手機 SVG D-Pad) - 已移除 Hold 按鍵
class Controls {
  constructor(game) {
    this.game = game;
    this.lastUpPress = 0;
    this.initKeyboard();
    this.initMobileTouch();
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

      // 單人 / P1 控制
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.game.moveCurrentPiece(-1, 0, 1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.game.moveCurrentPiece(1, 0, 1);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.game.moveCurrentPiece(0, 1, 1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        const now = Date.now();
        if (now - this.lastUpPress < 280) {
          this.game.hardDrop(1);
          this.lastUpPress = 0;
        } else {
          this.game.rotateCurrentPiece(1, 1);
          this.lastUpPress = now;
        }
      } else if (e.code === 'Space') {
        this.game.hardDrop(1);
      } else if (e.code === 'KeyZ') {
        this.game.rotateCurrentPiece(-1, 1);
      } else if (e.code === 'KeyX') {
        this.game.rotateCurrentPiece(1, 1);
      }

      // 雙人 P2 控制
      if (this.game.mode === 'coop') {
        if (e.code === 'Numpad4' || e.code === 'KeyJ') {
          this.game.moveCurrentPiece(-1, 0, 2);
        } else if (e.code === 'Numpad6' || e.code === 'KeyL') {
          this.game.moveCurrentPiece(1, 0, 2);
        } else if (e.code === 'Numpad5' || e.code === 'KeyK') {
          this.game.moveCurrentPiece(0, 1, 2);
        } else if (e.code === 'Numpad8' || e.code === 'KeyI') {
          this.game.rotateCurrentPiece(1, 2);
        } else if (e.code === 'Numpad0' || e.code === 'Enter') {
          this.game.hardDrop(2);
        }
      }
    });
  }

  initMobileTouch() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const mobileContainer = document.getElementById('mobile-controls');
    if (!mobileContainer) return;

    if (isMobile) {
      mobileContainer.classList.remove('hidden');
    }

    const dpad = document.getElementById('dpad');
    const btnA = document.getElementById('btn-a');     // 旋轉
    const btnPause = document.getElementById('btn-pause-touch'); // 暫停
    const btnDrop = document.getElementById('btn-drop');

    if (dpad) {
      let touchId = null;
      let holdInterval = null;

      const handleDpad = (touch) => {
        const rect = dpad.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const deadZone = 15;

        if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return;

        if (Math.abs(dx) > Math.abs(dy)) {
          const dir = dx < 0 ? -1 : 1;
          this.game.moveCurrentPiece(dir, 0, 1);
        } else {
          if (dy > 0) {
            this.game.moveCurrentPiece(0, 1, 1);
          } else {
            this.game.rotateCurrentPiece(1, 1);
          }
        }
      };

      dpad.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        touchId = t.identifier;
        handleDpad(t);
        clearInterval(holdInterval);
        holdInterval = setInterval(() => {
          if (touchId !== null) handleDpad(t);
        }, 110);
      }, { passive: false });

      window.addEventListener('touchend', () => {
        touchId = null;
        clearInterval(holdInterval);
      });
    }

    if (btnA) {
      btnA.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.game.rotateCurrentPiece(1, 1);
      }, { passive: false });
    }

    if (btnPause) {
      btnPause.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.game.togglePause();
      }, { passive: false });
    }

    if (btnDrop) {
      btnDrop.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.game.hardDrop(1);
      }, { passive: false });
    }
  }
}

window.Controls = Controls;
