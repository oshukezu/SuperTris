-- ==========================================
-- SuperTris 排行榜資料庫 Schema (Supabase)
-- ==========================================

-- 1. 建立 scores 分數紀錄表格
create table if not exists public.scores (
    id uuid primary key default gen_random_uuid(),
    nickname text not null check (char_length(nickname) between 1 and 20),
    score integer not null check (score >= 0),
    lines_cleared integer default 0 check (lines_cleared >= 0),
    max_combo integer default 0 check (max_combo >= 0),
    play_duration integer default 0 check (play_duration >= 0),
    level integer default 1 check (level >= 1),
    coins integer default 0 check (coins >= 0),
    mode text default 'single' check (mode in ('single', 'coop')),
    items_used jsonb default '{"red_mushroom":0, "green_mushroom":0, "fire_flower":0, "super_star":0}'::jsonb,
    created_at timestamptz default now()
);

-- 2. 建立索引提升查詢排行效率
create index if not exists idx_scores_score_mode on public.scores (mode, score desc);
create index if not exists idx_scores_created_at on public.scores (created_at desc);

-- 3. 啟用 Row Level Security (RLS)
alter table public.scores enable row level security;

-- 4. 建立公開讀取政策 (任何人皆可查閱排行榜)
create policy "Allow public read access"
on public.scores for select
using (true);

-- 5. 建立公開新增政策 (任何人皆可上傳結算分數)
create policy "Allow public insert"
on public.scores for insert
with check (true);

-- 6. 防刷機制：取得每個暱稱在特定模式下的最高分視圖 (View)
create or replace view public.top_scores as
select distinct on (nickname, mode)
    id,
    nickname,
    score,
    lines_cleared,
    max_combo,
    play_duration,
    level,
    coins,
    mode,
    items_used,
    created_at
from public.scores
order by nickname, mode, score desc, created_at desc;
