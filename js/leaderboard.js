// SuperTris 排行榜 UI 模組 (Leaderboard Modal)
const Leaderboard = {
  currentTab: 'single',

  init() {
    const modal = document.getElementById('leaderboard-modal');
    const openBtn = document.getElementById('leaderboard-btn');
    const closeBtn = document.getElementById('leaderboard-close-btn');
    const tabSingle = document.getElementById('tab-single');
    const tabCoop = document.getElementById('tab-coop');

    if (openBtn) openBtn.onclick = () => this.show();
    if (closeBtn) closeBtn.onclick = () => this.hide();
    if (tabSingle) tabSingle.onclick = () => this.switchTab('single');
    if (tabCoop) tabCoop.onclick = () => this.switchTab('coop');
  },

  show() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.loadAndRender();
    }
  },

  hide() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) modal.classList.add('hidden');
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.getElementById('tab-single')?.classList.toggle('active', tab === 'single');
    document.getElementById('tab-coop')?.classList.toggle('active', tab === 'coop');
    this.loadAndRender();
  },

  async loadAndRender() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    container.innerHTML = '<div class="pixel-loading">LOADING...</div>';

    const currentName = window.Storage.getPlayerName();
    const data = await window.SupabaseService.getLeaderboard(this.currentTab);

    if (!data || data.length === 0) {
      container.innerHTML = `<div class="pixel-empty">${window.I18N.t('close') === 'Close' ? 'No records yet. Be the first!' : '尚無紀錄，快來挑戰！'}</div>`;
      return;
    }

    let html = `
      <div class="lb-row lb-header">
        <span class="lb-col-rank">${window.I18N.t('rank')}</span>
        <span class="lb-col-name">${window.I18N.t('player')}</span>
        <span class="lb-col-score">${window.I18N.t('score')}</span>
        <span class="lb-col-lines">${window.I18N.t('lines')}</span>
      </div>
    `;

    data.forEach((item, index) => {
      const isMe = currentName && item.nickname.toLowerCase() === currentName.toLowerCase();
      const rank = index + 1;
      let badge = `${rank}`;
      if (rank === 1) badge = '🥇 1';
      else if (rank === 2) badge = '🥈 2';
      else if (rank === 3) badge = '🥉 3';

      html += `
        <div class="lb-row ${isMe ? 'lb-me' : ''}">
          <span class="lb-col-rank">${badge}</span>
          <span class="lb-col-name">${this.escapeHtml(item.nickname)}</span>
          <span class="lb-col-score">${item.score.toLocaleString()}</span>
          <span class="lb-col-lines">${item.lines_cleared || 0}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

window.Leaderboard = Leaderboard;
