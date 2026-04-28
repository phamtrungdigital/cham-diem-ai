-- Per-user reusable "Thông tin bổ sung" presets, scoped to score / rewrite.
-- Limit (20 per scope per user) is enforced at the application layer.

create table if not exists public.context_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('score','rewrite')),
  name text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists context_presets_user_scope_idx
  on public.context_presets(user_id, scope, created_at desc);

alter table public.context_presets enable row level security;

drop policy if exists "context_presets_select_own" on public.context_presets;
create policy "context_presets_select_own"
  on public.context_presets for select
  using (auth.uid() = user_id);

drop policy if exists "context_presets_insert_own" on public.context_presets;
create policy "context_presets_insert_own"
  on public.context_presets for insert
  with check (auth.uid() = user_id);

drop policy if exists "context_presets_update_own" on public.context_presets;
create policy "context_presets_update_own"
  on public.context_presets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "context_presets_delete_own" on public.context_presets;
create policy "context_presets_delete_own"
  on public.context_presets for delete
  using (auth.uid() = user_id);

drop trigger if exists context_presets_touch_updated_at on public.context_presets;
create trigger context_presets_touch_updated_at
  before update on public.context_presets
  for each row execute function public.touch_updated_at();
