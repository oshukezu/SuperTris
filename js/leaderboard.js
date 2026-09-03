// SuperTris 排行榜 UI 模組 (固定 TOP 10 與空值 -- 填補)
class LeaderboardUI {
  constructor() {
    this.currentMode = 'single';
    this.initElements();
  }

  initElements() {
    this.modal = document.getElementById('leaderboard-modal');
    this.list = document.getElementById('leaderboard-list');
    this.tabSingle = document.getElementById('tab-single');
    this.tabCoop = document.getElementById('tab-coop');
    this.btnClose = document.getElementById('leaderboard-close-btn');

    this.tabSingle?.addEventListener('click', () => this.switchTab('single'));
    this.tabCoop?.addEventListener('click', () => this.switchTab('coop'));
    this.btnClose?.addEventListener('click', () => this.hide());
  }

  init() {}

  show(mode = 'single') {
    this.currentMode = mode;
    this.modal?.classList.remove('hidden');
    this.switchTab(mode);
  }

  hide() {
    this.modal?.classList.add('hidden');
  }

  switchTab(mode) {
    this.currentMode = mode;
    this.tabSingle?.classList.toggle('active', mode === 'single');
    this.tabCoop?.classList.toggle('active', mode === 'coop');
    this.loadScores();
  }

  async loadScores() {
    if (!this.list) return;
    this.list.innerHTML = `<div style="text-align:center; padding:15px; color:#aaa;">LOADING...</div>`;

    const scores = await window.SupabaseService.getTopScores(this.currentMode, 10);
    this.renderScores(scores);
  }

  renderScores(scores) {
    if (!this.list) return;

    let html = `
      <div class="lb-row lb-header">
        <span style="width: 18%; text-align: left;">${window.I18N.t('rank')}</span>
        <span style="width: 38%; text-align: left;">${window.I18N.t('player')}</span>
        <span style="width: 26%; text-align: right;">${window.I18N.t('score')}</span>
        <span style="width: 18%; text-align: right;">${window.I18N.t('lines')}</span>
      </div>
    `;

    const rankBadges = ['[1ST]', '[2ND]', '[3RD]', '[4TH]', '[5TH]', '[6TH]', '[7TH]', '[8TH]', '[9TH]', '[10TH]'];

    // 固定渲染 10 行，不足 10 筆自動補滿 --
    for (let i = 0; i < 10; i++) {
      const item = scores[i];
      const badge = rankBadges[i];
      const isGold = i === 0;

      if (item) {
        const name = (item.nickname || 'Mario').slice(0, 8);
        const score = Number(item.score || 0).toLocaleString();
        const lines = item.lines_cleared || 0;
        const color = isGold ? '#f1c40f' : '#fff';

        html += `
          <div class="lb-row" style="color: ${color};">
            <span style="width: 18%; text-align: left;">${badge}</span>
            <span style="width: 38%; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
            <span style="width: 26%; text-align: right;">${score}</span>
            <span style="width: 18%; text-align: right;">${lines}</span>
          </div>
        `;
      } else {
        html += `
          <div class="lb-row" style="color: #666;">
            <span style="width: 18%; text-align: left;">${badge}</span>
            <span style="width: 38%; text-align: left;">--</span>
            <span style="width: 26%; text-align: right;">--</span>
            <span style="width: 18%; text-align: right;">--</span>
          </div>
        `;
      }
    }

    this.list.innerHTML = html;
  }
}

window.Leaderboard = new LeaderboardUI();
