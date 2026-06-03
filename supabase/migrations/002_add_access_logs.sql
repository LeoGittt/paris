-- ============================================================
-- Migración 002: Tracking de accesos diarios
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table if not exists access_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  accessed_at timestamptz default now()
);

create index if not exists idx_access_logs_date on access_logs(accessed_at);
create index if not exists idx_access_logs_user on access_logs(user_id);

alter table access_logs enable row level security;

-- Solo admin puede leer los logs
create policy "admin: leer access logs"
  on access_logs for select
  using (get_my_role() = 'admin');

-- Inserción solo mediante service_role (no expuesto al cliente)
-- Los inserts se hacen desde server actions con service_role key

-- Vista: accesos diarios (últimos 30 días)
create or replace view metrics_access_daily as
select
  date_trunc('day', accessed_at)::date as day,
  count(*)                              as total_logins,
  count(distinct user_id)               as unique_users
from access_logs
where accessed_at >= now() - interval '30 days'
group by 1
order by 1;

grant select on metrics_access_daily to authenticated;

-- Vista: total accesos
create or replace view metrics_access_overview as
select
  count(*)                                                        as total_logins,
  count(distinct user_id)                                         as unique_users,
  count(*) filter (where accessed_at >= now() - interval '1 day')   as logins_today,
  count(*) filter (where accessed_at >= now() - interval '7 days')  as logins_this_week,
  count(*) filter (where accessed_at >= now() - interval '30 days') as logins_this_month
from access_logs;

grant select on metrics_access_overview to authenticated;
