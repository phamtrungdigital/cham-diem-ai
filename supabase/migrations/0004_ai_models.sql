-- Per-task model selection: user picks provider+model independently for
-- "score" (detect_and_score) and "rewrite" (rewrite_and_score) tasks.
-- The legacy default_provider column stays for backwards-compat and is used
-- when a per-task provider is null.

alter table public.ai_credentials
  add column if not exists score_provider text
    check (score_provider in ('anthropic','openai')),
  add column if not exists score_model text,
  add column if not exists rewrite_provider text
    check (rewrite_provider in ('anthropic','openai')),
  add column if not exists rewrite_model text;

-- Backfill: existing rows inherit the default_provider for both tasks so
-- behavior doesn't change until the user opens settings and chooses a model.
update public.ai_credentials
  set score_provider = coalesce(score_provider, default_provider),
      rewrite_provider = coalesce(rewrite_provider, default_provider)
  where score_provider is null or rewrite_provider is null;
