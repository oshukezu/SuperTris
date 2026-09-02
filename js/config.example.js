// SuperTris 設定檔範本 (Config Example)
// 請將此檔案複製或重命名為 config.js，並填入您的 Supabase 專案憑證。
// 本檔案為公開版本，真實的 config.js 已被 .gitignore 忽略。

window.SUPERTRIS_CONFIG = {
  SUPABASE_URL: '', // 例如: 'https://xyzcompany.supabase.co'
  SUPABASE_ANON_KEY: '', // 例如: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  ENABLE_CLOUD_LEADERBOARD: false // 若未填寫憑證，將自動 Fallback 為 localStorage 離線儲存
};
