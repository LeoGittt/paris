-- ============================================================
-- Migración 013: Excluir empleados del ranking general
-- Los empleados tienen su propio ranking en employee_ranking_view.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE OR REPLACE VIEW ranking_view AS
SELECT
  p.id                                                        AS participant_id,
  p.first_name,
  p.last_name,
  p.total_points,
  COUNT(pr.id) FILTER (WHERE pr.result = 'correct_exact')    AS correct_exact,
  COUNT(pr.id) FILTER (WHERE pr.result = 'correct_winner')   AS correct_winner,
  RANK() OVER (ORDER BY p.total_points DESC)                  AS ranking_position
FROM participants p
LEFT JOIN predictions pr ON pr.participant_id = p.id
WHERE p.is_blocked = false
  AND (p.is_employee = false OR p.is_employee IS NULL)
GROUP BY p.id, p.first_name, p.last_name, p.total_points;

-- Mantener permisos
GRANT SELECT ON ranking_view TO authenticated, anon;
