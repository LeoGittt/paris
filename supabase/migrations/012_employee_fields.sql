-- ============================================================
-- Migración 012: Sistema de empleados Paris
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Campos en participants
alter table participants
  add column if not exists is_employee boolean not null default false,
  add column if not exists avatar_url  text;

-- Índice para filtrar empleados rápido
create index if not exists idx_participants_employee on participants(is_employee);

-- ============================================================
-- Vista de ranking interno de empleados
-- ============================================================
create or replace view employee_ranking_view as
select
  p.id                                                                   as participant_id,
  p.first_name,
  p.last_name,
  p.total_points,
  p.avatar_url,
  count(pr.id) filter (where pr.result = 'correct_exact')               as correct_exact,
  count(pr.id) filter (where pr.result = 'correct_winner')              as correct_winner,
  count(pr.id) filter (where pr.result = 'correct_diff')                as correct_diff,
  count(pr.id)                                                           as predictions_count,
  rank() over (order by p.total_points desc)                             as ranking_position
from participants p
left join predictions pr on pr.participant_id = p.id
where p.is_employee = true and p.is_blocked = false
group by p.id, p.first_name, p.last_name, p.total_points, p.avatar_url;

-- ============================================================
-- Storage: bucket de avatares
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');

-- ============================================================
-- RLS: empleados pueden actualizar su propio avatar_url
-- ============================================================
create policy "participant_update_own_avatar"
  on participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Permisos para la nueva vista
grant select on employee_ranking_view to authenticated, anon;
