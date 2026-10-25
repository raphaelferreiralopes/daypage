-- hidden habits stay tracked (goals, overview, history) but are left off the
-- daily page's habit list unless the user expands them
alter table habits add column hidden boolean not null default false;
