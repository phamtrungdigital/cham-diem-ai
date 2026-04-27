-- Content scoring schema
-- All tables scoped per user via content_items.user_id; sub-tables join to content_items.

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  platform text not null default 'Facebook Ads',
  objective text,
  audience text,
  industry text,
  landing_page text,
  notes text,
  status text not null default 'draft' check (status in ('draft','scored','optimized','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_user_idx on public.content_items(user_id, created_at desc);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_number int not null,
  version_type text not null check (version_type in ('original','ai_optimized','user_edited')),
  body text not null,
  created_at timestamptz not null default now(),
  unique(content_item_id, version_number)
);

create index if not exists content_versions_item_idx on public.content_versions(content_item_id, version_number);

create table if not exists public.ai_recognitions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_id uuid not null references public.content_versions(id) on delete cascade,
  platform text,
  objective text,
  audience text,
  hook text,
  offer text,
  cta text,
  tone_of_voice text,
  policy_risk_level text check (policy_risk_level in ('low','medium','high')),
  policy_risk_summary text,
  user_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_recognitions_version_idx on public.ai_recognitions(version_id);

create table if not exists public.score_results (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_id uuid not null references public.content_versions(id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  score_label text not null,
  ctr_potential_level text,
  ctr_potential_range text,
  ctr_potential_note text,
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  policy_risks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists score_results_version_idx on public.score_results(version_id);
create index if not exists score_results_item_idx on public.score_results(content_item_id, created_at desc);

create table if not exists public.criteria_scores (
  id uuid primary key default gen_random_uuid(),
  score_result_id uuid not null references public.score_results(id) on delete cascade,
  criteria_key text not null,
  criteria_name text not null,
  score int not null check (score between 0 and 100),
  weight int not null,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists criteria_scores_result_idx on public.criteria_scores(score_result_id);

-- RLS
alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.ai_recognitions enable row level security;
alter table public.score_results enable row level security;
alter table public.criteria_scores enable row level security;

-- content_items: own rows
drop policy if exists "content_items_own_all" on public.content_items;
create policy "content_items_own_all"
  on public.content_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- content_versions: through content_items.user_id
drop policy if exists "content_versions_own_all" on public.content_versions;
create policy "content_versions_own_all"
  on public.content_versions for all
  using (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  );

-- ai_recognitions: through content_items.user_id
drop policy if exists "ai_recognitions_own_all" on public.ai_recognitions;
create policy "ai_recognitions_own_all"
  on public.ai_recognitions for all
  using (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  );

-- score_results: through content_items.user_id
drop policy if exists "score_results_own_all" on public.score_results;
create policy "score_results_own_all"
  on public.score_results for all
  using (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.content_items ci
            where ci.id = content_item_id and ci.user_id = auth.uid())
  );

-- criteria_scores: through score_results → content_items.user_id
drop policy if exists "criteria_scores_own_all" on public.criteria_scores;
create policy "criteria_scores_own_all"
  on public.criteria_scores for all
  using (
    exists (
      select 1 from public.score_results sr
      join public.content_items ci on ci.id = sr.content_item_id
      where sr.id = score_result_id and ci.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.score_results sr
      join public.content_items ci on ci.id = sr.content_item_id
      where sr.id = score_result_id and ci.user_id = auth.uid()
    )
  );

-- updated_at on content_items
drop trigger if exists content_items_touch_updated_at on public.content_items;
create trigger content_items_touch_updated_at
  before update on public.content_items
  for each row execute function public.touch_updated_at();
