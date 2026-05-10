-- ─── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id                     uuid references auth.users on delete cascade primary key,
  username               text unique,
  avatar_url             text,
  subscription_status    text check (subscription_status in ('free', 'pro')) default 'free',
  subscription_period_end timestamptz,
  stripe_customer_id     text unique,
  active_skin            text not null default 'classic',
  owned_skins            text[] not null default '{classic,dark,kazakh,japan,royal}',
  created_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Puzzles ─────────────────────────────────────────────────────────────────
create table public.puzzles (
  id             text primary key default gen_random_uuid()::text,
  difficulty     text not null check (difficulty in ('beginner','easy','medium','hard','expert','master')),
  givens         integer[] not null,
  solution       integer[] not null,
  technique_tags text[] not null default '{}',
  created_at     timestamptz not null default now()
);

alter table public.puzzles enable row level security;
create policy "Puzzles are publicly readable" on public.puzzles for select using (true);

-- ─── Games ───────────────────────────────────────────────────────────────────
create table public.games (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references public.profiles on delete cascade not null,
  puzzle_id            text references public.puzzles on delete cascade not null,
  current_state        integer[] not null default '{}',
  notes                jsonb not null default '{}',
  mistake_count        integer not null default 0,
  hints_used           integer not null default 0,
  time_elapsed_seconds integer not null default 0,
  status               text not null default 'active' check (status in ('active','completed','abandoned')),
  completed_at         timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.games enable row level security;
create policy "Users can read own games"   on public.games for select  using (auth.uid() = user_id);
create policy "Users can insert own games" on public.games for insert  with check (auth.uid() = user_id);
create policy "Users can update own games" on public.games for update  using (auth.uid() = user_id);

-- ─── Daily puzzles ────────────────────────────────────────────────────────────
create table public.daily_puzzles (
  date      date primary key,
  puzzle_id text references public.puzzles on delete restrict not null
);

alter table public.daily_puzzles enable row level security;
create policy "Daily puzzles are publicly readable" on public.daily_puzzles for select using (true);

-- ─── Daily results ────────────────────────────────────────────────────────────
create table public.daily_results (
  user_id      uuid references public.profiles on delete cascade,
  date         date,
  time_seconds integer not null,
  mistakes     integer not null default 0,
  primary key (user_id, date)
);

alter table public.daily_results enable row level security;
create policy "Users can read all daily results"    on public.daily_results for select using (true);
create policy "Users can insert own daily results"  on public.daily_results for insert  with check (auth.uid() = user_id);
create policy "Users can update own daily results"  on public.daily_results for update  using (auth.uid() = user_id);

-- ─── Hint usage ──────────────────────────────────────────────────────────────
create table public.hint_usage (
  user_id uuid references public.profiles on delete cascade,
  date    date,
  count   integer not null default 0,
  primary key (user_id, date)
);

alter table public.hint_usage enable row level security;
create policy "Users can read own hint usage"   on public.hint_usage for select  using (auth.uid() = user_id);
create policy "Users can upsert own hint usage" on public.hint_usage for insert  with check (auth.uid() = user_id);
create policy "Users can update own hint usage" on public.hint_usage for update  using (auth.uid() = user_id);

-- ─── AI messages ─────────────────────────────────────────────────────────────
create table public.ai_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles on delete cascade not null,
  game_id    uuid references public.games on delete set null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_messages enable row level security;
create policy "Users can read own ai messages"   on public.ai_messages for select  using (auth.uid() = user_id);
create policy "Users can insert own ai messages" on public.ai_messages for insert  with check (auth.uid() = user_id);

-- ─── Leaderboard view (top 100 per day, computed from daily_results) ──────────
create or replace view public.daily_leaderboard as
select
  dr.date,
  dr.user_id,
  p.username,
  p.avatar_url,
  dr.time_seconds,
  dr.mistakes,
  rank() over (partition by dr.date order by dr.time_seconds asc, dr.mistakes asc) as rank
from public.daily_results dr
join public.profiles p on p.id = dr.user_id
where dr.date = current_date;
