// SuperTris 多人連線模組 (P1開局握手、同方塊鏡像同步、P2蘑菇等待)
class MultiplayerManager {
  constructor() {
    this.game = null;
    this.channel = null;
    this.roomCode = null;
    this.role = null;
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
    const btnStart = document.getElementById('btn-start-coop');
    const inputCode = document.getElementById('join-code-input');

    playCoopBtn?.addEventListener('click', () => {
      roomModal?.classList.remove('hidden');
      this.openDirectHosting();
    });

    btnClose?.addEventListener('click', () => {
      roomModal?.classList.add('hidden');
      this.leaveRoom();
    });

    btnJoin?.addEventListener('click', () => this.handleJoinSubmit());
    inputCode?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleJoinSubmit();
      }
    });

    btnStart?.addEventListener('click', () => {
      if (this.role === 'host' && this.isConnected) {
        this.sendAction({ action: 'start_coop_game' });
        document.getElementById('room-modal')?.classList.add('hidden');
        if (this.game) this.game.startNewGame('coop');
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

  openDirectHosting() {
    this.showError('');
    this.role = 'host';
    this.roomCode = this.generateRoomCode();
    const codeEl = document.getElementById('display-room-code');
    if (codeEl) codeEl.textContent = this.roomCode;

    const statusEl = document.getElementById('room-status-text');
    if (statusEl) {
      statusEl.textContent = window.I18N.t('waiting_partner');
      statusEl.style.color = '#aaa';
    }

    document.getElementById('room-share-section')?.classList.remove('hidden');
    document.getElementById('room-p2-waiting-view')?.classList.add('hidden');
    document.getElementById('btn-start-coop')?.classList.add('hidden');
    document.getElementById('room-join-section')?.classList.remove('hidden');
    document.getElementById('room-divider')?.classList.remove('hidden');

    if (!window.SupabaseService.isAvailable()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }
    this.subscribeChannel(this.roomCode);
  }

  handleJoinSubmit() {
    const inputCode = document.getElementById('join-code-input');
    const code = inputCode ? inputCode.value.trim().replace(/\D/g, '') : '';

    if (code.length !== 4) {
      this.showError(window.I18N.t('invalid_room_code'));
      return;
    }
    if (code === this.roomCode) {
      this.showError(window.I18N.t('invalid_self_code'));
      return;
    }
    this.joinTargetRoom(code);
  }

  async joinTargetRoom(code) {
    this.showError('');
    if (!window.SupabaseService.isAvailable()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }

    this.role = 'guest';
    this.roomCode = code;

    // P2 畫面切換：隱藏產生代碼與輸入框，展示 🍄 蘑菇跳動等待區
    document.getElementById('room-share-section')?.classList.add('hidden');
    document.getElementById('room-join-section')?.classList.add('hidden');
    document.getElementById('room-divider')?.classList.add('hidden');
    document.getElementById('room-p2-waiting-view')?.classList.remove('hidden');

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
          this.onBothPlayersConnected();
        }
      })
      .on('presence', { event: 'leave' }, () => {
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

  onBothPlayersConnected() {
    this.isConnected = true;
    if (this.role === 'host') {
      const statusEl = document.getElementById('room-status-text');
      if (statusEl) {
        statusEl.textContent = window.I18N.t('partner_connected');
        statusEl.style.color = '#2ecc71';
      }
      document.getElementById('btn-start-coop')?.classList.remove('hidden');
      document.getElementById('room-join-section')?.classList.add('hidden');
      document.getElementById('room-divider')?.classList.add('hidden');
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

    if (payload.action === 'start_coop_game') {
      document.getElementById('room-modal')?.classList.add('hidden');
      this.game.startNewGame('coop');
      return;
    }

    if (payload.action === 'sync_pause') {
      this.game.applyPauseSync(payload.isPaused);
      return;
    }

    if (this.role === 'host') {
      if (payload.action === 'rotate') this.game.rotateCurrentPiece(payload.dir || 1, 2);
      if (payload.action === 'soft_drop') this.game.moveCurrentPiece(0, 1, 2, true);
      if (payload.action === 'hard_drop') this.game.hardDrop(2);
    } else {
      if (payload.action === 'sync_piece') {
        this.game.applyMirroredPiece(payload.piece, payload.nextPiece);
      }
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

  broadcastActivePiece(piece, nextPiece) {
    if (this.role === 'host') {
      this.sendAction({
        action: 'sync_piece',
        piece: piece ? {
          type: piece.type,
          x: piece.x,
          y: piece.y,
          rotation: piece.rotation,
          shape: piece.shape,
          isBomb: piece.isBomb || false,
          isQuestion: piece.isQuestion || false
        } : null,
        nextPiece: nextPiece ? { type: nextPiece.type, shape: nextPiece.shape } : null
      });
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
