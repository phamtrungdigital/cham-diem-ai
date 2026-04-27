-- Per-user AI provider keys. Stored encrypted at rest by Supabase Postgres.
-- Never returned to the client in full — server actions only expose masked previews.

create table if not exists public.ai_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  anthropic_api_key text,
  openai_api_key text,
  default_provider text check (default_provider in ('anthropic','openai')) default 'anthropic',
  updated_at timestamptz not null default now()
);

alter table public.ai_credentials enable row level security;

drop policy if exists "ai_credentials_select_own" on public.ai_credentials;
create policy "ai_credentials_select_own"
  on public.ai_credentials for select
  using (auth.uid() = user_id);

drop policy if exists "ai_credentials_insert_own" on public.ai_credentials;
create policy "ai_credentials_insert_own"
  on public.ai_credentials for insert
  with check (auth.uid() = user_id);

drop policy if exists "ai_credentials_update_own" on public.ai_credentials;
create policy "ai_credentials_update_own"
  on public.ai_credentials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_credentials_delete_own" on public.ai_credentials;
create policy "ai_credentials_delete_own"
  on public.ai_credentials for delete
  using (auth.uid() = user_id);

drop trigger if exists ai_credentials_touch_updated_at on public.ai_credentials;
create trigger ai_credentials_touch_updated_at
  before update on public.ai_credentials
  for each row execute function public.touch_updated_at();
