// SuperTris Supabase 雲端服務串接 (Supabase Service)
const SupabaseService = {
  client: null,

  init() {
    const config = window.SUPERTRIS_CONFIG || {};
    if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY && window.supabase) {
      try {
        this.client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      } catch (e) {
        console.warn('Supabase client init failed, fallback to local mode:', e);
      }
    }
  },

  isAvailable() {
    return !!this.client;
  },

  // 1. 上傳遊戲成績
  async submitScore(payload) {
    // payload: { nickname, score, lines_cleared, max_combo, play_duration, level, coins, mode, items_used }
    if (!this.isAvailable()) {
      return { success: true, localOnly: true };
    }

    try {
      const { data, error } = await this.client
        .from('scores')
        .insert([payload]);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Supabase submitScore error:', err);
      return { success: false, error: err };
    }
  },

  // 2. 獲取排行榜資料 (支援 mode: 'single' | 'coop')
  async getLeaderboard(mode = 'single', limit = 100) {
    if (!this.isAvailable()) {
      return window.Storage.getLocalLeaderboard(mode);
    }

    try {
      // 優先查詢 top_scores 視圖或 scores 表
      const { data, error } = await this.client
        .from('scores')
        .select('nickname, score, lines_cleared, max_combo, created_at, mode')
        .eq('mode', mode)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // 前端做同暱稱去重，只保留個人最高分
      const uniqueMap = new Map();
      data.forEach(item => {
        if (!uniqueMap.has(item.nickname)) {
          uniqueMap.set(item.nickname, item);
        }
      });
      return Array.from(uniqueMap.values());
    } catch (err) {
      console.warn('Supabase getLeaderboard fallback to local:', err);
      return window.Storage.getLocalLeaderboard(mode);
    }
  },

  // 3. 計算勝過百分比 (Percentile)
  async calculatePercentile(score, mode = 'single') {
    if (!this.isAvailable()) {
      return window.Storage.calculateLocalPercentile(score, mode);
    }

    try {
      // 總筆數
      const { count: total, error: e1 } = await this.client
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('mode', mode);

      if (e1 || !total || total === 0) {
        return window.Storage.calculateLocalPercentile(score, mode);
      }

      // 勝過筆數 (score < currentScore)
      const { count: beaten, error: e2 } = await this.client
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('mode', mode)
        .lt('score', score);

      if (e2) return window.Storage.calculateLocalPercentile(score, mode);

      const pct = Math.round((beaten / total) * 100);
      return Math.min(99, Math.max(1, pct));
    } catch (err) {
      console.warn('Calculate percentile error:', err);
      return window.Storage.calculateLocalPercentile(score, mode);
    }
  }
};

window.SupabaseService = SupabaseService;
