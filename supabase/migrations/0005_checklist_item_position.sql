-- Drag-and-drop ordering for checklist items: `position` replaces
-- created_at as the sort key, backfilled per-checklist from the existing
-- created_at order so nothing visibly reshuffles on upgrade.

alter table checklist_items add column position integer not null default 0;

with ranked as (
  select id, row_number() over (partition by checklist_id order by created_at) - 1 as rn
  from checklist_items
)
update checklist_items set position = ranked.rn
from ranked
where checklist_items.id = ranked.id;

create index checklist_items_checklist_position_idx on checklist_items(checklist_id, position);
