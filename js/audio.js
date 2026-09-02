// SuperTris Web Audio API 8-Bit 音效合成引擎 (零依賴、無版權問題)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('supertris_muted') === 'true';
    this.bgmPlaying = false;
    this.starBgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('supertris_muted', this.isMuted);
    const btn = document.getElementById('mute-toggle-btn');
    if (btn) btn.textContent = this.isMuted ? '🔇' : '🔊';
    return this.isMuted;
  }

  playTone(freq, type = 'square', duration = 0.1, delay = 0, vol = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }, delay * 1000);
  }

  // 1. 方塊落地音效 (低頻短促 Noise/Thud)
  playDrop() {
    this.playTone(130, 'triangle', 0.08, 0, 0.18);
  }

  // 2. 移動/旋轉音效
  playMove() {
    this.playTone(330, 'square', 0.03, 0, 0.04);
  }
  playRotate() {
    this.playTone(493.88, 'square', 0.04, 0, 0.06);
  }

  // 3. 消行音效 (上行 Arpeggio，消越多行越豐富)
  playLineClear(lines = 1) {
    if (lines === 1) {
      this.playTone(523.25, 'square', 0.08, 0, 0.1);
      this.playTone(659.25, 'square', 0.12, 0.06, 0.12);
    } else if (lines === 2) {
      this.playTone(523.25, 'square', 0.08, 0, 0.1);
      this.playTone(659.25, 'square', 0.08, 0.06, 0.12);
      this.playTone(783.99, 'square', 0.15, 0.12, 0.15);
    } else if (lines === 3) {
      this.playTone(440.00, 'square', 0.08, 0, 0.1);
      this.playTone(554.37, 'square', 0.08, 0.06, 0.12);
      this.playTone(659.25, 'square', 0.08, 0.12, 0.14);
      this.playTone(880.00, 'square', 0.20, 0.18, 0.16);
    } else {
      // Tetris 4 行消！特殊盛大琶音
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((f, i) => {
        this.playTone(f, 'square', 0.15, i * 0.06, 0.15);
      });
    }
  }

  // 4. 金幣收集音效 (叮咚 high-pitch)
  playCoin() {
    this.playTone(987.77, 'square', 0.08, 0, 0.12);
    this.playTone(1318.51, 'square', 0.25, 0.07, 0.15);
  }

  // 5. 蘑菇道具 (Power-Up)
  playPowerUp() {
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((f, i) => this.playTone(f, 'square', 0.08, i * 0.05, 0.12));
  }

  // 6. 1UP (綠蘑菇 / 100金幣)
  playOneUp() {
    const notes = [330, 392, 659, 523, 587, 784, 1046.5];
    notes.forEach((f, i) => this.playTone(f, 'triangle', 0.1, i * 0.06, 0.18));
  }

  // 7. 火焰花音效
  playFireFlower() {
    this.playTone(440, 'sawtooth', 0.08, 0, 0.1);
    this.playTone(587.33, 'sawtooth', 0.08, 0.06, 0.12);
    this.playTone(880, 'sawtooth', 0.15, 0.12, 0.12);
  }

  // 8. 炸彈爆炸音效 (火焰花消除時)
  playExplosion() {
    this.playTone(180, 'sawtooth', 0.15, 0, 0.2);
    this.playTone(90, 'triangle', 0.25, 0.05, 0.25);
  }

  // 9. 無敵星星模式 (快速輕快短旋律)
  playStarJingle() {
    const notes = [659, 659, 0, 659, 0, 523, 659, 0, 784];
    notes.forEach((f, i) => {
      if (f > 0) this.playTone(f, 'square', 0.08, i * 0.08, 0.12);
    });
  }

  // 10. 失去生命 / 死亡短音 (Downscale)
  playLifeLost() {
    const notes = [523.25, 493.88, 466.16, 440.00];
    notes.forEach((f, i) => this.playTone(f, 'triangle', 0.12, i * 0.08, 0.18));
  }

  // 11. Game Over 終局小曲
  playGameOver() {
    const notes = [440, 0, 392, 0, 349.23, 0, 329.63, 293.66, 261.63];
    notes.forEach((f, i) => {
      if (f > 0) this.playTone(f, 'square', 0.18, i * 0.12, 0.16);
    });
  }

  // 12. 遊戲開始倒數 3-2-1-GO
  playCountdown(count) {
    if (count > 0) {
      this.playTone(440, 'square', 0.1, 0, 0.15);
    } else {
      this.playTone(880, 'square', 0.3, 0, 0.2);
    }
  }

  // 13. 開場原創 8-bit 小曲 (只在開場播放一次)
  playIntroBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    const melody = [
      { f: 659.25, d: 0.12, pause: 0.03 },
      { f: 659.25, d: 0.12, pause: 0.15 },
      { f: 659.25, d: 0.12, pause: 0.15 },
      { f: 523.25, d: 0.12, pause: 0.03 },
      { f: 659.25, d: 0.15, pause: 0.15 },
      { f: 783.99, d: 0.25, pause: 0.30 },
      { f: 392.00, d: 0.25, pause: 0.10 }
    ];

    let t = 0;
    melody.forEach(item => {
      this.playTone(item.f, 'square', item.d, t, 0.1);
      t += item.d + item.pause;
    });

    setTimeout(() => {
      this.bgmPlaying = false;
    }, t * 1000 + 100);
  }
}

window.SoundEngine = new SoundEngine();
