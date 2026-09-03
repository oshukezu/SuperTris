// SuperTris 多人連線模組 (打開即開房、產生/輸入代碼、P1權威即時同步)
class MultiplayerManager {
  constructor() {
    this.game = null;
    this.channel = null;
    this.roomCode = null;
    this.role = null; // 'host' (P1) 或 'guest' (P2)
    this.isConnected = false;
  }

  init(game) {
    this.game = game;
    this.initUI();
  }

  initUI() {
    const playCoopBtn = document.getElementById('play-coop-btn');
    const roomModal = document.getElementById('room-modal');
    const btnClose = document.getElementById('btn-close-room-modal');
    const btnJoin = document.getElementById('btn-join-room');
    const inputCode = document.getElementById('join-code-input');

    playCoopBtn?.addEventListener('click', () => {
      roomModal?.classList.remove('hidden');
      this.openDirectHosting();
    });

    btnClose?.addEventListener('click', () => {
      roomModal?.classList.add('hidden');
      this.leaveRoom();
    });

    btnJoin?.addEventListener('click', () => {
      const code = inputCode ? inputCode.value.trim() : '';
      if (code.length === 4) {
        this.joinTargetRoom(code);
      } else {
        this.showError(window.I18N.t('invalid_room_code'));
      }
    });
  }

  showError(msg) {
    const err = document.getElementById('room-error-msg');
    if (err) err.textContent = msg;
  }

  generateRoomCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  // 打開彈窗即刻自動開房 (P1 Host)
  async openDirectHosting() {
    this.showError('');
    if (!window.SupabaseService.isConfigured()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }

    this.role = 'host';
    this.roomCode = this.generateRoomCode();
    const codeEl = document.getElementById('display-room-code');
    if (codeEl) codeEl.textContent = this.roomCode;
    this.subscribeChannel(this.roomCode);
  }

  // 切換為加入指定房間 (P2 Guest)
  async joinTargetRoom(code) {
    this.showError('');
    if (!window.SupabaseService.isConfigured()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }

    this.role = 'guest';
    this.roomCode = code;
    this.subscribeChannel(this.roomCode);
  }

  subscribeChannel(code) {
    const client = window.SupabaseService.client;
    if (!client) return;

    if (this.channel) client.removeChannel(this.channel);

    this.channel = client.channel(`supertris-room-${code}`, {
      config: { presence: { key: this.role } }
    });

    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState();
        const users = Object.keys(state);
        if (users.includes('host') && users.includes('guest')) {
          this.onBothPlayersReady();
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (this.isConnected) {
          if (window.Mario) window.Mario.showToast(window.I18N.t('coop_partner_left'));
          this.leaveRoom();
        }
      })
      .on('broadcast', { event: 'game-action' }, ({ payload }) => {
        this.handleRemoteAction(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.channel.track({ online_at: new Date().toISOString() });
        }
      });
  }

  onBothPlayersReady() {
    this.isConnected = true;
    document.getElementById('room-modal')?.classList.add('hidden');
    if (this.game) {
      this.game.startNewGame('coop');
    }
  }

  sendAction(actionData) {
    if (!this.channel || !this.isConnected) return;
    this.channel.send({
      type: 'broadcast',
      event: 'game-action',
      payload: { ...actionData, from: this.role }
    });
  }

  sendPauseSync(isPaused) {
    if (!this.isConnected) return;
    this.sendAction({ action: 'sync_pause', isPaused });
  }

  handleRemoteAction(payload) {
    if (!this.game || !this.isConnected) return;

    if (payload.action === 'sync_pause') {
      this.game.applyPauseSync(payload.isPaused);
      return;
    }

    if (this.role === 'host') {
      if (payload.action === 'rotate') this.game.rotateCurrentPiece(payload.dir || 1, 2);
      if (payload.action === 'soft_drop') this.game.moveCurrentPiece(0, 1, 2, true);
    } else {
      if (payload.action === 'sync_state') {
        this.game.scoreEngine.score = payload.score;
        this.game.scoreEngine.lines = payload.lines;
        this.game.scoreEngine.level = payload.level;
        this.game.scoreEngine.gems = payload.coins;
        this.game.scoreEngine.lives = payload.lives;
        this.game.board.grid = payload.grid;
      }
    }
  }

  broadcastState(state) {
    if (this.role === 'host') {
      this.sendAction({ action: 'sync_state', ...state });
    }
  }

  leaveRoom() {
    this.isConnected = false;
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.roomCode = null;
    this.role = null;
  }
}

window.Multiplayer = new MultiplayerManager();
