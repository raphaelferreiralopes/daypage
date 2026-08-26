-- Missing from 0001_init.sql: cycle_notes (the "Rules" text per cycle),
-- used by lib/db.js's readCycle/saveCycleNotes but never created.
create table cycle_notes (
  cycle_id uuid primary key references cycles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default ''
);

alter table cycle_notes enable row level security;
create policy "user_isolation" on cycle_notes for all
  using (is_owner(user_id)) with check (is_owner(user_id));
