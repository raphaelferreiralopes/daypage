-- Support for the Goals page: auto-managed yearly cycles (kind='year',
-- distinct from user-created 'custom' cycles) and manual yes/no goals
-- (neither habit_id nor project_id set, tracked via `achieved`).

alter table cycles add column kind text not null default 'custom';

alter table goals add column achieved boolean not null default false;

alter table goals drop constraint goals_exactly_one_target;
alter table goals add constraint goals_at_most_one_target check (
  not (habit_id is not null and project_id is not null)
);

alter table goals alter column target drop not null;
alter table goals drop constraint goals_target_check;
alter table goals add constraint goals_target_check check (target is null or target > 0);
