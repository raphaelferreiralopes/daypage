create table reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reflections_user_idx on reflections(user_id);

alter table reflections enable row level security;
create policy "user_isolation" on reflections for all
  using (is_owner(user_id)) with check (is_owner(user_id));
