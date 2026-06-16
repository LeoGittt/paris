-- Migración 016: Solo sumar puntos en partidos donde juega Argentina
--
-- Regla de negocio: el prode es de Argentina, los puntos solo cuentan
-- cuando Argentina es uno de los dos equipos del partido.
-- Partidos de otros países pueden existir en el fixture pero no suman puntos.

create or replace function recalculate_points(p_match_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_score1     integer;
  v_score2     integer;
  v_team1      text;
  v_team2      text;
  v_winner     integer;
  v_config     record;
  v_pred       record;
  v_points     integer;
  v_result     pred_result;
  v_diff_real  integer;
  v_diff_pred  integer;
  v_argentina  boolean;
begin
  select score1, score2, team1, team2
    into v_score1, v_score2, v_team1, v_team2
  from matches
  where id = p_match_id and is_finished = true;

  if not found then
    raise exception 'Partido no encontrado o no finalizado';
  end if;

  -- Solo cuentan puntos los partidos donde juega Argentina
  v_argentina := (v_team1 = 'Argentina' or v_team2 = 'Argentina');

  select * into v_config from point_config limit 1;

  v_winner := case
    when v_score1 > v_score2 then 1
    when v_score2 > v_score1 then 2
    else 0
  end;

  v_diff_real := abs(v_score1 - v_score2);

  for v_pred in
    select * from predictions where match_id = p_match_id
  loop
    v_points := 0;
    v_result := 'wrong';

    if v_argentina then
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

        if v_pred.predicted_score1 = v_score1 and v_pred.predicted_score2 = v_score2 then
          v_points := v_config.correct_exact;
          v_result := 'correct_exact';
        elsif v_pred_winner = v_winner then
          if v_pred_diff = v_diff_real then
            v_points := v_config.correct_diff;
            v_result := 'correct_diff';
          else
            v_points := v_config.correct_winner;
            v_result := 'correct_winner';
          end if;
        end if;
      end;
    end if;

    update predictions
    set points_earned = v_points,
        result        = v_result,
        updated_at    = now()
    where id = v_pred.id;
  end loop;

  -- Actualizar total_points de los participantes afectados
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

  -- Resetear ranking_position de bloqueados y empleados
  update participants
  set ranking_position = null
  where is_blocked = true;

  -- Recalcular posiciones de NO bloqueados y NO empleados
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
