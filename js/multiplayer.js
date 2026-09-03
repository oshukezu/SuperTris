// SuperTris 跨裝置雙人連線配對與分工同步模組 (Multiplayer Module)
const Multiplayer = {
  channel: null,
  roomCode: '',
  role: null, // 'host' (P1: 移動) | 'guest' (P2: 旋轉/加速)
  isConnected: false,
  gameInstance: null,

  init(gameInstance) {
    this.gameInstance = gameInstance;
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('play-coop-btn')?.addEventListener('click', () => this.showRoomModal());
    document.getElementById('btn-close-room-modal')?.addEventListener('click', () => this.hideRoomModal());
    document.getElementById('btn-create-room')?.addEventListener('click', () => this.createRoom());
    document.getElementById('btn-join-room')?.addEventListener('click', () => this.joinRoom());
  },

  showRoomModal() {
    const modal = document.getElementById('room-modal');
    if (modal) modal.classList.remove('hidden');
    this.resetState();
  },

  hideRoomModal() {
    const modal = document.getElementById('room-modal');
    if (modal) modal.classList.add('hidden');
    this.leaveRoom();
  },

  resetState() {
    document.getElementById('room-setup-view')?.classList.remove('hidden');
    document.getElementById('room-waiting-view')?.classList.add('hidden');
    const input = document.getElementById('join-code-input');
    if (input) input.value = '';
    const err = document.getElementById('room-error-msg');
    if (err) err.textContent = '';
  },

  // 1. 建立房間 (Host / P1 - 舵手)
  async createRoom() {
    if (!window.SupabaseService.isAvailable()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }

    this.role = 'host';
    this.roomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 隨機 4 位數

    document.getElementById('room-setup-view')?.classList.add('hidden');
    document.getElementById('room-waiting-view')?.classList.remove('hidden');
    document.getElementById('display-room-code').textContent = this.roomCode;
    document.getElementById('room-role-hint').textContent = window.I18N.t('room_p1_hint');

    this.subscribeChannel(this.roomCode);
  },

  // 2. 加入房間 (Guest / P2 - 引擎)
  async joinRoom() {
    if (!window.SupabaseService.isAvailable()) {
      this.showError(window.I18N.t('connection_failed'));
      return;
    }

    const input = document.getElementById('join-code-input');
    const code = input ? input.value.trim() : '';
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      this.showError(window.I18N.t('invalid_room_code'));
      return;
    }

    this.role = 'guest';
    this.roomCode = code;

    document.getElementById('room-setup-view')?.classList.add('hidden');
    document.getElementById('room-waiting-view')?.classList.remove('hidden');
    document.getElementById('display-room-code').textContent = this.roomCode;
    document.getElementById('room-role-hint').textContent = window.I18N.t('room_p2_hint');

    this.subscribeChannel(this.roomCode, true);
  },

  // 訂閱 Supabase Realtime 廣播頻道
  subscribeChannel(code, isGuest = false) {
    const client = window.SupabaseService.client;
    if (!client) return;

    if (this.channel) {
      client.removeChannel(this.channel);
    }

    this.channel = client.channel(`supertris-room-${code}`, {
      config: { broadcast: { self: false } }
    });

    this.channel
      .on('broadcast', { event: 'coop_action' }, (payload) => this.handleRemoteAction(payload))
      .on('broadcast', { event: 'player_joined' }, () => {
        if (this.role === 'host') {
          // 房主收到加入通知，廣播啟動遊戲！
          this.channel.send({
            type: 'broadcast',
            event: 'game_start',
            payload: { timestamp: Date.now() }
          });
          this.startGameAsHost();
        }
      })
      .on('broadcast', { event: 'game_start' }, () => {
        if (this.role === 'guest') {
          this.startGameAsGuest();
        }
      })
      .on('broadcast', { event: 'state_sync' }, (payload) => {
        if (this.role === 'guest' && payload.state) {
          this.syncStateToGuest(payload.state);
        }
      })
      .on('broadcast', { event: 'partner_left' }, () => {
        this.handlePartnerLeft();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          if (isGuest) {
            // Guest 送出加入信號
            this.channel.send({
              type: 'broadcast',
              event: 'player_joined',
              payload: { timestamp: Date.now() }
            });
          }
        }
      });
  },

  startGameAsHost() {
    this.hideRoomModal();
    if (this.gameInstance) {
      this.gameInstance.startNewGame('coop');
    }
  },

  startGameAsGuest() {
    this.hideRoomModal();
    if (this.gameInstance) {
      this.gameInstance.startNewGame('coop');
    }
  },

  // 發送本機動作給遠端夥伴
  sendAction(actionType, data = {}) {
    if (!this.channel || !this.isConnected) return;
    this.channel.send({
      type: 'broadcast',
      event: 'coop_action',
      payload: { action: actionType, data, role: this.role }
    });
  },

  // 接收並處理遠端動作
  handleRemoteAction(payload) {
    if (!payload || !payload.payload) return;
    const { action, data, role } = payload.payload;
    if (role === this.role) return;

    if (this.role === 'host') {
      // 房主 (P1) 處理來自 P2 (Guest) 的動作：旋轉 / 下滑加速
      if (action === 'rotate') {
        this.gameInstance.rotateCurrentPiece(data.dir || 1, 1);
      } else if (action === 'soft_drop') {
        this.gameInstance.moveCurrentPiece(0, 1, 1);
      }
    } else {
      // 訪客 (P2) 處理來自 P1 (Host) 的動作：左右位移
      if (action === 'move') {
        this.gameInstance.moveCurrentPiece(data.dx, 0, 1);
      }
    }
  },

  // 房主定期廣播盤面權威狀態 (150ms 節流)
  broadcastState(state) {
    if (this.role !== 'host' || !this.channel || !this.isConnected) return;
    this.channel.send({
      type: 'broadcast',
      event: 'state_sync',
      payload: { state }
    });
  },

  syncStateToGuest(state) {
    if (!this.gameInstance) return;
    this.gameInstance.scoreEngine.score = state.score;
    this.gameInstance.scoreEngine.lines = state.lines;
    this.gameInstance.scoreEngine.level = state.level;
    this.gameInstance.scoreEngine.coins = state.coins;
    this.gameInstance.scoreEngine.lives = state.lives;
    this.gameInstance.scoreEngine.updateHUD();

    if (state.grid) {
      this.gameInstance.board.grid = state.grid;
    }
  },

  handlePartnerLeft() {
    alert(window.I18N.t('coop_partner_left'));
    this.leaveRoom();
    if (this.gameInstance) {
      this.gameInstance.returnToTitle();
    }
  },

  leaveRoom() {
    if (this.channel && this.isConnected) {
      this.channel.send({
        type: 'broadcast',
        event: 'partner_left',
        payload: {}
      });
      if (window.SupabaseService.client) {
        window.SupabaseService.client.removeChannel(this.channel);
      }
    }
    this.channel = null;
    this.isConnected = false;
    this.role = null;
    this.roomCode = '';
  },

  showError(msg) {
    const err = document.getElementById('room-error-msg');
    if (err) err.textContent = msg;
  }
};

window.Multiplayer = Multiplayer;
