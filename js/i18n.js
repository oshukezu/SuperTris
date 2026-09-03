// SuperTris 多語系字典 (i18n)
// 支援 繁體中文 (zh-TW) 與 英文 (en)

const I18N = {
  currentLang: 'zh-TW',
  translations: {
    'zh-TW': {
      title: 'SuperTris — 俄羅斯方塊 × 超級瑪利歐',
      subtitle: '8-Bit 像素懷舊冒險',
      play_single: '單人冒險模式',
      play_coop: '雙人合作模式',
      leaderboard: '雲端排行榜',
      how_to_play: '遊戲說明',
      score: '分數',
      level: '等級',
      lines: '消行',
      coins: '金幣',
      lives: 'UP 命數',
      combo: '連擊',
      next: '下一塊',
      pause: '暫停',
      resume: '繼續',
      restart: '重新開始',
      game_over: '遊戲結束 (GAME OVER)',
      cleared_lines: '消除行數',
      max_combo: '最大連擊',
      time_played: '遊玩時間',
      beaten_players: '超越了 {percent}% 的玩家！',
      new_record: '🎉 破紀錄！歷史新高！',
      enter_name: '請輸入暱稱 (1-20字)',
      submit_score: '上傳紀錄',
      submitting: '上傳中...',
      submitted: '上傳成功！',
      back_menu: '回主選單',
      play_again: '再玩一次',
      rank: '名次',
      player: '玩家',
      date: '日期',
      single_rank: '單人榜',
      coop_rank: '雙人榜',
      close: '關閉',
      item_red_mushroom: '🍄 紅蘑菇！分數 ×2 (+30秒)',
      item_green_mushroom: '🍄 綠蘑菇！UP +1 命',
      item_fire_flower: '🌸 火焰花！下 5 塊引爆炸彈',
      item_super_star: '⭐ 無敵星星！15秒穿透消除',
      coin_100_bonus: '🪙 收集 100 枚金幣！獲得 1UP！',
      life_lost: '💔 失去 1 條命！下半場地清除重整！',
      controls_kb_p1: '電腦 (P1): WASD/方向鍵移動，Space 快速落地，P 暫停',
      controls_kb_p2: '手機: 左右滑動移動，下滑加速軟落，單擊螢幕旋轉',
      portrait_warning: '⚠️ 請轉為直向模式遊玩（禁止橫向操作）',
      // 連線配對新增字串
      room_title: '雙人跨機連線合作',
      create_room: '建立新房間 (P1 舵手)',
      join_room: '加入房間 (P2 引擎)',
      enter_room_code: '請輸入 4 位房間碼',
      your_room_code: '房間代碼',
      waiting_partner: '等待隊友加入中...',
      room_p1_hint: '你是【P1 舵手】：負責掌控方塊水平左右移動！',
      room_p2_hint: '你是【P2 引擎】：負責單擊旋轉與下滑加速！',
      coop_partner_left: '隊友已中途斷線或離開房間',
      invalid_room_code: '請輸入正確的 4 碼數字房間代號',
      connection_failed: '連線伺服器失敗，請確認網路或 Supabase 設定',
      connecting: '連線中...'
    },
    'en': {
      title: 'SuperTris — Tetris × Super Mario',
      subtitle: '8-Bit Pixel Retro Adventure',
      play_single: 'Single Player',
      play_coop: '2-Player Co-op',
      leaderboard: 'Leaderboard',
      how_to_play: 'How to Play',
      score: 'Score',
      level: 'Level',
      lines: 'Lines',
      coins: 'Coins',
      lives: 'Lives',
      combo: 'Combo',
      next: 'Next',
      pause: 'Pause',
      resume: 'Resume',
      restart: 'Restart',
      game_over: 'GAME OVER',
      cleared_lines: 'Lines Cleared',
      max_combo: 'Max Combo',
      time_played: 'Play Time',
      beaten_players: 'Better than {percent}% of players!',
      new_record: '🎉 NEW RECORD! Highest Score!',
      enter_name: 'Enter Nickname (1-20 chars)',
      submit_score: 'Submit Score',
      submitting: 'Submitting...',
      submitted: 'Submitted!',
      back_menu: 'Main Menu',
      play_again: 'Play Again',
      rank: 'Rank',
      player: 'Player',
      date: 'Date',
      single_rank: 'Solo',
      coop_rank: 'Co-op',
      close: 'Close',
      item_red_mushroom: '🍄 Red Mushroom! Score ×2 (+30s)',
      item_green_mushroom: '🍄 Green Mushroom! 1UP!',
      item_fire_flower: '🌸 Fire Flower! Next 5 drops bomb tiles',
      item_super_star: '⭐ Super Star! 15s Laser Clear',
      coin_100_bonus: '🪙 100 Coins collected! 1UP!',
      life_lost: '💔 Life Lost! Half board cleared!',
      controls_kb_p1: 'PC (P1): WASD / Arrows to move, Space Hard Drop, P Pause',
      controls_kb_p2: 'Mobile: Swipe left/right to move, Swipe down to drop, Tap to rotate',
      portrait_warning: '⚠️ Please rotate device to Portrait Mode (Landscape locked)',
      // Multiplayer strings
      room_title: 'Cross-Device Co-op',
      create_room: 'Create Room (P1 Steerer)',
      join_room: 'Join Room (P2 Engine)',
      enter_room_code: 'Enter 4-digit room code',
      your_room_code: 'ROOM CODE',
      waiting_partner: 'Waiting for partner...',
      room_p1_hint: 'You are [P1 Steerer]: Responsible for Horizontal Movement!',
      room_p2_hint: 'You are [P2 Engine]: Responsible for Rotation & Fast Drop!',
      coop_partner_left: 'Partner disconnected or left the room',
      invalid_room_code: 'Please enter a valid 4-digit code',
      connection_failed: 'Connection failed, check Supabase config',
      connecting: 'Connecting...'
    }
  },

  init() {
    const saved = localStorage.getItem('supertris_lang');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    } else {
      const navLang = navigator.language || navigator.userLanguage || 'zh-TW';
      this.currentLang = navLang.toLowerCase().includes('zh') ? 'zh-TW' : 'en';
    }
    this.updateUI();
  },

  t(key, params = {}) {
    let str = (this.translations[this.currentLang] && this.translations[this.currentLang][key]) ||
              (this.translations['en'] && this.translations['en'][key]) || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  },

  setLanguage(lang) {
    if (!this.translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('supertris_lang', lang);
    this.updateUI();
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'zh-TW' ? 'en' : 'zh-TW');
  },

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', this.t(key));
    });
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.textContent = this.currentLang === 'zh-TW' ? 'EN' : '中文';
  }
};

window.I18N = I18N;
