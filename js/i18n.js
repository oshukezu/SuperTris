// SuperTris 多語系字典 (i18n)
const I18N = {
  currentLang: 'zh-TW',
  translations: {
    'zh-TW': {
      title: 'SUPERTRIS',
      subtitle: '8-BIT RETRO ADVENTURE',
      play_single: '1P player',
      play_coop: '2P player',
      leaderboard: '排行榜',
      how_to_play: '遊戲說明',
      score: 'SCORE',
      level: 'LVL',
      lines: 'LINES',
      coins: 'GEM',
      lives: 'LIFE',
      combo: '連擊',
      next: 'NEXT',
      pause: '暫停',
      resume: '繼續',
      restart: '重開',
      main_menu: '回主選單',
      sound: '音效',
      game_over: 'GAME OVER',
      cleared_lines: '消除行數',
      max_combo: '最大連擊',
      time_played: '遊玩時間',
      beaten_players: '超越了 {percent}% 的玩家！',
      new_record: '[NEW RECORD] 歷史新高！',
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
      item_green_mushroom: '🍄 綠蘑菇！1UP 命數 +1！',
      item_fire_flower: '🌸 火焰花！下 5 塊 💥 炸彈十字爆破！',
      item_super_star: '⭐ 無敵星星！15秒方塊解體重力填補！',
      coin_100_bonus: '💎 滿 100 寶石！獲得 1UP！',
      life_lost: '💔 失去 1 條命！下半重整！',
      portrait_warning: '[NOTICE] 請轉為直向模式遊玩（禁止橫向操作）',
      room_title: '雙人跨機連線合作',
      create_room: '建立新房間 (P1 舵手)',
      join_room: '加入房間 (P2 引擎)',
      enter_room_code: '請輸入 4 位房間碼',
      your_room_code: '房間代碼',
      waiting_partner: '等待隊友加入中...',
      coop_rule_title: '🎮 玩法規則：兩人同心操控同一塊方塊！',
      coop_rule_p1: '🔹 P1 舵手：負責「左右水平移動」',
      coop_rule_p2: '🔸 P2 引擎：負責「單擊旋轉」與「下滑加速」',
      role_badge_p1: 'P1 負責移動 ↔',
      role_badge_p2: 'P2 負責轉向🔄/加速⬇',
      coop_partner_left: '隊友已中途斷線或離開房間',
      invalid_room_code: '請輸入正確的 4 碼數字房間代號',
      connection_failed: '連線伺服器失敗，請確認網路或 Supabase 設定',
      connecting: '連線中...'
    },
    'en': {
      title: 'SUPERTRIS',
      subtitle: '8-BIT RETRO ADVENTURE',
      play_single: '1P player',
      play_coop: '2P player',
      leaderboard: 'Rankings',
      how_to_play: 'How to Play',
      score: 'SCORE',
      level: 'LVL',
      lines: 'LINES',
      coins: 'GEM',
      lives: 'LIFE',
      combo: 'Combo',
      next: 'NEXT',
      pause: 'Pause',
      resume: 'Resume',
      restart: 'Restart',
      main_menu: 'Main Menu',
      sound: 'Sound',
      game_over: 'GAME OVER',
      cleared_lines: 'Lines Cleared',
      max_combo: 'Max Combo',
      time_played: 'Play Time',
      beaten_players: 'Better than {percent}% of players!',
      new_record: '[NEW RECORD] Highest Score!',
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
      item_green_mushroom: '🍄 Green Mushroom! Life +1!',
      item_fire_flower: '🌸 Fire Flower! 💥 Bomb Cross Explode ×5!',
      item_super_star: '⭐ Super Star! 15s Shatter Gravity Fall!',
      coin_100_bonus: '💎 100 Gems collected! 1UP!',
      life_lost: '💔 Life Lost! Half board cleared!',
      portrait_warning: '[NOTICE] Please rotate to Portrait Mode',
      room_title: 'Cross-Device Co-op',
      create_room: 'Create Room (P1 Steerer)',
      join_room: 'Join Room (P2 Engine)',
      enter_room_code: 'Enter 4-digit room code',
      your_room_code: 'ROOM CODE',
      waiting_partner: 'Waiting for partner...',
      coop_rule_title: '🎮 Rule: Control the same piece together!',
      coop_rule_p1: '🔹 P1 Steerer: Horizontal movement',
      coop_rule_p2: '🔸 P2 Engine: Tap to rotate & Swipe down',
      role_badge_p1: 'P1 Steerer ↔',
      role_badge_p2: 'P2 Engine 🔄/⬇',
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
