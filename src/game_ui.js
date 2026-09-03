// SuperTris 遊戲 UI 與事件輔助模組 (1P專屬暫停權限、成績提交)
class GameUIHelper {
  static initHUDButtons(game) {
    const setDrawer = document.getElementById('set-drawer');
    document.getElementById('set-menu-btn')?.addEventListener('click', (e) => { e.stopPropagation(); setDrawer?.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => { if (!e.target.closest('#set-drawer') && !e.target.closest('#set-menu-btn')) setDrawer?.classList.add('hidden'); });

    // 暫停按鈕 (雙人模式下 P2 點擊完全無效)
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      setDrawer?.classList.add('hidden');
      if (game.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'guest') return;
      game.togglePause();
    });

    document.getElementById('menu-btn')?.addEventListener('click', () => { setDrawer?.classList.add('hidden'); game.returnToTitle(); });
    document.getElementById('mute-toggle-btn')?.addEventListener('click', () => {
      window.SoundEngine.toggleMute();
      const b = document.getElementById('mute-toggle-btn');
      if (b) b.textContent = window.SoundEngine.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
    });
    document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
      window.I18N.toggleLanguage();
      const b = document.getElementById('mute-toggle-btn');
      if (b) b.textContent = window.SoundEngine.isMuted ? 'SOUND: OFF' : 'SOUND: ON';
      game.updateRoleBadge();
    });
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => { setDrawer?.classList.add('hidden'); window.Leaderboard.show(); });
    document.getElementById('btn-play-again')?.addEventListener('click', () => game.startNewGame(game.mode));
    document.getElementById('btn-back-menu')?.addEventListener('click', () => game.returnToTitle());
    document.getElementById('btn-submit-score')?.addEventListener('click', () => game.submitGameOverScore());

    // 全螢幕暫停遮罩 (雙人模式下 P2 點擊 100% 阻斷)
    document.getElementById('pause-overlay')?.addEventListener('click', () => {
      if (game.mode === 'coop' && window.Multiplayer && window.Multiplayer.role === 'guest') return;
      game.togglePause();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!game.isPaused && !game.isGameOver) {
          if (game.mode !== 'coop' || (window.Multiplayer && window.Multiplayer.role === 'host')) game.togglePause();
        }
      } else if (!game.isPaused && !game.isGameOver) {
        game.requestWakeLock();
      }
    });

    window.addEventListener('blur', () => {
      if (!game.isPaused && !game.isGameOver) {
        if (game.mode !== 'coop' || (window.Multiplayer && window.Multiplayer.role === 'host')) game.togglePause();
      }
    });
  }

  static async submitScore(game) {
    const input = document.getElementById('player-name-input');
    const name = input ? input.value.trim() : 'Mario';
    if (!name) return;
    window.Storage.setPlayerName(name);
    const btn = document.getElementById('btn-submit-score');
    if (btn) btn.textContent = window.I18N.t('submitting');
    await window.SupabaseService.submitScore({
      nickname: name,
      score: game.scoreEngine.score,
      lines_cleared: game.scoreEngine.lines,
      max_combo: game.scoreEngine.maxCombo,
      level: game.scoreEngine.level,
      coins: game.scoreEngine.gems,
      mode: game.mode,
      items_used: window.Mario ? window.Mario.itemsUsedCount : {}
    });
    if (btn) btn.textContent = window.I18N.t('submitted');
    setTimeout(() => window.Leaderboard.show(), 400);
  }
}

window.GameUIHelper = GameUIHelper;
