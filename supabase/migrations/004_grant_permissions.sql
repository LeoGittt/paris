-- Migración 004: GRANTs de permisos
-- EJECUTAR en Supabase SQL Editor
--
-- Problema: las tablas fueron creadas via SQL sin GRANTs explícitos.
-- PostgREST necesita GRANTs a nivel de tabla además de las RLS policies.
-- sin estos GRANTs, service_role (admin SDK) y anon no pueden acceder.

-- ─── service_role: acceso total (bypasea RLS vía código de server) ───────────
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ─── authenticated: acceso a las tablas que necesita el participante ─────────
GRANT SELECT, INSERT, UPDATE ON public.participants  TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.predictions   TO authenticated;
GRANT SELECT ON public.matches                       TO authenticated;
GRANT SELECT ON public.prizes                        TO authenticated;
GRANT SELECT ON public.point_config                  TO authenticated;
GRANT SELECT ON public.user_roles                    TO authenticated;
GRANT SELECT ON public.access_logs                   TO authenticated;

-- ─── anon: acceso público (landing, ranking, premios sin login) ───────────────
GRANT SELECT ON public.matches     TO anon;
GRANT SELECT ON public.prizes      TO anon;

-- ─── vistas ──────────────────────────────────────────────────────────────────
GRANT SELECT ON public.ranking_view TO authenticated, anon, service_role;

-- ─── secuencias (necesarias para INSERT con SERIAL) ──────────────────────────
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
