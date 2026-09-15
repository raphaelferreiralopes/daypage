-- checklist_checks was the only table from 0001_init.sql that never got a
-- row-level security policy. RLS on this table currently ends up enabled
-- (Supabase's dashboard security advisor turns it on for any table with a
-- user_id column, whether or not a policy exists), so every insert has been
-- silently rejected: checking a checklist item off appears to work in the
-- UI (the checkbox flips immediately, before the network round-trip), but
-- the write never lands, and the next reload shows it unchecked again.

alter table checklist_checks enable row level security;
create policy "user_isolation" on checklist_checks for all
  using (is_owner(user_id)) with check (is_owner(user_id));
