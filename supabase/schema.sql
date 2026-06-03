-- ============================================================
-- PRODE GRUPO PARIS 2026 — Schema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role     as enum ('participant', 'admin', 'callcenter');
create type prize_status  as enum ('available', 'pending', 'delivered');
create type match_stage   as enum ('group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final');
create type pred_result   as enum ('pending', 'correct_winner', 'correct_exact', 'correct_diff', 'wrong');
create type lead_source   as enum ('taller', 'repuestos', 'digital', 'qr', 'direct');

-- ============================================================
-- ROLES
-- ============================================================
create table user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       user_role not null default 'participant',
  created_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- PARTICIPANTES
-- ============================================================
create table participants (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  first_name       text not null,
  last_name        text not null,
  dni              text not null unique,
  phone            text not null,
  email            text not null unique,
  license_plate    text not null unique,
  car_brand        text not null default '',
  car_model        text not null default '',
  city             text not null default '',
  lead_source      lead_source not null default 'direct',
  accepts_terms    boolean not null default false,
  accepts_marketing boolean not null default false,
  is_blocked       boolean not null default false,
  total_points     integer not null default 0,
  ranking_position integer,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- PARTIDOS
-- ============================================================
create table matches (
  id                  uuid primary key default uuid_generate_v4(),
  team1               text not null,
  team2               text not null,
  team1_flag          text not null default '',
  team2_flag          text not null default '',
  match_date          timestamptz not null,
  stage               match_stage not null default 'group',
  group_name          text,
  venue               text,
  score1              integer,
  score2              integer,
  is_finished         boolean not null default false,
  predictions_locked  boolean not null default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- CONFIGURACIÓN DE PUNTOS (una sola fila)
-- ============================================================
create table point_config (
  id              uuid primary key default uuid_generate_v4(),
  correct_winner  integer not null default 5,
  correct_exact   integer not null default 10,
  correct_diff    integer not null default 2,
  updated_at      timestamptz default now(),
  updated_by      uuid references auth.users(id)
);

-- Insertar config inicial
insert into point_config (correct_winner, correct_exact, correct_diff)
values (5, 10, 2);

-- ============================================================
-- PRONÓSTICOS
-- ============================================================
create table predictions (
  id                uuid primary key default uuid_generate_v4(),
  participant_id    uuid not null references participants(id) on delete cascade,
  match_id          uuid not null references matches(id) on delete cascade,
  predicted_score1  integer not null check (predicted_score1 >= 0),
  predicted_score2  integer not null check (predicted_score2 >= 0),
  points_earned     integer not null default 0,
  result            pred_result not null default 'pending',
  submitted_at      timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(participant_id, match_id)
);

-- ============================================================
-- PREMIOS
-- ============================================================
create table prizes (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  stage        text not null,
  prize_type   text not null default 'weekly',
  status       prize_status not null default 'available',
  winner_id    uuid references participants(id),
  delivered_at timestamptz,
  image_url    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- VISTA: RANKING
-- ============================================================
create or replace view ranking_view as
select
  p.id                                                        as participant_id,
  p.first_name,
  p.last_name,
  p.total_points,
  count(pr.id) filter (where pr.result = 'correct_exact')    as correct_exact,
  count(pr.id) filter (where pr.result = 'correct_winner')   as correct_winner,
  rank() over (order by p.total_points desc)                  as ranking_position
from participants p
left join predictions pr on pr.participant_id = p.id
where p.is_blocked = false
group by p.id, p.first_name, p.last_name, p.total_points;

-- ============================================================
-- FUNCIÓN: RECALCULAR PUNTOS DE UN PARTIDO
-- ============================================================
create or replace function recalculate_points(p_match_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_score1   integer;
  v_score2   integer;
  v_winner   integer;  -- 1=local, 2=visitante, 0=empate
  v_config   record;
  v_pred     record;
  v_points   integer;
  v_result   pred_result;
  v_diff_real integer;
  v_diff_pred integer;
begin
  -- Obtener resultado real
  select score1, score2 into v_score1, v_score2
  from matches where id = p_match_id and is_finished = true;

  if not found then
    raise exception 'Partido no encontrado o no finalizado';
  end if;

  -- Config de puntos
  select * into v_config from point_config limit 1;

  -- Ganador real (1=local, 2=visitante, 0=empate)
  v_winner := case
    when v_score1 > v_score2 then 1
    when v_score2 > v_score1 then 2
    else 0
  end;

  v_diff_real := abs(v_score1 - v_score2);

  -- Recorrer pronósticos
  for v_pred in
    select * from predictions where match_id = p_match_id
  loop
    v_points := 0;
    v_result := 'wrong';

    declare
      v_pred_winner integer;
      v_pred_diff   integer;
    begin
      v_pred_winner := case
        when v_pred.predicted_score1 > v_pred.predicted_score2 then 1
        when v_pred.predicted_score2 > v_pred.predicted_score1 then 2
        else 0
      end;
      v_pred_diff := abs(v_pred.predicted_score1 - v_pred.predicted_score2);

      -- Resultado exacto
      if v_pred.predicted_score1 = v_score1 and v_pred.predicted_score2 = v_score2 then
        v_points := v_config.correct_exact;
        v_result := 'correct_exact';
      -- Ganador/empate correcto
      elsif v_pred_winner = v_winner then
        -- Diferencia correcta además
        if v_pred_diff = v_diff_real then
          v_points := v_config.correct_diff;
          v_result := 'correct_diff';
        else
          v_points := v_config.correct_winner;
          v_result := 'correct_winner';
        end if;
      end if;
    end;

    update predictions
    set points_earned = v_points,
        result        = v_result,
        updated_at    = now()
    where id = v_pred.id;
  end loop;

  -- Actualizar totales de participantes
  update participants p
  set total_points = (
    select coalesce(sum(pr.points_earned), 0)
    from predictions pr
    where pr.participant_id = p.id
  ),
  updated_at = now()
  where exists (
    select 1 from predictions pr
    where pr.participant_id = p.id and pr.match_id = p_match_id
  );

  -- Recalcular posiciones en ranking
  with ranked as (
    select id, rank() over (order by total_points desc) as pos
    from participants
    where is_blocked = false
  )
  update participants p
  set ranking_position = r.pos
  from ranked r
  where p.id = r.id;
end;
$$;

-- ============================================================
-- FUNCIÓN: BLOQUEO AUTOMÁTICO DE PRONÓSTICOS
-- Llamar con un cron job en Supabase (cada minuto)
-- ============================================================
create or replace function lock_started_matches()
returns void
language plpgsql
security definer
as $$
begin
  update matches
  set predictions_locked = true,
      updated_at = now()
  where predictions_locked = false
    and match_date <= now();
end;
$$;

-- ============================================================
-- FUNCIÓN: ESTADÍSTICAS DE UN PARTICIPANTE
-- ============================================================
create or replace function get_participant_stats(p_participant_id uuid)
returns table (
  total_points     integer,
  ranking_position integer,
  predictions_count bigint,
  correct_exact    bigint,
  correct_winner   bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    p.total_points,
    p.ranking_position,
    count(pr.id),
    count(pr.id) filter (where pr.result = 'correct_exact'),
    count(pr.id) filter (where pr.result = 'correct_winner')
  from participants p
  left join predictions pr on pr.participant_id = p.id
  where p.id = p_participant_id
  group by p.total_points, p.ranking_position;
end;
$$;

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_participants_updated_at
  before update on participants
  for each row execute function set_updated_at();

create trigger trg_matches_updated_at
  before update on matches
  for each row execute function set_updated_at();

create trigger trg_predictions_updated_at
  before update on predictions
  for each row execute function set_updated_at();

create trigger trg_prizes_updated_at
  before update on prizes
  for each row execute function set_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
alter table participants   enable row level security;
alter table matches        enable row level security;
alter table predictions    enable row level security;
alter table prizes         enable row level security;
alter table user_roles     enable row level security;
alter table point_config   enable row level security;

-- Helper: obtener rol del usuario actual
create or replace function get_my_role()
returns user_role
language sql
security definer
stable
as $$
  select role from user_roles where user_id = auth.uid() limit 1;
$$;

-- ── PARTICIPANTS ──────────────────────────────────────────
-- Los participantes ven solo su propio registro
create policy "participant: ver propio perfil"
  on participants for select
  using (user_id = auth.uid());

-- Los participantes pueden actualizar su propio perfil
create policy "participant: actualizar propio perfil"
  on participants for update
  using (user_id = auth.uid());

-- Admin ve todos
create policy "admin: full access participants"
  on participants for all
  using (get_my_role() = 'admin');

-- Call center: solo lectura de todos
create policy "callcenter: leer participantes"
  on participants for select
  using (get_my_role() = 'callcenter');

-- ── MATCHES ───────────────────────────────────────────────
-- Todos pueden ver los partidos (público)
create policy "public: ver partidos"
  on matches for select
  using (true);

-- Solo admin puede crear/editar/borrar
create policy "admin: gestionar partidos"
  on matches for all
  using (get_my_role() = 'admin');

-- ── PREDICTIONS ───────────────────────────────────────────
-- Participante ve solo sus pronósticos
create policy "participant: ver propios pronósticos"
  on predictions for select
  using (
    participant_id in (
      select id from participants where user_id = auth.uid()
    )
  );

-- Participante puede crear/actualizar si el partido NO está bloqueado
create policy "participant: crear pronóstico"
  on predictions for insert
  with check (
    participant_id in (
      select id from participants where user_id = auth.uid()
    )
    and exists (
      select 1 from matches m
      where m.id = match_id
        and m.predictions_locked = false
    )
  );

create policy "participant: actualizar pronóstico"
  on predictions for update
  using (
    participant_id in (
      select id from participants where user_id = auth.uid()
    )
    and exists (
      select 1 from matches m
      where m.id = match_id
        and m.predictions_locked = false
    )
  );

-- Admin ve todo
create policy "admin: full access predictions"
  on predictions for all
  using (get_my_role() = 'admin');

-- ── PRIZES ────────────────────────────────────────────────
-- Todos pueden ver los premios (público)
create policy "public: ver premios"
  on prizes for select
  using (true);

-- Solo admin puede gestionar
create policy "admin: gestionar premios"
  on prizes for all
  using (get_my_role() = 'admin');

-- ── POINT CONFIG ──────────────────────────────────────────
-- Todos pueden leer la config de puntos
create policy "public: ver config de puntos"
  on point_config for select
  using (true);

-- Solo admin puede modificar
create policy "admin: modificar config puntos"
  on point_config for update
  using (get_my_role() = 'admin');

-- ── USER ROLES ────────────────────────────────────────────
-- Solo el propio usuario puede ver su rol
create policy "user: ver propio rol"
  on user_roles for select
  using (user_id = auth.uid());

-- Solo admin puede gestionar roles
create policy "admin: gestionar roles"
  on user_roles for all
  using (get_my_role() = 'admin');

-- ── RANKING VIEW ──────────────────────────────────────────
-- Vista pública (no necesita RLS, filtra is_blocked internamente)
grant select on ranking_view to anon, authenticated;
grant select on user_roles    to authenticated;

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index idx_participants_user_id    on participants(user_id);
create index idx_participants_dni        on participants(dni);
create index idx_participants_email         on participants(email);
create index idx_participants_license_plate on participants(license_plate);
create index idx_participants_points     on participants(total_points desc);
create index idx_predictions_participant on predictions(participant_id);
create index idx_predictions_match       on predictions(match_id);
create index idx_matches_date            on matches(match_date);
create index idx_matches_locked          on matches(predictions_locked) where predictions_locked = false;

-- ============================================================
-- CRON JOB: bloquear partidos automáticamente
-- Requiere pg_cron habilitado en Supabase
-- Ejecutar en: Dashboard > Database > Extensions > pg_cron
-- ============================================================
-- select cron.schedule('lock-matches', '* * * * *', 'select lock_started_matches()');
