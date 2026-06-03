-- ============================================================
-- MÉTRICAS — funciones y vistas para el dashboard de Marketing
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Vista: métricas generales del prode
create or replace view metrics_overview as
select
  count(*)                                                          as total_participants,
  count(*) filter (where is_blocked = false)                        as active_participants,
  count(*) filter (where created_at >= now() - interval '1 day')   as new_today,
  count(*) filter (where created_at >= now() - interval '7 days')  as new_this_week,
  count(*) filter (where created_at >= now() - interval '30 days') as new_this_month,
  count(*) filter (where lead_source = 'taller')                   as from_taller,
  count(*) filter (where lead_source = 'repuestos')                as from_repuestos,
  count(*) filter (where lead_source = 'digital')                  as from_digital,
  count(*) filter (where lead_source = 'qr')                       as from_qr,
  count(*) filter (where lead_source = 'direct')                   as from_direct
from participants;

-- Vista: participantes por día (últimos 30 días)
create or replace view metrics_daily as
select
  date_trunc('day', created_at)::date as day,
  count(*)                             as registrations
from participants
where created_at >= now() - interval '30 days'
group by 1
order by 1;

-- Vista: participantes por ciudad (top 20)
create or replace view metrics_by_city as
select
  city,
  count(*) as total
from participants
where is_blocked = false
group by city
order by total desc
limit 20;

-- Vista: participación en pronósticos
create or replace view metrics_predictions as
select
  count(distinct participant_id)                           as participants_with_predictions,
  count(*)                                                 as total_predictions,
  count(*) filter (where result = 'correct_exact')        as total_exact,
  count(*) filter (where result = 'correct_winner')       as total_winner,
  count(*) filter (where result = 'wrong')                as total_wrong,
  count(*) filter (where result = 'pending')              as total_pending
from predictions;

-- Grants para que el cliente autenticado pueda leer las vistas
grant select on metrics_overview   to authenticated;
grant select on metrics_daily      to authenticated;
grant select on metrics_by_city    to authenticated;
grant select on metrics_predictions to authenticated;
