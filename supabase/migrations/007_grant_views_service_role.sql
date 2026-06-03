-- Migración 007: GRANTs explícitos para service_role en vistas y tablas nuevas
-- EJECUTAR en Supabase SQL Editor
--
-- Problema: GRANT ALL ON ALL TABLES IN SCHEMA public (migración 004) solo aplica
-- a los objetos existentes en ese momento. Vistas creadas después (metrics.sql,
-- migration 002, etc.) no heredan el grant automáticamente.
-- Los cron jobs usan service_role — si no tienen acceso a las vistas de métricas,
-- los reports fallan silenciosamente.

-- access_logs (migration 002 no grantó a service_role explícitamente)
GRANT ALL PRIVILEGES ON public.access_logs TO service_role;

-- Vistas de métricas (metrics.sql)
GRANT SELECT ON public.metrics_overview        TO service_role;
GRANT SELECT ON public.metrics_daily           TO service_role;
GRANT SELECT ON public.metrics_by_city         TO service_role;
GRANT SELECT ON public.metrics_predictions     TO service_role;

-- Vistas de accesos (migration 002)
GRANT SELECT ON public.metrics_access_daily    TO service_role;
GRANT SELECT ON public.metrics_access_overview TO service_role;

-- report_snapshots (migration 003)
GRANT ALL PRIVILEGES ON public.report_snapshots TO service_role;

-- Asegurar grants futuros con ALTER DEFAULT PRIVILEGES
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
