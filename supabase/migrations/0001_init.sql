-- Journal App — initial multi-tenant schema.
-- Every table is scoped by user_id and locked down with row-level security,
-- so a user can only ever see/write their own rows.

create extension if not exists "pgcrypto";

-- Shared helper: every RLS policy below is identical in shape, so isolation
-- is a single, auditable pattern rather than one-off logic per table.
create or replace function public.is_owner(row_user_id uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() = row_user_id;
$$;

-- --- cycles ------------------------------------------------------------
create table cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint cycles_dates_valid check (end_date >= start_date)
);
create index cycles_user_idx on cycles(user_id);

alter table cycles enable row level security;
create policy "user_isolation" on cycles for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- okrs (belong to a cycle) -------------------------------------------
create table okrs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null references cycles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);
create index okrs_user_cycle_idx on okrs(user_id, cycle_id);

alter table okrs enable row level security;
create policy "user_isolation" on okrs for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- projects ------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'onhold', 'archive')),
  created_at timestamptz not null default now()
);
create index projects_user_idx on projects(user_id);

alter table projects enable row level security;
create policy "user_isolation" on projects for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table project_notes (
  project_id uuid primary key references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default ''
);

alter table project_notes enable row level security;
create policy "user_isolation" on project_notes for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- habits ----------------------------------------------------------------
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('check', 'value')),
  unit text not null default '',
  okr_id uuid references okrs(id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index habits_user_idx on habits(user_id);

alter table habits enable row level security;
create policy "user_isolation" on habits for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table habit_notes (
  habit_id uuid primary key references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default ''
);

alter table habit_notes enable row level security;
create policy "user_isolation" on habit_notes for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- one value per habit per day; jsonb preserves the mixed shape (bool for
-- check-habits, numeric-as-string for value-habits) the app already uses
create table habit_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  value jsonb not null,
  unique (user_id, habit_id, date)
);
create index habit_data_user_date_idx on habit_data(user_id, date);
create index habit_data_user_habit_idx on habit_data(user_id, habit_id);

alter table habit_data enable row level security;
create policy "user_isolation" on habit_data for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- goals (per cycle, target a habit OR a project's tracked time) --------
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid not null references cycles(id) on delete cascade,
  habit_id uuid references habits(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  target numeric not null check (target > 0),
  label text not null default '',
  created_at timestamptz not null default now(),
  constraint goals_exactly_one_target check (
    (habit_id is not null and project_id is null) or
    (habit_id is null and project_id is not null)
  )
);
create index goals_user_cycle_idx on goals(user_id, cycle_id);

alter table goals enable row level security;
create policy "user_isolation" on goals for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- time tracking -----------------------------------------------------
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  project_id uuid references projects(id) on delete set null,
  seconds integer not null check (seconds > 0),
  note text not null default ''
);
create index time_entries_user_date_idx on time_entries(user_id, date);
create index time_entries_user_project_idx on time_entries(user_id, project_id);

alter table time_entries enable row level security;
create policy "user_isolation" on time_entries for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- single running timer per user
create table timer (
  user_id uuid primary key references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  started_at timestamptz not null
);

alter table timer enable row level security;
create policy "user_isolation" on timer for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- daily entry + related per-day writeups -----------------------------
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  unique (user_id, date)
);
create index entries_user_date_idx on entries(user_id, date);

alter table entries enable row level security;
create policy "user_isolation" on entries for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table day_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  text text not null default '',
  unique (user_id, date)
);
create index day_summaries_user_date_idx on day_summaries(user_id, date);

alter table day_summaries enable row level security;
create policy "user_isolation" on day_summaries for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table day_learnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  unique (user_id, date)
);
create index day_learnings_user_date_idx on day_learnings(user_id, date);

alter table day_learnings enable row level security;
create policy "user_isolation" on day_learnings for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table day_reflexions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  unique (user_id, date)
);
create index day_reflexions_user_date_idx on day_reflexions(user_id, date);

alter table day_reflexions enable row level security;
create policy "user_isolation" on day_reflexions for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- weekly notes --------------------------------------------------------
create table week_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  content text not null default '',
  unique (user_id, week_start)
);
create index week_notes_user_week_idx on week_notes(user_id, week_start);

alter table week_notes enable row level security;
create policy "user_isolation" on week_notes for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table week_reflexions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  content text not null default '',
  unique (user_id, week_start)
);
create index week_reflexions_user_week_idx on week_reflexions(user_id, week_start);

alter table week_reflexions enable row level security;
create policy "user_isolation" on week_reflexions for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- --- checklists (Life > Checklist tab) ------------------------------------
create table checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index checklists_user_idx on checklists(user_id);

alter table checklists enable row level security;
create policy "user_isolation" on checklists for all
  using (is_owner(user_id)) with check (is_owner(user_id));

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid not null references checklists(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index checklist_items_user_checklist_idx on checklist_items(user_id, checklist_id);

alter table checklist_items enable row level security;
create policy "user_isolation" on checklist_items for all
  using (is_owner(user_id)) with check (is_owner(user_id));

-- a row's existence == "checked today"; nothing to clean up at midnight,
-- it just naturally stops being "today" once the date changes
create table checklist_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references checklist_items(id) on delete cascade,
  date date not null,
  unique (user_id, item_id, date)
);
create index checklist_checks_user_date_idx on checklist_checks(user_id, date);
