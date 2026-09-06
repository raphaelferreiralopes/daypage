-- Parent/sub-projects for time tracking: a project can optionally belong to
-- one parent project (exactly two levels — enforced in lib/db.js, not here,
-- since it needs a same-user lookup). Deleting a parent orphans its children
-- back to top-level rather than deleting them, matching how deleting a
-- project already keeps its time entries around.

alter table projects add column parent_id uuid references projects(id) on delete set null;
create index projects_parent_idx on projects(parent_id);
