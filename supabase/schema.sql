create table if not exists public.mission_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  record jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists mission_results_user_created_idx
  on public.mission_results (user_id, created_at desc);

alter table public.mission_results enable row level security;

drop policy if exists "Users can read their own mission results"
  on public.mission_results;
create policy "Users can read their own mission results"
  on public.mission_results
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own mission results"
  on public.mission_results;
create policy "Users can add their own mission results"
  on public.mission_results
  for insert
  to authenticated
  with check (auth.uid() = user_id);
