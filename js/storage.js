// SuperTris 本地儲存與統計管理 (Storage)
const Storage = {
  KEYS: {
    HIGH_SCORE: 'supertris_high_score',
    HIGH_SCORE_COOP: 'supertris_high_score_coop',
    TOTAL_LINES: 'supertris_total_lines',
    MAX_COMBO: 'supertris_max_combo',
    GAMES_PLAYED: 'supertris_games_played',
    PLAYER_NAME: 'supertris_player_name',
    SCORES_CACHE: 'supertris_local_scores_cache'
  },

  getHighScore(mode = 'single') {
    const key = mode === 'coop' ? this.KEYS.HIGH_SCORE_COOP : this.KEYS.HIGH_SCORE;
    return parseInt(localStorage.getItem(key) || '0', 10);
  },

  setHighScore(score, mode = 'single') {
    const key = mode === 'coop' ? this.KEYS.HIGH_SCORE_COOP : this.KEYS.HIGH_SCORE;
    const current = this.getHighScore(mode);
    if (score > current) {
      localStorage.setItem(key, score.toString());
      return true; // 是新紀錄
    }
    return false;
  },

  getPlayerName() {
    return localStorage.getItem(this.KEYS.PLAYER_NAME) || '';
  },

  setPlayerName(name) {
    if (name) localStorage.setItem(this.KEYS.PLAYER_NAME, name.trim());
  },

  getStats() {
    return {
      highScore: this.getHighScore('single'),
      highScoreCoop: this.getHighScore('coop'),
      totalLines: parseInt(localStorage.getItem(this.KEYS.TOTAL_LINES) || '0', 10),
      maxCombo: parseInt(localStorage.getItem(this.KEYS.MAX_COMBO) || '0', 10),
      gamesPlayed: parseInt(localStorage.getItem(this.KEYS.GAMES_PLAYED) || '0', 10)
    };
  },

  recordGame(score, lines, combo, mode = 'single') {
    const isNewHigh = this.setHighScore(score, mode);
    const stats = this.getStats();

    localStorage.setItem(this.KEYS.TOTAL_LINES, (stats.totalLines + lines).toString());
    localStorage.setItem(this.KEYS.GAMES_PLAYED, (stats.gamesPlayed + 1).toString());
    if (combo > stats.maxCombo) {
      localStorage.setItem(this.KEYS.MAX_COMBO, combo.toString());
    }

    // 離線本地紀錄快取
    const cache = this.getLocalLeaderboard(mode);
    cache.push({
      nickname: this.getPlayerName() || (mode === 'coop' ? 'Mario & Luigi' : 'Mario'),
      score: score,
      lines_cleared: lines,
      max_combo: combo,
      mode: mode,
      created_at: new Date().toISOString()
    });
    // 依分數降冪排序
    cache.sort((a, b) => b.score - a.score);
    localStorage.setItem(this.KEYS.SCORES_CACHE + '_' + mode, JSON.stringify(cache.slice(0, 50)));

    return isNewHigh;
  },

  getLocalLeaderboard(mode = 'single') {
    try {
      const data = localStorage.getItem(this.KEYS.SCORES_CACHE + '_' + mode);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  calculateLocalPercentile(score, mode = 'single') {
    const list = this.getLocalLeaderboard(mode);
    if (list.length <= 1) return 99; // 若只有自己就是頂尖
    const beaten = list.filter(item => score > item.score).length;
    return Math.min(99, Math.max(1, Math.round((beaten / list.length) * 100)));
  }
};

window.Storage = Storage;
